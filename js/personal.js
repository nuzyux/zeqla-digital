import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, doc, getDocs, setDoc, updateDoc, getDoc, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// DOM Elements
const track = document.getElementById('card-track');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const dotsContainer = document.getElementById('pagination-dots');
const metaPanel = document.getElementById('card-metadata-panel');

// State
let walletCards = [];
let currentIndex = 0;
let currentUser = null;
let persistentPersonalId = "LOADING..."; 

// --- 1. INITIALIZATION ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        await ensureUserHasUniqueId(user.uid);
        await initializeWallet(user);
    } else {
        window.location.href = "auth.html";
    }
});

// --- UNIQUE ID LOGIC ---
async function ensureUserHasUniqueId(uid) {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().personalId) {
            persistentPersonalId = userSnap.data().personalId;
            return;
        }

        let isUnique = false;
        let newId = "";
        while (!isUnique) {
            newId = generate16DigitString();
            const q = query(collection(db, "users"), where("personalId", "==", newId));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) isUnique = true;
        }

        await setDoc(userRef, { personalId: newId }, { merge: true });
        persistentPersonalId = newId;

    } catch (e) {
        console.error("ID Generation Error:", e);
        persistentPersonalId = "ERROR";
    }
}

function generate16DigitString() {
    const p1 = Math.floor(1000 + Math.random() * 9000);
    const p2 = Math.floor(1000 + Math.random() * 9000);
    const p3 = Math.floor(1000 + Math.random() * 9000);
    const p4 = Math.floor(1000 + Math.random() * 9000);
    return `${p1} ${p2} ${p3} ${p4}`;
}

// --- WALLET LOGIC ---
async function initializeWallet(user) {
    try {
        const walletRef = collection(db, "users", user.uid, "wallet_cards");
        const q = query(walletRef, orderBy("acquiredAt", "desc")); 
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            await runAutoMintLogic(user);
            const retrySnapshot = await getDocs(q);
            if (!retrySnapshot.empty) processSnapshot(retrySnapshot);
            else if(track) track.innerHTML = '<div class="text-center text-slate-500 py-10">Wallet initialized. Refresh to view cards.</div>';
            return;
        }
        processSnapshot(snapshot);
    } catch (e) {
        console.error("Wallet Init Error:", e);
        if(track) track.innerHTML = `<div class="text-red-400 text-center w-full py-10 px-4">Error loading wallet.<br><span class="text-xs">Check console or network.</span></div>`;
    }
}

function processSnapshot(snapshot) {
    walletCards = [];
    snapshot.forEach(doc => walletCards.push({ id: doc.id, ...doc.data() }));
    
    if(document.getElementById('wallet-count')) document.getElementById('wallet-count').innerText = walletCards.length;
    renderCarousel();
    updateMetadata(0);
    if(metaPanel) metaPanel.classList.remove('opacity-50', 'pointer-events-none');
}

async function runAutoMintLogic(user) {
    // Basic migration logic logic
    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        let planId = 'plan_starter';
        if (userDoc.exists() && userDoc.data().subscription?.status === 'Active') {
            planId = userDoc.data().subscription.planId;
        }
        let cardType = { template: '../cards/card-starter.html', title: 'Starter Member', rarity: 'Common', typeId: 'starter' };
        if (planId === 'plan_pro') cardType = { template: '../cards/card-pro.html', title: 'Pro Member', rarity: 'Rare', typeId: 'pro' };
        else if (planId === 'plan_enterprise') cardType = { template: '../cards/card-agency.html', title: 'Agency Member', rarity: 'Legendary', typeId: 'agency' };
        
        await mintCardToWallet(user.uid, cardType);
    } catch(e) { console.error(e); }
}

async function mintCardToWallet(uid, cardDef) {
    const cardId = `card_${Date.now()}`;
    await setDoc(doc(collection(db, "users", uid, "wallet_cards"), cardId), {
        template: cardDef.template,
        title: cardDef.title,
        rarity: cardDef.rarity,
        typeId: cardDef.typeId,
        acquiredAt: new Date().toISOString(),
        serialNumber: generateSerial(),
        isFlipped: false
    });
}

function generateSerial() {
    const prefix = Math.floor(Math.random() * 9000) + 1000;
    const suffix = Math.floor(Math.random() * 9000) + 1000;
    return `#${prefix}-${suffix}`;
}

