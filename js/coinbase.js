// --- SECURE PAYMENT GATEWAY SERVICE ---
// This service replaces direct API calls with secure Cloud Function requests.

// TODO: AFTER DEPLOYMENT, REPLACE THIS URL WITH YOUR REAL FUNCTION URL
// It will look like: https://us-central1-zeqla-digital.cloudfunctions.net/createCoinbaseCharge
const CLOUD_FUNCTION_URL = "YOUR_CLOUD_FUNCTION_URL_HERE"; 

/**
 * Initiates a secure checkout via Firebase Cloud Functions
 * @param {Object} plan - The plan object (id, title, price)
 * @param {Object} user - The authenticated Firebase user object
 */
export async function createCoinbaseCharge(plan, user) {
    if (!user || !user.uid) {
        throw new Error("User must be logged in to create a charge.");
    }

    if (!CLOUD_FUNCTION_URL || CLOUD_FUNCTION_URL.includes("YOUR_CLOUD_FUNCTION_URL_HERE")) {
        alert("System Config Error: Payment Gateway URL not set. Please check console.");
        console.error("CRITICAL: You must deploy the functions and paste the URL into js/coinbase.js");
        return;
    }

    console.log(`Initiating Secure Checkout for: ${plan.title} ($${plan.price})`);

    try {
        // Call our secure backend
        const response = await fetch(CLOUD_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uid: user.uid,
                planId: plan.id,
                title: plan.title,
                price: plan.price
            })
        });

        const data = await response.json();

        if (data.success && data.hosted_url) {
            // REDIRECT USER TO COINBASE SECURE PAGE
            console.log("Redirecting to payment provider...");
            window.location.href = data.hosted_url;
        } else {
            throw new Error(data.error || "Failed to generate checkout link.");
        }

    } catch (error) {
        console.error("Payment Error:", error);
        // User-friendly error handling
        alert("Secure Connection Failed. Please try again or contact support.");
    }
}

// Legacy support for cart checkout (if you still use the cart page separately)
// This adapts the array-based cart logic to the single-plan logic if needed,
// or you can create a separate function 'createCartCharge' in the backend later.
window.createCoinbaseCharge = createCoinbaseCharge;