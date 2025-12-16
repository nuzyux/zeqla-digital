import { db } from "./firebase-config.js";
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// The One-Day Websites Data
const oneDayWebsites = [
    {
        title: "Modern Law Firm",
        price: 199,
        image: "https://placehold.co/600x400/2c3e50/ffffff?text=Law+Firm",
        description: "Authoritative design for legal practices. Includes booking & case study modules.",
        category: "Corporate",
        type: "oneday", // Distinction key
        rating: 5.0,
        badge: "Enterprise"
    },
    {
        title: "Dental Clinic Pro",
        price: 149,
        image: "https://placehold.co/600x400/06b6d4/ffffff?text=Dental+Pro",
        description: "Clean, hygienic aesthetic with appointment scheduling integration.",
        category: "Medical",
        type: "oneday",
        rating: 4.9,
        badge: "Popular"
    },
    {
        title: "Real Estate Elite",
        price: 249,
        image: "https://placehold.co/600x400/1e293b/fbbf24?text=Real+Estate",
        description: "Property listing engine with advanced search and agent profiles.",
        category: "Real Estate",
        type: "oneday",
        rating: 4.8,
        badge: "Best Seller"
    },
    {
        title: "Restaurant Bistro",
        price: 129,
        image: "https://placehold.co/600x400/7f1d1d/ffffff?text=Bistro",
        description: "Menu-focused design with OpenTable reservation support.",
        category: "Hospitality",
        type: "oneday",
        rating: 4.7
    },
    {
        title: "Fitness Coach",
        price: 99,
        image: "https://placehold.co/600x400/be185d/ffffff?text=Fitness",
        description: "High-energy layout for personal trainers and gyms.",
        category: "Health",
        type: "oneday",
        rating: 4.9
    },
    {
        title: "Tech Consultant",
        price: 179,
        image: "https://placehold.co/600x400/3b82f6/ffffff?text=Tech+Consult",
        description: "Minimalist SaaS-style portfolio for IT professionals.",
        category: "Corporate",
        type: "oneday",
        rating: 5.0
    },
    {
        title: "Construction Corp",
        price: 199,
        image: "https://placehold.co/600x400/f59e0b/000000?text=Construction",
        description: "Rugged design highlighting project galleries and safety certifications.",
        category: "Industrial",
        type: "oneday",
        rating: 4.6
    },
    {
        title: "Beauty Salon",
        price: 149,
        image: "https://placehold.co/600x400/f472b6/ffffff?text=Beauty",
        description: "Elegant, image-heavy design with service menus and booking.",
        category: "Lifestyle",
        type: "oneday",
        rating: 4.8
    }
];

async function seedOneDayWebsites() {
    console.log("Starting One-Day Website Seeding...");
    const productsRef = collection(db, "products");

    for (const site of oneDayWebsites) {
        // Check if exists to prevent duplicates
        const q = query(productsRef, where("title", "==", site.title));
        const snap = await getDocs(q);

        if (snap.empty) {
            await addDoc(productsRef, site);
            console.log(`Added: ${site.title}`);
        } else {
            console.log(`Skipped (Exists): ${site.title}`);
        }
    }
    console.log("Seeding Complete!");
}

// Auto-run if loaded
seedOneDayWebsites();