// --- RENDER LOGIC UPDATE ---
async function renderCarousel() {
    if(!track) return;
    track.innerHTML = '';
    if(dotsContainer) dotsContainer.innerHTML = '';

    const templateCache = {};

    for (let i = 0; i < walletCards.length; i++) {
        const card = walletCards[i];
        
        let htmlContent = '';
        if (templateCache[card.template]) {
            htmlContent = templateCache[card.template];
        } else {
            try {
                const res = await fetch(card.template);
                if(!res.ok) throw new Error('Network response was not ok');
                htmlContent = await res.text();
                templateCache[card.template] = htmlContent;
            } catch (err) {
                console.error("Template error", err);
                continue;
            }
        }

        const parser = new DOMParser();
        const docObj = parser.parseFromString(htmlContent, 'text/html');
        
        // FIND FRONT AND BACK
        const frontEl = docObj.getElementById('card-front') || docObj.getElementById('card-template');
        const backEl = docObj.getElementById('card-back');

        if (frontEl) {
            // INJECT DATA INTO FRONT
            const idNode = frontEl.querySelector('#inject-card-number');
            const nameNode = frontEl.querySelector('#inject-card-name');
            const statusNode = frontEl.querySelector('#inject-card-status');
            
            if (idNode) idNode.textContent = persistentPersonalId;
            if (nameNode) nameNode.textContent = currentUser.displayName || "AUTHORIZED USER";
            if (statusNode) statusNode.textContent = "OWNER";

            const wrapper = document.createElement('div');
            wrapper.className = 'card-slide';
            
            const flipContainer = document.createElement('div');
            flipContainer.className = 'flip-container w-full max-w-[420px] relative';
            flipContainer.id = `flip-${i}`;

            const frontDiv = document.createElement('div');
            frontDiv.className = 'card-front';
            frontDiv.appendChild(frontEl);

            const backDiv = document.createElement('div');
            backDiv.className = 'card-back shadow-xl';

            if (backEl) {
                // USE CUSTOM BACK
                // Create a wrapper to apply tilt without overwriting backEl's internal transforms (which might handle text flipping)
                const tiltWrapper = document.createElement('div');
                tiltWrapper.style.width = '100%';
                tiltWrapper.style.height = '100%';
                
                tiltWrapper.appendChild(backEl);
                backDiv.appendChild(tiltWrapper);
                
                // Attach tilt to the wrapper - EXACT SAME logic as front
                attachTilt(tiltWrapper, wrapper); 
            } else {
                // FALLBACK BACK
                const fallbackWrapper = document.createElement('div');
                fallbackWrapper.className = 'w-full h-full flex flex-col justify-center items-center';
                fallbackWrapper.innerHTML = `
                    <div class="text-center">
                        <div class="text-4xl text-brand-500 mb-2"><i class="fa-solid fa-fingerprint"></i></div>
                        <div class="text-xs text-slate-400 uppercase tracking-widest">Serial Number</div>
                        <div class="text-xl font-mono font-bold mb-4">${card.serialNumber}</div>
                        <div class="text-xs text-slate-400 uppercase tracking-widest">Mint Date</div>
                        <div class="text-sm font-mono mb-4">${new Date(card.acquiredAt).toLocaleDateString()}</div>
                        <div class="inline-block px-3 py-1 rounded border border-slate-600 text-xs text-slate-300 uppercase">${card.rarity} Class</div>
                    </div>
                `;
                backDiv.appendChild(fallbackWrapper);
                attachTilt(fallbackWrapper, wrapper);
            }

            flipContainer.appendChild(frontDiv);
            flipContainer.appendChild(backDiv);
            wrapper.appendChild(flipContainer);
            track.appendChild(wrapper);

            attachTilt(frontEl, wrapper);
        }

        if(dotsContainer) {
            const dot = document.createElement('button');
            dot.className = `w-2 h-2 rounded-full transition-all ${i === 0 ? 'bg-white w-4' : 'bg-white/30'}`;
            dot.onclick = () => goToSlide(i);
            dotsContainer.appendChild(dot);
        }
    }
    updateSlidePosition();
}

function updateSlidePosition() {
    if(!track) return;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    if(dotsContainer) {
        Array.from(dotsContainer.children).forEach((dot, idx) => {
            dot.className = `w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/30'}`;
        });
    }
    if(prevBtn) prevBtn.disabled = currentIndex === 0;
    if(nextBtn) nextBtn.disabled = currentIndex === walletCards.length - 1;
    updateMetadata(currentIndex);
}

function goToSlide(index) {
    currentIndex = index;
    updateSlidePosition();
}

if(prevBtn) prevBtn.onclick = () => { if(currentIndex > 0) goToSlide(currentIndex - 1); };
if(nextBtn) nextBtn.onclick = () => { if(currentIndex < walletCards.length - 1) goToSlide(currentIndex + 1); };

function updateMetadata(index) {
    if (!walletCards[index]) return;
    const card = walletCards[index];
    if(document.getElementById('meta-title')) document.getElementById('meta-title').innerText = card.title;
    if(document.getElementById('meta-date')) document.getElementById('meta-date').innerText = new Date(card.acquiredAt).toLocaleDateString();
    if(document.getElementById('meta-serial')) document.getElementById('meta-serial').innerText = card.serialNumber;
    const rarityEl = document.getElementById('meta-rarity');
    if(rarityEl) {
        rarityEl.innerText = card.rarity;
        if(card.rarity === 'Legendary') rarityEl.className = "bg-yellow-100 text-yellow-700 border-yellow-200 px-2 py-1 rounded text-[10px] font-bold uppercase";
        else if (card.rarity === 'Rare') rarityEl.className = "bg-blue-100 text-blue-700 border-blue-200 px-2 py-1 rounded text-[10px] font-bold uppercase";
        else rarityEl.className = "bg-slate-100 text-slate-600 border-slate-200 px-2 py-1 rounded text-[10px] font-bold uppercase";
    }
}

const flipBtn = document.getElementById('action-flip');
if(flipBtn) {
    flipBtn.onclick = () => {
        const currentFlipContainer = document.getElementById(`flip-${currentIndex}`);
        if (currentFlipContainer) currentFlipContainer.classList.toggle('flipped');
    };
}

const equipBtn = document.getElementById('action-equip');
if(equipBtn) {
    equipBtn.onclick = async () => {
        const card = walletCards[currentIndex];
        equipBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Updating...';
        equipBtn.disabled = true;
        try {
            await updateDoc(doc(db, "users", currentUser.uid), { "activeCardId": card.id, "activeCardType": card.typeId });
            equipBtn.innerHTML = '<i class="fa-solid fa-check"></i> Active ID Set';
            setTimeout(() => { equipBtn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Set Active ID'; equipBtn.disabled = false; }, 2000);
        } catch (e) { console.error(e); equipBtn.innerHTML = 'Error'; }
    };
}

function attachTilt(element, container) {
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Exact same calculation as front side
        const rotateX = ((y - centerY) / centerY) * -10; 
        const rotateY = ((x - centerX) / centerX) * 10;
        
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    container.addEventListener('mouseleave', () => {
        element.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    });
}