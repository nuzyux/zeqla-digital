import { db } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.getElementById('seller-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('submit-btn');
    const originalText = btn.innerHTML;
    
    // Gather Data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const portfolio = document.getElementById('portfolio').value;
    const experience = document.getElementById('experience').value;
    const productIntent = document.getElementById('intent_products').value;
    const motivation = document.getElementById('intent_motivation').value;
    
    // Get Checked Checkboxes
    const stack = [];
    document.querySelectorAll('input[name="stack"]:checked').forEach(cb => stack.push(cb.value));

    try {
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';
        btn.disabled = true;

        await addDoc(collection(db, "requests"), {
            type: "seller_application",
            fullName: name,
            email: email,
            portfolioUrl: portfolio,
            experienceLevel: experience,
            techStack: stack,
            productIntent: productIntent,
            motivation: motivation,
            status: "pending",
            submittedAt: serverTimestamp() // Server time
        });

        // Show Success
        document.getElementById('success-modal').classList.remove('hidden');

    } catch (error) {
        console.error("Error submitting application:", error);
        // Using alert since custom modal setup might be complex for submission failure
        alert("Submission failed. Please try again or contact support.");
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

// --- NEW MODAL LOGIC ---

/**
 * Opens the full-screen seller terms modal.
 */
window.openTermsModal = function() {
    document.getElementById('terms-modal').classList.remove('hidden');
    // Ensure scrolling is disabled on the body behind the modal if needed
    document.body.style.overflow = 'hidden'; 
};

/**
 * Closes the full-screen seller terms modal.
 */
window.closeTermsModal = function() {
    document.getElementById('terms-modal').classList.add('hidden');
    // Re-enable scrolling
    document.body.style.overflow = '';
};