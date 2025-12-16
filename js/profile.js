// --- PROFILE & SUBSCRIPTION LOGIC ---
import { db, auth } from "./firebase-config.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Global var to store the UID pending cancellation
let pendingCancelUid = null;

async function initProfile() {
    // 1. Initialize Auth Listeners
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            await fetchSubscriptionData(user.uid);
        } else {
            // Show "Sign In Required" state
            document.getElementById('no-subscription').classList.remove('hidden');
            document.getElementById('no-subscription').innerHTML = `
                <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <i class="fa-solid fa-lock text-2xl"></i>
                </div>
                <h3 class="text-lg font-bold text-page-heading">Sign In Required</h3>
                <p class="text-page-text mb-6 text-sm">Please sign in to view your subscription.</p>
                <a href="auth.html" class="inline-block bg-brand-500 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-brand-600 transition-all">Sign In</a>
            `;
        }
    });

    // 2. Attach Modal Listeners (Done once)
    const confirmBtn = document.getElementById('confirm-cancel-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', performCancellation);
    }
}

async function fetchSubscriptionData(uid) {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        const subCard = document.getElementById('subscription-card');
        const noSub = document.getElementById('no-subscription');
        const ledgerBody = document.getElementById('ledger-body');

        // Check if subscription exists AND is active
        if (docSnap.exists() && docSnap.data().subscription && docSnap.data().subscription.status === 'Active') {
            const sub = docSnap.data().subscription;
            
            // 1. Show Card
            subCard.classList.remove('hidden');
            noSub.classList.add('hidden');

            // 2. Find Plan Details
            const planDetails = window.membershipPlans ? window.membershipPlans.find(p => p.id === sub.planId) : null;
            const planTitle = planDetails ? planDetails.title : sub.planId;

            // 3. Format Dates
            const startDate = new Date(sub.startDate);
            const renewDate = new Date(startDate);
            if(sub.billing === 'yearly') renewDate.setFullYear(renewDate.getFullYear() + 1);
            else renewDate.setMonth(renewDate.getMonth() + 1);

            // 4. Populate UI
            document.getElementById('sub-plan-name').innerText = planTitle;
            document.getElementById('sub-billing-cycle').innerText = `Billed ${sub.billing}`;
            document.getElementById('sub-renew-date').innerText = renewDate.toLocaleDateString();
            document.getElementById('sub-price').innerText = sub.price === 0 ? 'Free' : `$${sub.price}`;
            
            // Reset Status Indicator
            const indicator = document.getElementById('sub-status-indicator');
            const statusText = document.getElementById('sub-status-text');
            indicator.className = "w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm";
            statusText.className = "text-green-600 text-xs font-bold uppercase tracking-wider";
            statusText.innerText = 'Active';

            // 5. Populate Ledger
            ledgerBody.innerHTML = `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4">${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}</td>
                    <td class="px-6 py-4 font-bold text-page-heading">${planTitle} Subscription</td>
                    <td class="px-6 py-4">$${sub.price}</td>
                    <td class="px-6 py-4"><span class="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold border border-green-200">PAID</span></td>
                    <td class="px-6 py-4 text-right text-gray-400">#INV-${Math.floor(Math.random() * 100000)}</td>
                </tr>
            `;

            // 6. SETUP CANCEL BUTTON
            const cancelBtn = document.getElementById('trigger-cancel-btn');
            if (cancelBtn) {
                // Store UID for the modal
                pendingCancelUid = uid;
                // Use a fresh listener to avoid duplicates if re-rendered, 
                // but since we are replacing content or init logic, just one generic listener calling requestCancellation is safer.
                cancelBtn.onclick = () => requestCancellation();
            }

        } else {
            // No Active Subscription
            subCard.classList.add('hidden');
            noSub.classList.remove('hidden');
            ledgerBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-400">No active transactions found.</td></tr>';
        }

    } catch (error) {
        console.error("Error fetching profile:", error);
    }
}

// Open Modal
function requestCancellation() {
    document.getElementById('cancel-modal').classList.remove('hidden');
}

// Perform Firestore Update (Called by Modal)
async function performCancellation() {
    if (!pendingCancelUid) return;

    const btn = document.getElementById('confirm-cancel-btn');
    const originalText = btn.innerText;
    
    try {
        btn.innerText = "Canceling...";
        btn.disabled = true;

        const docRef = doc(db, "users", pendingCancelUid);
        
        // Update Firestore: Set status to Canceled
        await updateDoc(docRef, {
            "subscription.status": "Canceled",
            "subscription.canceledAt": new Date().toISOString()
        });

        // Close modal
        document.getElementById('cancel-modal').classList.add('hidden');
        
        // Refresh UI
        await fetchSubscriptionData(pendingCancelUid);
        
        // Optional: Show success alert
        // alert("Subscription canceled successfully.");

    } catch (error) {
        console.error("Cancellation Error:", error);
        alert("Failed to cancel subscription. Please try again.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// Start
initProfile();