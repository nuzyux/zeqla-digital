import { auth } from "./firebase-config.js";
import { 
    onAuthStateChanged, 
    signOut, 
    signInWithPopup, 
    GoogleAuthProvider, 
    GithubAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- 1. GLOBAL STATE LISTENER ---
onAuthStateChanged(auth, (user) => {
    renderNavAuth(user);
});

// --- 2. RENDER NAVIGATION ---
function renderNavAuth(user) {
    const navContainer = document.getElementById('nav-auth-section');
    
    const inPagesDir = window.location.pathname.includes('/pages/');
    const pathToAuth = inPagesDir ? 'auth.html' : 'pages/auth.html';
    const pathToProfileProducts = inPagesDir ? 'profile-products.html' : 'pages/profile-products.html';
    const pathToProfileSettings = inPagesDir ? 'profile-settings.html' : 'pages/profile-settings.html';
    const pathToProfilePayments = inPagesDir ? 'profile-payments.html' : 'pages/profile-payments.html';
    const pathToPersonalID = inPagesDir ? 'personal.html' : 'pages/personal.html'; 
    const pathToIndex = inPagesDir ? '../index.html' : 'index.html';

    if (navContainer) {
        if (user) {
            // LOGGED IN
            const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'U';
            
            navContainer.innerHTML = `
                <div class="relative">
                    <button id="user-menu-btn" class="flex items-center gap-2 focus:outline-none">
                        <div class="w-9 h-9 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-600 font-bold text-sm shadow-sm hover:shadow-md transition-all">
                            ${userInitial}
                        </div>
                        <span class="text-sm font-medium text-page-heading hidden lg:block">My Account</span>
                        <i class="fa-solid fa-chevron-down text-xs text-page-text hidden lg:block ml-1"></i>
                    </button>

                    <!-- Dropdown -->
                    <div id="user-dropdown" class="hidden absolute right-0 mt-3 w-56 bg-white border border-page-border rounded-xl shadow-lg py-2 z-50 animate-slideUp origin-top-right">
                        <div class="px-4 py-3 border-b border-page-border mb-2">
                            <p class="text-xs text-page-text">Signed in as</p>
                            <p class="text-sm font-bold text-page-heading truncate">${user.email}</p>
                        </div>
                        
                        <!-- UPDATED: Terminology Change -->
                        <a href="${pathToPersonalID}" class="block px-4 py-2 text-sm text-page-heading hover:bg-page-bg hover:text-brand-600 transition-colors">
                            <i class="fa-solid fa-wallet w-5 text-center mr-2 text-page-text"></i> Wallet
                        </a>

                        <a href="${pathToProfileProducts}" class="block px-4 py-2 text-sm text-page-heading hover:bg-page-bg hover:text-brand-600 transition-colors">
                            <i class="fa-solid fa-box-open w-5 text-center mr-2 text-page-text"></i> My Library
                        </a>
                        <a href="${pathToProfilePayments}" class="block px-4 py-2 text-sm text-page-heading hover:bg-page-bg hover:text-brand-600 transition-colors">
                            <i class="fa-solid fa-credit-card w-5 text-center mr-2 text-page-text"></i> Payments
                        </a>
                        <a href="${pathToProfileSettings}" class="block px-4 py-2 text-sm text-page-heading hover:bg-page-bg hover:text-brand-600 transition-colors">
                            <i class="fa-solid fa-gear w-5 text-center mr-2 text-page-text"></i> Settings
                        </a>
                        
                        <div class="border-t border-page-border mt-2 pt-2">
                            <button id="btn-signout" class="w-full text-left block px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                                <i class="fa-solid fa-right-from-bracket w-5 text-center mr-2"></i> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Dropdown Logic
            const btn = document.getElementById('user-menu-btn');
            const dropdown = document.getElementById('user-dropdown');
            
            if (btn && dropdown) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdown.classList.toggle('hidden');
                });
                document.addEventListener('click', (e) => {
                    if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
                        dropdown.classList.add('hidden');
                    }
                });
            }
            document.getElementById('btn-signout')?.addEventListener('click', () => handleSignOut(pathToIndex));

        } else {
            // LOGGED OUT
            navContainer.innerHTML = `
                <div class="flex items-center gap-6">
                    <a href="${pathToAuth}" class="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Sign In</a>
                    <a href="${pathToAuth}" class="relative group">
                        <div class="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
                        <button class="relative px-6 py-2.5 bg-brand-600 rounded-full leading-none flex items-center gap-2 transition-transform duration-200 group-hover:-translate-y-0.5">
                            <span class="text-white text-sm font-bold">Get Started</span>
                            <i class="fa-solid fa-arrow-right text-white text-xs opacity-70 group-hover:translate-x-1 transition-transform"></i>
                        </button>
                    </a>
                </div>
            `;
        }
    }

    // Mobile Menu
    const mobileAuthContainer = document.querySelector('#mobile-menu .border-t');
    if (mobileAuthContainer) {
        if (user) {
            mobileAuthContainer.innerHTML = `
                <div class="px-3 py-3 space-y-3">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-lg">
                            ${user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div class="flex-1 overflow-hidden">
                            <div class="text-sm font-bold text-page-heading truncate">${user.displayName || 'User'}</div>
                            <div class="text-xs text-page-text truncate">${user.email}</div>
                        </div>
                    </div>
                    
                    <a href="${pathToPersonalID}" class="block px-3 py-2 rounded-md text-base font-medium text-page-heading hover:bg-page-bg">Wallet</a>
                    <a href="${pathToProfileProducts}" class="block px-3 py-2 rounded-md text-base font-medium text-page-heading hover:bg-page-bg">My Library</a>
                    <a href="${pathToProfilePayments}" class="block px-3 py-2 rounded-md text-base font-medium text-page-heading hover:bg-page-bg">Payments</a>
                    <a href="${pathToProfileSettings}" class="block px-3 py-2 rounded-md text-base font-medium text-page-heading hover:bg-page-bg">Settings</a>
                    
                    <button id="btn-signout-mobile" class="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-red-50">
                        Sign Out
                    </button>
                </div>
            `;
            document.getElementById('btn-signout-mobile')?.addEventListener('click', () => handleSignOut(pathToIndex));
        } else {
            mobileAuthContainer.innerHTML = `
                <div class="flex items-center gap-3 px-3 py-3">
                    <a href="${pathToAuth}" class="flex-1 text-center py-2.5 rounded-lg border border-page-border text-page-heading font-semibold text-sm hover:bg-page-bg transition-colors">Sign In</a>
                    <a href="${pathToAuth}" class="flex-1 text-center py-2.5 rounded-lg bg-brand-600 text-white font-bold text-sm shadow-md hover:bg-brand-700 transition-colors">Get Started</a>
                </div>
            `;
        }
    }
}

async function handleSignOut(redirectPath) {
    try {
        await signOut(auth);
        window.location.href = redirectPath;
    } catch (error) {
        console.error("Sign Out Error", error);
    }
}

// ... (Rest of Auth Logic for Login/Register remains same) ...
document.addEventListener('DOMContentLoaded', () => {
    const googleBtn = document.getElementById('btn-google');
    const githubBtn = document.getElementById('btn-github');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            try {
                const provider = new GoogleAuthProvider();
                await signInWithPopup(auth, provider);
                window.location.href = 'profile-products.html';
            } catch (error) {
                console.error("Google Auth Error:", error);
                alert("Google Sign In Failed: " + error.message);
            }
        });
    }

    if (githubBtn) {
        githubBtn.addEventListener('click', async () => {
            try {
                const provider = new GithubAuthProvider();
                await signInWithPopup(auth, provider);
                window.location.href = 'profile-products.html';
            } catch (error) {
                console.error("GitHub Auth Error:", error);
                alert("GitHub Sign In Failed: " + error.message);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;
            const btn = loginForm.querySelector('button');
            const originalText = btn.innerText;

            try {
                btn.innerText = "Signing In...";
                btn.disabled = true;
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = 'profile-products.html';
            } catch (error) {
                alert("Login Failed: " + error.message);
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputs = registerForm.querySelectorAll('input');
            const displayName = inputs[0].value;
            const email = inputs[1].value;
            const password = inputs[2].value;
            const btn = registerForm.querySelector('button');
            const originalText = btn.innerText;

            try {
                btn.innerText = "Creating Account...";
                btn.disabled = true;
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: displayName });
                window.location.href = 'profile-products.html';
            } catch (error) {
                alert("Registration Failed: " + error.message);
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }
});