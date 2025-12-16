// IMPORT FIREBASE
import { db } from "./firebase-config.js";
import { collection, onSnapshot, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

function initApp() {
    window.products = []; 
    
    const grids = [
        document.getElementById('featured-grid'), 
        document.getElementById('all-products-grid'),
        document.getElementById('opensource-grid'),
        document.getElementById('oneday-carousel-track')
    ];

    // Show loading spinners in all grids
    grids.forEach(g => {
        if(g) g.innerHTML = '<div class="col-span-full py-20 text-center text-page-text"><i class="fa-solid fa-circle-notch fa-spin text-2xl mb-2"></i><p>Syncing inventory...</p></div>';
    });

    fetchCategoriesAndRenderFilters();

    // SINGLE SOURCE OF TRUTH: Firestore
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
        const freshProducts = [];
        snapshot.forEach((doc) => {
            freshProducts.push({ id: doc.id, ...doc.data() });
        });
        
        window.products = freshProducts;
        renderApp();
    }, (error) => {
        console.error("Firestore Error:", error);
        grids.forEach(g => {
            if(g) g.innerHTML = '<div class="col-span-full py-10 text-center text-red-400">Database connection failed.</div>';
        });
    });

    injectInfoModal();
}

// ... (Categories logic remains largely the same) ...
async function fetchCategoriesAndRenderFilters() {
    const filterContainer = document.getElementById('product-filters');
    if (!filterContainer) return;

    // We can fetch real categories or use static ones. 
    // Ideally fetch from Firestore 'categories' collection for consistency with Admin.
    const categories = ['Templates', 'UI Kits', 'Scripts', 'Mini Apps', 'Tools'];
    
    // ... (HTML generation for filters remains same) ...
    let html = `
        <button class="filter-btn active px-5 py-2.5 bg-brand-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-md transition-all" data-category="all">
            All Systems
        </button>
        <button class="filter-btn px-5 py-2.5 bg-white border border-page-border text-green-600 hover:text-green-700 hover:border-green-300 rounded-lg font-bold text-xs uppercase tracking-wider transition-all" data-category="free">
            <i class="fa-solid fa-gift mr-1"></i> Free / Open Source
        </button>
    `;
    categories.forEach(cat => {
        html += `<button class="filter-btn px-5 py-2.5 bg-white border border-page-border text-page-text hover:text-page-heading hover:border-gray-300 rounded-lg font-bold text-xs uppercase tracking-wider transition-all" data-category="${cat}">${cat}</button>`;
    });
    filterContainer.innerHTML = html;
    initFilters();
}

// --- 3. RENDER LOGIC (UPDATED) ---
function renderApp() {
    const featuredGrid = document.getElementById('featured-grid');
    const allProductsGrid = document.getElementById('all-products-grid');
    const onedayTrack = document.getElementById('oneday-carousel-track');
    const openSourceGrid = document.getElementById('opensource-grid');
    const productDetailContainer = document.getElementById('product-detail-container');

    // Segregate Data
    const allItems = window.products || [];
    const oneDayItems = allItems.filter(p => p.type === 'oneday');
    const freeItems = allItems.filter(p => p.type === 'free' || p.price === 0);
    const paidDigital = allItems.filter(p => (p.type === 'digital' || !p.type) && p.price > 0);

    // A. One-Day Websites Carousel
    if (onedayTrack) {
        if(oneDayItems.length === 0) {
            onedayTrack.innerHTML = '<div class="w-full text-center py-10 text-gray-400 italic">No Enterprise Packages Available</div>';
        } else {
            onedayTrack.innerHTML = oneDayItems.map(p => `
                <div class="min-w-[280px] md:min-w-[300px] lg:min-w-[24%] bg-white border border-page-border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all snap-start flex-shrink-0 group">
                    <div class="relative aspect-video overflow-hidden bg-gray-100">
                        <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span class="text-white font-bold text-sm tracking-wide border border-white px-4 py-1 rounded-sm backdrop-blur-sm">Quick View</span>
                        </div>
                    </div>
                    <div class="p-4">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <div class="text-[10px] font-bold text-brand-500 uppercase tracking-wider mb-1">${p.category}</div>
                                <h3 class="font-bold text-page-heading text-base truncate">${p.title}</h3>
                            </div>
                            <span class="font-bold text-page-heading text-sm">$${p.price}</span>
                        </div>
                        <a href="pages/product-detail.html?id=${p.id}" class="text-xs font-bold text-page-text hover:text-brand-500 flex items-center gap-1 mt-2">
                            Details <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            `).join('');
            setupCarouselButtons();
        }
    }

    // B. Featured (Top 4 Paid)
    if (featuredGrid) {
        const featured = paidDigital.slice(0, 4);
        if (featured.length === 0) featuredGrid.innerHTML = '<div class="col-span-full text-center text-gray-400">No featured items.</div>';
        else featuredGrid.innerHTML = featured.map(p => getProductCardHTML(p, false)).join('');
    }

    // C. Open Source
    if (openSourceGrid) {
        if (freeItems.length === 0) openSourceGrid.innerHTML = '<div class="col-span-full text-center text-slate-500 italic">No open source tools listed yet.</div>';
        else openSourceGrid.innerHTML = freeItems.map(p => getProductCardHTML(p, false)).join('');
    }

    // D. All Products Grid (Main Catalog)
    if (allProductsGrid) {
        // By default show paid digital
        renderGrid(paidDigital); 
    }

    // E. Product Detail
    if (productDetailContainer) {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id'); 
        const product = allItems.find(p => p.id === productId);

        if (product) {
            productDetailContainer.innerHTML = getProductDetailHTML(product);
            document.title = `${product.title} | Zeqla`;
        } else {
            productDetailContainer.innerHTML = `<div class="text-center py-20"><h2>Product Not Found</h2><a href="products.html" class="text-brand-600">Return to Store</a></div>`;
        }
    }
}

