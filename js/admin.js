import { db, auth } from "./firebase-config.js";
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, getDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const ADMIN_EMAILS = ["admin@zeqla.com", "najisr000@gmail.com"];
let globalCategories = [];
let globalProducts = [];
let globalRequests = [];

// --- 1. AUTH & INIT ---
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        const loader = document.getElementById('admin-loader');
        if (user) {
            // Simple check (in production use Custom Claims)
            const isAdmin = ADMIN_EMAILS.some(e => e.toLowerCase() === user.email.toLowerCase());
            
            if (isAdmin) {
                console.log("Admin Access Granted.");
                if(loader) loader.classList.add('hidden');
                
                // Init Listeners
                setupCategoryListener();
                setupProductListener();
                setupRequestListener();
                loadStats();
                loadUsers();
            } else {
                alert("Unauthorized Access.");
                await signOut(auth);
                window.location.href = "../index.html";
            }
        } else {
            window.location.href = "../pages/auth.html";
        }
    });
});

document.getElementById('btn-logout')?.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = "../pages/auth.html";
});

// --- 2. STATS ---
async function loadStats() {
    // Basic counts - simplified for now
    const usersSnap = await getDocs(collection(db, "users"));
    document.getElementById('stat-active-users').innerText = usersSnap.size;
}

// --- 3. PRODUCT MANAGEMENT (CORE) ---

function setupProductListener() {
    const q = query(collection(db, "products"), orderBy("title"));
    onSnapshot(q, (snapshot) => {
        globalProducts = [];
        snapshot.forEach(doc => globalProducts.push({ id: doc.id, ...doc.data() }));
        renderProductTable();
        document.getElementById('stat-total-products').innerText = globalProducts.length;
    });
}

