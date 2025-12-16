// --- Zeqla Product Database ---

// 1. DIGITAL PRODUCTS (One-time purchase)
const products = [
    {
        id: 1,
        title: "SaaS Starter Kit Pro",
        category: "Templates",
        price: 49.00,
        rating: 4.8,
        reviews: 124,
        image: "https://placehold.co/600x400/1e293b/0ea5e9?text=SaaS+Kit",
        badge: "Best Seller",
        description: "Complete React & Firebase starter with Auth, Stripe, and Dashboard pre-built.",
        features: ["React 18 + TypeScript", "Firebase Auth", "Stripe Integration"],
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", 
        type: "digital",
        detailsContent: "This starter kit includes a fully configured Next.js 14 environment with Tailwind CSS, ESLint, and Prettier. The backend uses Firebase Functions for serverless scalability.",
        howToUseContent: "1. Clone the repo.\n2. Run 'npm install'.\n3. Add your Firebase keys to .env.\n4. Run 'npm run dev' to start the local server.",
        disclaimerContent: "This is a digital product. No refunds are available after the source code has been downloaded. Please check the live demo before purchasing."
    },
    {
        id: 2,
        title: "Dark Cyberpunk UI",
        category: "UI Kits",
        price: 29.00,
        rating: 4.9,
        reviews: 85,
        image: "https://placehold.co/600x400/0f172a/a855f7?text=Cyber+UI",
        badge: "New",
        description: "Futuristic dashboard components designed for ethical hacking tools and crypto apps.",
        features: ["200+ Figma Components", "Tailwind CSS Ready", "Dark Mode Optimized"],
        videoUrl: "placeholder",
        type: "digital",
        detailsContent: "Includes 200+ high-fidelity components in Figma and ready-to-copy HTML/CSS snippets.",
        howToUseContent: "Import the .fig file into Figma. Use the Tailwind config file to extend your theme colors.",
        disclaimerContent: "Redistribution of the raw assets is prohibited. Extended license required for SaaS end-products."
    },
    {
        id: 3,
        title: "Telegram Bot Master",
        category: "Mini Apps",
        price: 19.00,
        rating: 4.7,
        reviews: 210,
        image: "https://placehold.co/600x400/1e293b/22c55e?text=TG+Bot",
        badge: null,
        description: "Python-based Telegram bot template with payment gateway integration.",
        features: ["Python Aiogram", "Stripe & Crypto Payments", "Admin Panel"],
        type: "digital",
        detailsContent: "Built with Python 3.10 and Aiogram 3.0. Includes Docker support.",
        howToUseContent: "Set up your BotFather token in config.py. Run docker-compose up to deploy.",
        disclaimerContent: "Crypto payments require a valid merchant account with the respective provider."
    },
    {
        id: 4,
        title: "Ethical Pentest Suite",
        category: "Tools",
        price: 59.00,
        rating: 5.0,
        reviews: 42,
        image: "https://placehold.co/600x400/000000/ef4444?text=Pentest+Tool",
        badge: "Trending",
        description: "Legal network scanning scripts and report generators for security professionals.",
        features: ["Automated Recon", "Vuln Scanner", "PDF Reports"],
        type: "digital",
        detailsContent: "A suite of Bash and Python scripts for automated reconnaissance.",
        howToUseContent: "chmod +x install.sh && ./install.sh. Run 'zeqla-scan <target>' to start.",
        disclaimerContent: "For educational and authorized testing purposes only. The author is not responsible for misuse."
    },
    {
        id: 5,
        title: "Crypto Tracker App",
        category: "Mini Apps",
        price: 39.00,
        rating: 4.5,
        reviews: 67,
        image: "https://placehold.co/600x400/1e293b/f59e0b?text=Crypto+App",
        badge: null,
        description: "Flutter-based cryptocurrency tracking application with live API connections.",
        features: ["Flutter (iOS/Android)", "CoinGecko API", "Portfolio Mgmt"],
        type: "digital",
        detailsContent: "Cross-platform Flutter codebase. State management using Riverpod.",
        howToUseContent: "flutter pub get && flutter run.",
        disclaimerContent: "API rate limits apply to the free CoinGecko tier used in the demo."
    },
    {
        id: 6,
        title: "Marketing Email Automator",
        category: "Scripts",
        price: 15.00,
        rating: 4.2,
        reviews: 33,
        image: "https://placehold.co/600x400/1e293b/ec4899?text=Email+Bot",
        badge: "Sale",
        description: "Node.js script for managing newsletters and automated follow-up sequences.",
        features: ["Node.js", "CSV Import", "SMTP Support"],
        type: "digital",
        detailsContent: "Node.js script using Nodemailer and BullMQ for queue management.",
        howToUseContent: "Configure SMTP settings in .env. Upload CSV to /input folder. Run node index.js.",
        disclaimerContent: "Ensure compliance with CAN-SPAM and GDPR when sending automated emails."
    }
];