// ... (Rest of functions: renderGrid, getProductCardHTML, getProductDetailHTML, initFilters, setupCarouselButtons remain the same as previous step) ...
// Ensure they use the segregated lists logic if needed inside renderGrid.

function renderGrid(list) {
    const grid = document.getElementById('all-products-grid');
    if(!grid) return;
    if (list.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400">No products found.</div>';
        return;
    }
    grid.innerHTML = list.map(p => getProductCardHTML(p, true)).join('');
}

// ... (Helper functions from previous app.js) ...
function setupCarouselButtons() { /* ... */ }
function getProductCardHTML(product, isRel) { /* Same as before */ 
    const linkPath = isRel ? `product-detail.html?id=${product.id}` : `pages/product-detail.html?id=${product.id}`;
    const imageSrc = product.image || 'https://placehold.co/600x400';
    const isFree = product.price === 0 || product.type === 'free';
    // ... render template ...
    return `
        <div class="bg-white border border-page-border group flex flex-col h-full hover:border-brand-500 transition-colors duration-200 rounded-md overflow-hidden shadow-sm">
            <a href="${linkPath}" class="block relative w-full aspect-video overflow-hidden cursor-pointer bg-gray-100">
                <img src="${imageSrc}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                ${product.badge ? `<span class="absolute top-2 left-2 ${isFree ? 'bg-green-500' : 'bg-brand-600'} text-white text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wider shadow-sm rounded-sm">${product.badge}</span>` : ''}
            </a>
            <div class="p-3 flex flex-col flex-grow">
                <div class="flex justify-between items-start mb-1">
                    <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">${product.category}</span>
                    <div class="flex items-center gap-1 text-yellow-500 text-[10px]"><i class="fa-solid fa-star text-[9px]"></i> 5.0</div>
                </div>
                <a href="${linkPath}" class="block mb-1.5"><h3 class="text-base font-bold text-page-heading group-hover:text-brand-600 transition-colors truncate">${product.title}</h3></a>
                <div class="mt-auto pt-2 border-t border-page-border flex justify-between items-center">
                    <span class="text-lg font-bold text-page-heading">${isFree ? '<span class="text-green-600">Free</span>' : '$'+product.price}</span>
                    <button onclick="addToCart('${product.id}', this)" class="text-[10px] font-bold ${isFree?'text-green-600 bg-green-50':'text-brand-600 bg-brand-50'} uppercase tracking-wide flex items-center gap-1 px-2 py-1 rounded-sm transition-colors">
                        ${isFree ? 'Get' : 'Add'} <i class="fa-solid ${isFree ? 'fa-download' : 'fa-plus'}"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function getProductDetailHTML(product) {
    const isFree = product.price === 0 || product.type === 'free';
    const imageSrc = product.image || 'https://placehold.co/600x400';
    return `
        <div class="animate-slideUp">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                <div class="border border-gray-200 bg-white"><img src="${imageSrc}" class="w-full h-auto"></div>
                <div class="flex flex-col justify-center">
                    <div class="mb-4 flex items-center gap-3"><span class="px-3 py-1 bg-brand-50 text-brand-600 text-xs font-bold uppercase border border-brand-100">${product.category}</span></div>
                    <h1 class="text-3xl md:text-4xl font-bold text-page-heading mb-4">${product.title}</h1>
                    <div class="text-3xl font-bold text-gray-900 mb-8">${isFree ? 'Free' : '$' + product.price}</div>
                    <p class="text-gray-600 text-lg leading-relaxed mb-8">${product.description || 'No description.'}</p>
                    <button onclick="addToCart('${product.id}', this)" class="flex-1 ${isFree ? 'bg-green-600 hover:bg-green-700' : 'bg-brand-600 hover:bg-brand-700'} text-white px-8 py-4 font-bold text-lg transition-all shadow-lg text-center">
                        ${isFree ? 'Download Now' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (!filterBtns.length) return;
    filterBtns.forEach(btn => {
        btn.onclick = () => {
            filterBtns.forEach(b => {
                b.classList.remove('bg-brand-500', 'text-white', 'shadow-md', 'bg-green-600');
                b.classList.add('bg-white', 'text-page-text', 'border', 'border-page-border');
            });
            const category = btn.getAttribute('data-category');
            btn.classList.remove('bg-white', 'text-page-text', 'border-page-border');
            if(category === 'free') btn.classList.add('bg-green-600', 'text-white');
            else btn.classList.add('bg-brand-500', 'text-white');

            const allItems = window.products || [];
            let list = [];
            if (category === 'all') list = allItems.filter(p => (p.type === 'digital' || !p.type) && p.price > 0);
            else if (category === 'free') list = allItems.filter(p => p.type === 'free' || p.price === 0);
            else list = allItems.filter(p => p.category === category && p.price > 0);
            renderGrid(list);
        };
    });
}

function injectInfoModal() {} // Placeholder
window.openInfoModal = () => {};
window.closeInfoModal = () => {};

const menuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (menuBtn && mobileMenu) menuBtn.onclick = () => mobileMenu.classList.toggle('hidden');

initApp();