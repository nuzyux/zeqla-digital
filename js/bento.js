/**
 * MAGIC BENTO - Vanilla JS Port
 * Features: 3D Tilt, Magnetism, Particle System, Global Spotlight
 * Dependencies: GSAP (GreenSock)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const CONFIG = {
        particleCount: 8,
        glowColor: '#0ea5e9', // Brand Blue
        enableTilt: true,
        enableMagnetism: true,
        spotlightRadius: 400
    };

    const cards = document.querySelectorAll('.magic-bento-card');
    const gridSection = document.getElementById('bento-grid');

    if (cards.length === 0 || !gridSection) return;

    // --- 1. GLOBAL SPOTLIGHT ---
    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    document.body.appendChild(spotlight);

    // Track mouse globally for the spotlight
    document.addEventListener('mousemove', (e) => {
        // Move the spotlight div
        gsap.to(spotlight, {
            left: e.clientX,
            top: e.clientY,
            duration: 0.1,
            ease: 'power2.out'
        });

        // Check if inside the grid section
        const rect = gridSection.getBoundingClientRect();
        const isInside = 
            e.clientX >= rect.left && 
            e.clientX <= rect.right && 
            e.clientY >= rect.top && 
            e.clientY <= rect.bottom;

        // Fade in/out
        gsap.to(spotlight, {
            opacity: isInside ? 1 : 0,
            duration: 0.3
        });

        if (isInside) {
            updateCardGlows(e.clientX, e.clientY);
        }
    });

    // Update individual card inner glows based on proximity
    function updateCardGlows(mouseX, mouseY) {
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = mouseX - rect.left;
            const y = mouseY - rect.top;

            // Set CSS variables for the radial gradient
            card.style.setProperty('--glow-x', `${x}px`);
            card.style.setProperty('--glow-y', `${y}px`);
            
            // Calculate intensity based on distance to center of card
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dist = Math.hypot(mouseX - centerX, mouseY - centerY);
            const intensity = 1 - Math.min(dist / CONFIG.spotlightRadius, 1);
            
            card.style.setProperty('--glow-intensity', intensity.toFixed(2));
        });
    }

    // --- 2. CARD INTERACTIONS (Tilt, Particles, Magnetism) ---
    cards.forEach(card => {
        
        // State
        let isHovered = false;

        // Mouse Move (Tilt & Magnetism)
        card.addEventListener('mousemove', (e) => {
            if (!CONFIG.enableTilt && !CONFIG.enableMagnetism) return;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            if (CONFIG.enableTilt) {
                const rotateX = ((y - centerY) / centerY) * -5; // Max tilt deg
                const rotateY = ((x - centerX) / centerX) * 5;

                gsap.to(card, {
                    rotateX: rotateX,
                    rotateY: rotateY,
                    duration: 0.1,
                    ease: 'power2.out',
                    transformPerspective: 1000
                });
            }

            if (CONFIG.enableMagnetism) {
                const magnetX = (x - centerX) * 0.02;
                const magnetY = (y - centerY) * 0.02;

                gsap.to(card, {
                    x: magnetX,
                    y: magnetY,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });

        // Mouse Enter (Spawn Particles)
        card.addEventListener('mouseenter', () => {
            isHovered = true;
            spawnParticles(card);
        });

        // Mouse Leave (Reset)
        card.addEventListener('mouseleave', () => {
            isHovered = false;
            
            // Reset position
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)'
            });
        });

        // Click Effect (Ripple)
        card.addEventListener('click', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                width: 20px;
                height: 20px;
                background: rgba(14, 165, 233, 0.6);
                border-radius: 50%;
                pointer-events: none;
                z-index: 100;
                left: ${x}px;
                top: ${y}px;
                transform: translate(-50%, -50%);
            `;
            card.appendChild(ripple);

            gsap.fromTo(ripple, 
                { scale: 0, opacity: 1 },
                { 
                    scale: 20, 
                    opacity: 0, 
                    duration: 0.8, 
                    ease: 'power2.out',
                    onComplete: () => ripple.remove()
                }
            );
        });
    });

    // --- 3. PARTICLE SYSTEM ---
    function spawnParticles(card) {
        if (!isHovered) return; // Stop if mouse left

        const rect = card.getBoundingClientRect();

        for (let i = 0; i < CONFIG.particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random start position near center
            const startX = Math.random() * rect.width;
            const startY = Math.random() * rect.height;
            
            particle.style.left = startX + 'px';
            particle.style.top = startY + 'px';
            
            card.appendChild(particle);

            // Animate
            // 1. Pop in
            gsap.fromTo(particle, 
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.2 }
            );

            // 2. Float around randomly
            gsap.to(particle, {
                x: (Math.random() - 0.5) * 60,
                y: (Math.random() - 0.5) * 60,
                duration: 1 + Math.random(),
                ease: 'power1.inOut',
                repeat: -1,
                yoyo: true
            });

            // 3. Fade out eventually
            gsap.to(particle, {
                opacity: 0,
                duration: 0.5,
                delay: 0.5 + Math.random(),
                onComplete: () => particle.remove()
            });
        }
    }
});