// 2. ONE-DAY WEBSITES (New Enterprise Section)
const oneDayWebsites = [
    {
        id: "web_1",
        title: "Modern Law Firm",
        price: 199,
        image: "https://placehold.co/600x400/2c3e50/ffffff?text=Law+Firm",
        description: "Authoritative design for legal practices. Includes booking & case study modules.",
        category: "Corporate"
    },
    {
        id: "web_2",
        title: "Dental Clinic Pro",
        price: 149,
        image: "https://placehold.co/600x400/06b6d4/ffffff?text=Dental+Pro",
        description: "Clean, hygienic aesthetic with appointment scheduling integration.",
        category: "Medical"
    },
    {
        id: "web_3",
        title: "Real Estate Elite",
        price: 249,
        image: "https://placehold.co/600x400/1e293b/fbbf24?text=Real+Estate",
        description: "Property listing engine with advanced search and agent profiles.",
        category: "Real Estate"
    },
    {
        id: "web_4",
        title: "Restaurant Bistro",
        price: 129,
        image: "https://placehold.co/600x400/7f1d1d/ffffff?text=Bistro",
        description: "Menu-focused design with OpenTable reservation support.",
        category: "Hospitality"
    },
    {
        id: "web_5",
        title: "Fitness Coach",
        price: 99,
        image: "https://placehold.co/600x400/be185d/ffffff?text=Fitness",
        description: "High-energy layout for personal trainers and gyms.",
        category: "Health"
    },
    {
        id: "web_6",
        title: "Tech Consultant",
        price: 179,
        image: "https://placehold.co/600x400/3b82f6/ffffff?text=Tech+Consult",
        description: "Minimalist SaaS-style portfolio for IT professionals.",
        category: "Corporate"
    },
    {
        id: "web_7",
        title: "Construction Corp",
        price: 199,
        image: "https://placehold.co/600x400/f59e0b/000000?text=Construction",
        description: "Rugged design highlighting project galleries and safety certifications.",
        category: "Industrial"
    },
    {
        id: "web_8",
        title: "Beauty Salon",
        price: 149,
        image: "https://placehold.co/600x400/f472b6/ffffff?text=Beauty",
        description: "Elegant, image-heavy design with service menus and booking.",
        category: "Lifestyle"
    }
];

// 3. MEMBERSHIP PLANS (Recurring)
const membershipPlans = [
    {
        id: "plan_starter",
        title: "Starter",
        price: { monthly: 0, yearly: 0 },
        description: "For hobbyists and learners.",
        features: [
            "Access to Free Templates",
            "Community Discord Access",
            "Basic License"
        ],
        highlight: false,
        buttonText: "Join for Free"
    },
    {
        id: "plan_pro",
        title: "Pro Developer",
        price: { monthly: 19, yearly: 190 }, // Yearly = 2 months free
        description: "For freelancers and shipping products.",
        features: [
            "All UI Kits & Templates",
            "Unlimited Downloads",
            "Commercial License",
            "Priority Support",
            "Early Access to Drops"
        ],
        highlight: true,
        buttonText: "Upgrade to Pro"
    },
    {
        id: "plan_enterprise",
        title: "Agency",
        price: { monthly: 99, yearly: 990 },
        description: "For teams scaling up.",
        features: [
            "Everything in Pro",
            "Source Code for SaaS Kits",
            "White-label Rights",
            "Dedicated Account Manager",
            "Custom Feature Requests"
        ],
        highlight: false,
        buttonText: "Contact Sales"
    }
];

// Make available globally
window.products = products;
window.oneDayWebsites = oneDayWebsites; // NEW
window.membershipPlans = membershipPlans;