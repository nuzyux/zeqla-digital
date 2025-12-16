// Key for localStorage
const CART_KEY = 'zeqla_cart';

// --- CORE FUNCTIONS ---

/**
 * Retrieves cart from local storage
 * @returns {Array} Array of product objects
 */
function getCart() {
    const cartJson = localStorage.getItem(CART_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
}

/**
 * Saves cart array to local storage
 * @param {Array} cart 
 */
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
}

/**
 * Adds a product (or subscription) to the cart
 * @param {String|Number} itemId - The ID (product ID or plan ID)
 * @param {HTMLElement} btnElement - The button clicked
 * @param {String} type - 'product' or 'plan' (optional, infers from data if null)
 */
function addToCart(itemId, btnElement, type = 'product') {
    console.log(`Attempting to add ${type}:`, itemId);

    let cart = getCart();
    let itemToAdd = null;

    // 1. Identify the item source
    if (type === 'plan') {
        // Check if a plan is already in cart (Logic: usually 1 plan per user)
        const existingPlan = cart.find(i => i.type === 'plan');
        if (existingPlan) {
            if(!confirm(`You already have the "${existingPlan.title}" in your cart. Replace it?`)) return;
            cart = cart.filter(i => i.type !== 'plan'); // Remove old plan
        }
        
        // Find plan in global data
        const plan = window.membershipPlans.find(p => p.id === itemId);
        if (!plan) return showToast("Plan data not found.", "error");

        // Construct cart item for plan
        // Check pricing toggle state from DOM if available, default to monthly
        const isYearly = document.getElementById('billing-toggle')?.checked || false;
        const price = isYearly ? plan.price.yearly : plan.price.monthly;
        const period = isYearly ? 'yr' : 'mo';

        itemToAdd = {
            id: plan.id,
            title: `${plan.title} Plan`,
            price: price,
            image: "https://placehold.co/100x100/3B82F6/ffffff?text=PLAN", // Placeholder icon
            category: "Subscription",
            period: period,
            type: 'plan'
        };

    } else {
        // Standard Product Logic (Paid AND Free)
        // Ensure both lists exist to prevent errors
        const paidProducts = window.products || [];
        const freeProducts = window.openSourceTools || [];
        const allProducts = [...paidProducts, ...freeProducts];
        
        const product = allProducts.find(p => String(p.id) === String(itemId));
        
        if (!product) {
            showToast("Error: Product not found.", "error");
            console.error("Product ID not found in data:", itemId);
            return;
        }

        itemToAdd = { ...product, type: 'product' }; // Ensure type is set
    }

    // 2. Check duplicates
    const exists = cart.find(item => String(item.id) === String(itemId) && item.type !== 'plan');
    if (exists) {
        showToast("Item already in cart!", "info");
        return;
    }

    // 3. Add to cart array
    cart.push(itemToAdd);
    saveCart(cart);
    
    // 4. Feedback
    showToast(`Added ${itemToAdd.title} to cart`, "success");
    
    // 5. Update Button UI
    if (btnElement) {
        const originalText = btnElement.innerText;
        btnElement.innerText = "Added!";
        btnElement.classList.remove('bg-brand-500', 'bg-white', 'text-dark-bg');
        btnElement.classList.add('bg-green-500', 'text-white', 'border-none');
        
        setTimeout(() => {
            btnElement.innerText = originalText;
            btnElement.classList.remove('bg-green-500', 'text-white', 'border-none');
            // Restore based on context
            if (btnElement.closest('.popular-card-glow')) {
                btnElement.classList.add('bg-brand-500', 'text-white');
            } else {
                // Heuristic reset
                btnElement.classList.add('text-brand-600');
            }
        }, 2000);
    }
}

/**
 * Removes an item from the cart
 */
function removeFromCart(itemId) {
    let cart = getCart();
    cart = cart.filter(item => String(item.id) !== String(itemId));
    saveCart(cart);
    
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    }
    updateCartBadge();
}

/**
 * Updates the red badge on the navbar
 */
function updateCartBadge() {
    const cart = getCart();
    const badges = document.querySelectorAll('#cart-count'); 
    badges.forEach(badge => {
        badge.innerText = cart.length;
        badge.classList.toggle('hidden', cart.length === 0);
    });
}

/**
 * Simple Toast Notification
 */
function showToast(message, type = "success") {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;";
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgClass = type === "success" ? "bg-green-500" : (type === "error" ? "bg-red-500" : "bg-brand-500");
    toast.className = `${bgClass} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slideUp`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check' : 'fa-info-circle'}"></i><span class="font-medium text-sm">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// --- INITIALIZATION ---
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.getCart = getCart;

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    }
});

// --- CART PAGE RENDER LOGIC ---
function renderCartPage() {
    const cartContainer = document.getElementById('cart-items-container');
    const summaryContainer = document.getElementById('cart-summary');
    
    if (!cartContainer || !summaryContainer) return;

    const cart = getCart();

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="text-center py-12">
                <div class="w-16 h-16 bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-4 border border-dark-border text-gray-500">
                    <i class="fa-solid fa-cart-shopping text-2xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <a href="products.html" class="inline-block bg-brand-500 hover:bg-brand-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">Start Shopping</a>
            </div>`;
        summaryContainer.style.display = 'none';
        return;
    }

    summaryContainer.style.display = 'block';

    cartContainer.innerHTML = cart.map(item => `
        <div class="flex items-center gap-4 py-4 border-b border-dark-border last:border-0">
            <div class="w-20 h-20 bg-dark-bg rounded-lg overflow-hidden flex-shrink-0 border border-dark-border flex items-center justify-center">
                <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
            </div>
            <div class="flex-grow">
                <div class="flex justify-between items-start">
                    <h3 class="font-bold text-gray-900 text-lg hover:text-brand-500 transition-colors">${item.title}</h3>
                    <span class="font-bold text-gray-900">${item.price === 0 ? 'Free' : '$' + item.price}</span>
                </div>
                <p class="text-xs text-gray-500 mb-2">${item.category} • ${item.type === 'plan' ? 'Recurring' : 'Lifetime License'}</p>
                <button onclick="removeFromCart('${item.id}')" class="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
                    <i class="fa-solid fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `).join('');

    const subtotal = cart.reduce((sum, item) => sum + Number(item.price), 0);
    document.getElementById('summary-subtotal').innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById('summary-total').innerText = `$${subtotal.toFixed(2)}`;
}