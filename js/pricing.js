// IMPORTS
import { db, auth } from "./firebase-config.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { createCoinbaseCharge } from "./coinbase.js"; // Import the real service

document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('billing-toggle');
    const plansContainer = document.getElementById('plans-container');
    const modal = document.getElementById('payment-modal');
    const authModal = document.getElementById('auth-modal');
    const coinbaseBtn = document.getElementById('btn-pay-coinbase');

    // State
    let selectedPlan = null;
    let isYearly = false;

    // 1. Initial Render
    renderPlans();

    // 2. Toggle Listener
    if(toggle) {
        toggle.addEventListener('change', (e) => {
            isYearly = e.target.checked;
            updatePricingText();
            renderPlans();
        });
    }

    function updatePricingText() {
        document.getElementById('text-monthly').classList.toggle('text-page-heading', !isYearly);
        document.getElementById('text-monthly').classList.toggle('text-gray-400', isYearly);
        document.getElementById('text-yearly').classList.toggle('text-page-heading', isYearly);
        document.getElementById('text-yearly').classList.toggle('text-gray-400', !isYearly);
    }

    // 3. Render Function
    function renderPlans() {
        if (!window.membershipPlans) return;

        plansContainer.innerHTML = window.membershipPlans.map(plan => {
            const price = isYearly ? plan.price.yearly : plan.price.monthly;
            const period = isYearly ? '/year' : '/month';
            const savings = isYearly && plan.price.yearly > 0 ? '<span class="text-xs text-green-600 font-bold ml-2">SAVE 17%</span>' : '';
            
            const containerClass = plan.highlight 
                ? 'popular-card-glow transform scale-105 z-10 bg-white shadow-xl' 
                : 'product-card bg-white hover:shadow-lg opacity-100';
            
            const btnClass = plan.highlight
                ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md'
                : 'bg-slate-50 border border-slate-200 hover:bg-white hover:text-brand-600 text-page-heading';

            return `
            <div class="${containerClass} rounded-2xl p-8 flex flex-col transition-all duration-300 relative" id="card-${plan.id}">
                <h3 class="text-xl font-bold text-page-heading mb-2">${plan.title}</h3>
                <p class="text-gray-500 text-sm mb-6 h-10">${plan.description}</p>
                
                <div class="mb-8">
                    <div class="flex items-end gap-1">
                        <span class="text-4xl font-extrabold text-gray-900">$${price}</span>
                        <span class="text-gray-500 mb-1 font-mono">${period}</span>
                        ${savings}
                    </div>
                </div>

                <ul class="feature-list mb-8 flex-grow">
                    ${plan.features.map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join('')}
                </ul>

                <button id="btn-${plan.id}" class="select-plan-btn w-full py-4 rounded-lg font-bold text-sm transition-all duration-300 btn-impulse ${btnClass}" data-id="${plan.id}" data-price="${price}" data-title="${plan.title}">
                    ${plan.buttonText}
                </button>
            </div>
            `;
        }).join('');

        document.querySelectorAll('.select-plan-btn').forEach(btn => {
            btn.addEventListener('click', (e) => handlePlanSelection(e.target));
        });

        checkActiveSubscription();
    }

    // 4. Handle Click
    function handlePlanSelection(btn) {
        if (!auth.currentUser) {
            authModal.classList.remove('hidden');
            return;
        }

        const planId = btn.getAttribute('data-id');
        const price = parseFloat(btn.getAttribute('data-price'));
        const title = btn.getAttribute('data-title');

        selectedPlan = { id: planId, price, title };

        if (price === 0) {
            // Free Plan: Activate Immediately
            activateFreePlan(selectedPlan);
        } else {
            // Paid Plan: Show Modal
            document.getElementById('modal-plan-name').innerText = title;
            document.getElementById('modal-plan-price').innerText = `$${price}`;
            modal.classList.remove('hidden');
        }
    }

    // 5. Activate Free Plan (Immediate)
    async function activateFreePlan(plan) {
        const btn = document.getElementById(`btn-${plan.id}`);
        const originalText = btn.innerText;
        btn.innerText = "Activating...";
        btn.disabled = true;
        
        try {
            const uid = auth.currentUser.uid;
            await setDoc(doc(db, "users", uid), {
                subscription: {
                    planId: plan.id,
                    status: 'Active',
                    startDate: new Date().toISOString(),
                    billing: 'free',
                    price: 0
                },
                lastUpdated: new Date().toISOString()
            }, { merge: true });

            updateUICardToActive(plan.id);
            // In a real app, you might still want a celebration for free tier
            // or just a simple alert.
            alert("Free plan activated! Welcome to Zeqla.");

        } catch (error) {
            console.error("Activation Error:", error);
            alert("Failed to activate plan.");
        } finally {
            if(btn.innerText === "Activating...") btn.innerText = originalText;
            btn.disabled = false;
        }
    }

    // 6. REAL PAYMENT TRIGGER (Coinbase)
    if(coinbaseBtn) {
        coinbaseBtn.addEventListener('click', async () => {
            if (!selectedPlan || !auth.currentUser) return;

            const originalContent = coinbaseBtn.innerHTML;
            coinbaseBtn.innerHTML = '<div class="flex items-center gap-3 justify-center"><i class="fa-solid fa-circle-notch fa-spin"></i> <span>Secure Redirect...</span></div>';
            
            try {
                // Call the real service
                await createCoinbaseCharge(selectedPlan, auth.currentUser);
                // Note: If successful, the page will redirect, so we don't need to reset button state.
            } catch (e) {
                // If it fails (e.g. popup blocker or network error), reset UI
                coinbaseBtn.innerHTML = originalContent;
                alert("Payment initiation failed. Please try again.");
            }
        });
    }

    // 7. Check Existing Subscription
    async function checkActiveSubscription() {
        if (!auth.currentUser) return;
        try {
            const docRef = doc(db, "users", auth.currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().subscription?.status === 'Active') {
                updateUICardToActive(docSnap.data().subscription.planId);
            }
        } catch (e) { console.log("Error fetching subscription:", e); }
    }
    
    // UI Helper
    function updateUICardToActive(planId) {
        document.querySelectorAll('.select-plan-btn').forEach(btn => {
            btn.innerText = "Switch Plan";
            btn.classList.remove('bg-green-600', 'text-white', 'cursor-default');
            btn.classList.add('bg-slate-50', 'text-page-heading');
            btn.disabled = false;
        });
        const activeBtn = document.getElementById(`btn-${planId}`);
        if (activeBtn) {
            activeBtn.innerText = "Active Plan";
            activeBtn.classList.remove('bg-brand-500', 'bg-slate-50', 'text-page-heading');
            activeBtn.classList.add('bg-green-600', 'text-white', 'cursor-default');
        }
    }
    
    auth.onAuthStateChanged((user) => {
        if (user) checkActiveSubscription();
    });
});