// Logic for the Cart Page (Checkout & Modals)
import { auth } from "./firebase-config.js";

// 1. MAIN CHECKOUT CONTROLLER
// Attached to window so HTML onclick attributes can find it
window.attemptCheckout = function() {
    console.log("Checking auth status...", auth.currentUser);

    // Check if user is logged in using the imported auth object
    if (!auth.currentUser) {
        // Not logged in -> Show Auth Modal
        document.getElementById('auth-modal').classList.remove('hidden');
    } else {
        // Logged in -> Show Payment Modal
        document.getElementById('payment-modal').classList.remove('hidden');
    }
}

// 2. Modal Closers
window.closeAuthModal = function() {
    document.getElementById('auth-modal').classList.add('hidden');
}

window.closePaymentModal = function() {
    document.getElementById('payment-modal').classList.add('hidden');
}

// 3. Coinbase Trigger
document.addEventListener('DOMContentLoaded', () => {
    const btnCoinbase = document.getElementById('btn-pay-coinbase');
    
    if (btnCoinbase) {
        btnCoinbase.addEventListener('click', async () => {
            const cart = window.getCart ? window.getCart() : [];
            const user = auth.currentUser; // Use imported auth
            
            const originalHTML = btnCoinbase.innerHTML;
            btnCoinbase.innerHTML = '<div class="flex items-center gap-3 justify-center w-full"><i class="fa-solid fa-circle-notch fa-spin"></i> <span>Generating Invoice...</span></div>';
            btnCoinbase.classList.add('pointer-events-none');

            if (window.createCoinbaseCharge) {
                await window.createCoinbaseCharge(cart, user);
            } else {
                console.error("Coinbase script not loaded");
                alert("Payment gateway offline.");
                btnCoinbase.innerHTML = originalHTML;
                btnCoinbase.classList.remove('pointer-events-none');
            }
        });
    }
});