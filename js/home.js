import { db, auth } from "./firebase-config.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Auth Logic for Root
onAuthStateChanged(auth, (user) => {
    const navAuth = document.getElementById('nav-auth-section');
    if (navAuth) {
        if (user) {
            navAuth.innerHTML = `
                <a href="pages/profile-products.html" class="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm hover:shadow-md transition-all">
                    ${user.email.charAt(0).toUpperCase()}
                </a>
            `;
        } else {
            navAuth.innerHTML = `
                <a href="pages/auth.html" class="text-sm font-bold text-page-text hover:text-page-heading mr-4">Log In</a>
                <a href="pages/auth.html" class="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-700 transition-all shadow-md">Get Started</a>
            `;
        }
    }
});

// Render Logic
function renderFeatured() {
    const grid = document.getElementById('featured-grid');
    if(grid && window.products) {
        const featured = window.products.slice(0, 4);
        grid.innerHTML = featured.map(p => `
            <div class="bg-white border border-page-border group flex flex-col h-full hover:border-brand-500 transition-all duration-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md">
                <a href="pages/product-detail.html?id=${p.id}" class="block relative w-full aspect-video overflow-hidden bg-gray-100">
                    <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    ${p.badge ? `<span class="absolute top-2 left-2 bg-brand-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">${p.badge}</span>` : ''}
                </a>
                <div class="p-4 flex flex-col flex-grow">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">${p.category}</span>
                        <div class="flex items-center gap-1 text-yellow-500 text-[10px]">
                            <i class="fa-solid fa-star"></i>
                            <span class="text-gray-500 font-mono">${p.rating}</span>
                        </div>
                    </div>
                    <a href="pages/product-detail.html?id=${p.id}" class="block mb-2">
                        <h3 class="text-base font-bold text-page-heading group-hover:text-brand-600 transition-colors truncate">${p.title}</h3>
                    </a>
                    <div class="mt-auto pt-3 border-t border-page-border flex justify-between items-center">
                        <span class="text-lg font-bold text-page-heading">$${p.price}</span>
                        <button onclick="addToCart('${p.id}', this)" class="text-[10px] font-bold text-brand-600 uppercase bg-brand-50 px-3 py-1.5 rounded hover:bg-brand-100 transition-colors">Add +</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function renderOpenSource() {
    const grid = document.getElementById('opensource-grid');
    if(grid && window.openSourceTools) {
        grid.innerHTML = window.openSourceTools.map(p => `
            <div class="bg-slate-800 border border-slate-700 group flex flex-col h-full hover:border-brand-500 transition-all duration-300 rounded-xl overflow-hidden shadow-lg">
                <a href="pages/product-detail.html?id=${p.id}" class="block relative w-full aspect-video overflow-hidden bg-slate-900">
                    <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity">
                    <span class="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">Free</span>
                </a>
                <div class="p-4 flex flex-col flex-grow">
                    <div class="mb-2">
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Open Source</span>
                    </div>
                    <a href="pages/product-detail.html?id=${p.id}" class="block mb-2">
                        <h3 class="text-base font-bold text-white group-hover:text-brand-400 transition-colors truncate">${p.title}</h3>
                    </a>
                    <p class="text-slate-400 text-xs mb-4 line-clamp-2">${p.description}</p>
                    <div class="mt-auto pt-3 border-t border-slate-700 flex justify-between items-center">
                        <span class="text-sm font-bold text-green-400">Free</span>
                        <button onclick="addToCart('${p.id}', this)" class="text-[10px] font-bold text-white uppercase bg-slate-700 px-3 py-1.5 rounded hover:bg-brand-600 transition-colors">Get <i class="fa-solid fa-download ml-1"></i></button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderFeatured();
    renderOpenSource();
});