function renderProductTable() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;
    
    if (globalProducts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-slate-400">No products found. Add one to get started.</td></tr>`;
        return;
    }

    tbody.innerHTML = globalProducts.map(p => `
        <tr class="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group">
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                        <img src="${p.image || ''}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/40'">
                    </div>
                    <div>
                        <div class="font-bold text-slate-900 text-sm">${p.title}</div>
                        <div class="text-xs text-slate-400 truncate max-w-[150px]">${p.description || ''}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">${p.category}</span>
            </td>
            <td class="px-6 py-4 font-mono text-sm text-slate-700">
                ${p.price === 0 ? '<span class="text-green-600 font-bold">Free</span>' : '$'+p.price}
            </td>
            <td class="px-6 py-4">
                ${getTypeBadge(p.type)}
            </td>
            <td class="px-6 py-4 text-right">
                <button onclick="editProduct('${p.id}')" class="text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 p-2 rounded-lg transition-colors mr-1">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                <button onclick="deleteProduct('${p.id}')" class="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function getTypeBadge(type) {
    if (type === 'oneday') return '<span class="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100">One-Day</span>';
    if (type === 'free') return '<span class="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">Open Src</span>';
    return '<span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">Digital</span>';
}

// --- MODAL LOGIC (ADD/EDIT) ---
window.openProductModal = () => {
    document.getElementById('product-form').reset();
    document.getElementById('p-id').value = '';
    document.getElementById('modal-title').innerText = "Add New Product";
    populateCategoryDropdown();
    document.getElementById('product-modal').classList.remove('hidden');
};

window.editProduct = (id) => {
    const p = globalProducts.find(x => x.id === id);
    if (!p) return;

    populateCategoryDropdown();
    
    document.getElementById('p-id').value = p.id;
    document.getElementById('p-title').value = p.title;
    document.getElementById('p-category').value = p.category;
    document.getElementById('p-type').value = p.type || 'digital';
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-badge').value = p.badge || '';
    document.getElementById('p-image').value = p.image || '';
    document.getElementById('p-description').value = p.description || '';
    document.getElementById('p-features').value = (p.features || []).join(', ');
    document.getElementById('p-video').value = p.videoUrl || '';
    document.getElementById('p-details').value = p.detailsContent || '';
    document.getElementById('p-howto').value = p.howToUseContent || '';

    document.getElementById('modal-title').innerText = "Edit Product";
    document.getElementById('product-modal').classList.remove('hidden');
};

window.closeProductModal = () => {
    document.getElementById('product-modal').classList.add('hidden');
};

window.handleProductSubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = "Saving...";
    btn.disabled = true;

    try {
        const id = document.getElementById('p-id').value;
        
        const data = {
            title: document.getElementById('p-title').value,
            category: document.getElementById('p-category').value,
            type: document.getElementById('p-type').value,
            price: parseFloat(document.getElementById('p-price').value) || 0,
            badge: document.getElementById('p-badge').value,
            image: document.getElementById('p-image').value,
            description: document.getElementById('p-description').value,
            features: document.getElementById('p-features').value.split(',').map(s => s.trim()).filter(s => s),
            videoUrl: document.getElementById('p-video').value,
            detailsContent: document.getElementById('p-details').value,
            howToUseContent: document.getElementById('p-howto').value,
            updatedAt: new Date().toISOString()
        };

        if (id) {
            // Update
            await updateDoc(doc(db, "products", id), data);
        } else {
            // Create
            data.createdAt = new Date().toISOString();
            await addDoc(collection(db, "products"), data);
        }

        closeProductModal();
    } catch (err) {
        console.error(err);
        alert("Error saving product: " + err.message);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
};

window.deleteProduct = async (id) => {
    if (confirm("Are you sure you want to delete this product? This cannot be undone.")) {
        try {
            await deleteDoc(doc(db, "products", id));
        } catch (err) {
            alert("Error deleting: " + err.message);
        }
    }
};

// --- 4. CATEGORIES ---
function setupCategoryListener() {
    onSnapshot(collection(db, "categories"), (snapshot) => {
        globalCategories = [];
        snapshot.forEach(doc => globalCategories.push({ id: doc.id, ...doc.data() }));
        renderCategories();
    });
}

function renderCategories() {
    const tbody = document.getElementById('categories-table-body');
    if (!tbody) return;
    tbody.innerHTML = globalCategories.map(c => `
        <tr class="hover:bg-slate-50 border-b border-slate-50">
            <td class="px-6 py-4 font-medium text-slate-700">${c.name}</td>
            <td class="px-6 py-4 text-right">
                <button onclick="deleteCategory('${c.id}')" class="text-slate-400 hover:text-red-500"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function populateCategoryDropdown() {
    const select = document.getElementById('p-category');
    if (!select) return;
    select.innerHTML = globalCategories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
}

window.addCategory = async () => {
    const name = document.getElementById('new-cat-name').value.trim();
    if (!name) return;
    try {
        await addDoc(collection(db, "categories"), { name });
        document.getElementById('new-cat-name').value = '';
    } catch (e) { alert(e.message); }
};

window.deleteCategory = async (id) => {
    if (confirm("Delete Category?")) await deleteDoc(doc(db, "categories", id));
};

// --- 5. REQUESTS ---
function setupRequestListener() {
    onSnapshot(query(collection(db, "requests"), orderBy("submittedAt", "desc")), (snapshot) => {
        globalRequests = [];
        snapshot.forEach(doc => globalRequests.push({ id: doc.id, ...doc.data() }));
        renderRequests();
    });
}

function renderRequests() {
    const tbody = document.getElementById('requests-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = globalRequests.map(r => `
        <tr class="hover:bg-slate-50 border-b border-slate-50" onclick="viewRequest('${r.id}')">
            <td class="px-6 py-4">
                <div class="font-bold text-slate-900">${r.fullName}</div>
                <div class="text-xs text-slate-400">${r.email}</div>
            </td>
            <td class="px-6 py-4 text-xs font-mono uppercase">${r.experienceLevel}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded text-[10px] font-bold uppercase ${r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}">${r.status}</span>
            </td>
            <td class="px-6 py-4 text-right"><i class="fa-solid fa-chevron-right text-slate-300"></i></td>
        </tr>
    `).join('');
    
    const pending = globalRequests.filter(r => r.status === 'pending').length;
    const badge = document.getElementById('req-badge');
    if (badge) {
        badge.innerText = `${pending} New`;
        badge.classList.toggle('hidden', pending === 0);
    }
}

window.viewRequest = (id) => {
    const r = globalRequests.find(x => x.id === id);
    if (!r) return;
    const body = document.getElementById('request-details-body');
    body.innerHTML = `
        <div class="mb-4">
            <div class="text-xs uppercase font-bold text-slate-400">Portfolio</div>
            <a href="${r.portfolioUrl}" target="_blank" class="text-brand-600 hover:underline text-sm break-all">${r.portfolioUrl}</a>
        </div>
        <div class="mb-4">
            <div class="text-xs uppercase font-bold text-slate-400">Motivation</div>
            <p class="text-slate-700 bg-slate-50 p-2 rounded mt-1 border border-slate-100">${r.motivation}</p>
        </div>
    `;
    document.getElementById('btn-email-applicant').href = `mailto:${r.email}`;
    document.getElementById('request-modal').classList.remove('hidden');
};

// --- 6. USERS ---
async function loadUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    const snap = await getDocs(collection(db, "users"));
    tbody.innerHTML = '';
    snap.forEach(doc => {
        const u = doc.data();
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 border-b border-slate-50">
                <td class="px-6 py-4">
                    <div class="font-bold text-slate-900 text-sm">${u.email || 'No Email'}</div>
                    <div class="text-xs text-slate-400 font-mono">${doc.id.substring(0,8)}...</div>
                </td>
                <td class="px-6 py-4 text-xs font-mono">${u.subscription?.planId || 'None'}</td>
                <td class="px-6 py-4">${u.subscription?.status === 'Active' ? '<span class="text-green-600 font-bold text-xs">Active</span>' : '<span class="text-slate-400 text-xs">Inactive</span>'}</td>
                <td class="px-6 py-4 text-xs text-slate-500">${u.lastUpdated ? new Date(u.lastUpdated).toLocaleDateString() : '--'}</td>
            </tr>
        `;
    });
}