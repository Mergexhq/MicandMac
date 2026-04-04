/**
 * MicandMac — Cinematic Animation Engine v1.0
 * ─────────────────────────────────────────────
 * Dependencies (CDN in theme.liquid):
 *   - GSAP 3.12 + ScrollTrigger plugin
 *   - Three.js r162 (global THREE)
 *
 * Effects:
 *   1. Hero particle field (Three.js WebGL)
 *   2. Scroll-driven entrance reveals (GSAP ScrollTrigger)
 *   3. Floating ingredient orbs (CSS + GSAP)
 *   4. WhatsApp button spring entrance
 */
(function () {
    'use strict';

    // ── Respect reduced-motion preference ───────────────────────
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // ── Boot: wait for GSAP to be ready ──────────────────────────
    function boot() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            setTimeout(boot, 80);
            return;
        }
        gsap.registerPlugin(ScrollTrigger);
        initScrollReveals();
        initWhatsAppEntrance();
        initFooter3D();

        // Three.js scenes — only on non-touch, non-low-memory devices
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
        if (!isTouch && !isLowMemory && typeof THREE !== 'undefined') {
            initHeroParticles();
            initIngredientsOrbs();
        }
    }

    /* ══════════════════════════════════════════════════════════
     *  1. SCROLL ENTRANCE REVEALS
     * ══════════════════════════════════════════════════════════ */
    function initScrollReveals() {
        // ── Hero — staggered entrance on page load ───────────────
        const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        heroTl
            .from('.hero-eyebrow', { opacity: 0, y: 18, duration: 0.7 }, 0.4)
            .from('.hero-heading', { opacity: 0, y: 44, duration: 1.0 }, 0.55)
            .from('.hero-subhead', { opacity: 0, y: 28, duration: 0.85 }, 0.8)
            .from('.hero-cta', { opacity: 0, y: 22, scale: 0.92, duration: 0.75 }, 1.0)
            .from('.floating-mission', { opacity: 0, y: 16, duration: 0.65 }, 1.15)
            .from('.floating-product', { opacity: 0, x: 32, duration: 0.7 }, 1.1);

        // ── Trust bar — staggered count-in ──────────────────────
        const trustItems = gsap.utils.toArray('[class*="trust"] > *, .trust-bar__item');
        if (trustItems.length) {
            gsap.from(trustItems, {
                scrollTrigger: { trigger: trustItems[0].closest('[class*="trust"]') || trustItems[0], start: 'top 85%' },
                opacity: 0, y: 22, stagger: 0.1, duration: 0.7, ease: 'power2.out',
            });
        }

        // ── Generic section headings ─────────────────────────────
        gsap.utils.toArray('h2').forEach((el) => {
            if (el.closest('.the-act-hero, .site-footer')) return;
            gsap.from(el, {
                scrollTrigger: { trigger: el, start: 'top 88%' },
                opacity: 0, y: 38, duration: 0.9, ease: 'power3.out',
            });
        });

        // ── Subheadings + eyebrows ───────────────────────────────
        gsap.utils.toArray('.section-eyebrow, [class*="eyebrow"], [class*="subheading"]').forEach((el) => {
            if (el.closest('.the-act-hero')) return;
            gsap.from(el, {
                scrollTrigger: { trigger: el, start: 'top 88%' },
                opacity: 0, y: 18, duration: 0.65, ease: 'power2.out',
            });
        });

        // ── Ingredient feature cards — cascade with 3D tilt ─────
        gsap.utils.toArray('.ingredient-feature').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: { trigger: card, start: 'top 90%' },
                opacity: 0,
                y: 42,
                rotateY: 8,
                transformPerspective: 800,
                transformOrigin: 'left center',
                duration: 0.8,
                delay: (i % 3) * 0.14,
                ease: 'power2.out',
            });
        });

        // ── Generic cards / blocks ───────────────────────────────
        gsap.utils.toArray('[class*="-card"], [class*="__block"], .product-card').forEach((card, i) => {
            if (card.closest('.the-act-hero')) return;
            gsap.from(card, {
                scrollTrigger: { trigger: card, start: 'top 91%' },
                opacity: 0,
                y: 34,
                duration: 0.75,
                delay: (i % 4) * 0.1,
                ease: 'power2.out',
            });
        });

        // ── Images — clip-path reveal ────────────────────────────
        gsap.utils.toArray('img[loading="lazy"]').forEach((img) => {
            if (img.closest('.the-act-hero, .site-header, .site-footer')) return;
            gsap.from(img, {
                scrollTrigger: { trigger: img, start: 'top 85%' },
                opacity: 0,
                scale: 1.05,
                duration: 1.1,
                ease: 'power2.out',
            });
        });

        // ── Footer trust seals — stagger appear ─────────────────
        gsap.from('.footer__seal', {
            scrollTrigger: { trigger: '.footer__trust-seals', start: 'top 92%' },
            opacity: 0, y: 10, stagger: 0.07, duration: 0.55, ease: 'power2.out',
        });

        // ── Brand mission / philosophy pull quote ────────────────
        const missionQuote = document.querySelector('.brand-mission');
        if (missionQuote) {
            gsap.from(missionQuote.querySelectorAll('h2, p, a'), {
                scrollTrigger: { trigger: missionQuote, start: 'top 75%' },
                opacity: 0, y: 50, stagger: 0.15, duration: 1.1, ease: 'power3.out',
            });
        }

        // ── FAQ items — slide in from left ───────────────────────
        gsap.utils.toArray('.faq__item, [class*="faq"] > *').forEach((item, i) => {
            gsap.from(item, {
                scrollTrigger: { trigger: item, start: 'top 90%' },
                opacity: 0, x: -30, duration: 0.65, delay: i * 0.08, ease: 'power2.out',
            });
        });

        // ── Newsletter section ───────────────────────────────────
        const newsletter = document.querySelector('.newsletter-cta, [class*="newsletter"]');
        if (newsletter) {
            gsap.from(newsletter.querySelectorAll('h2, p, input, button'), {
                scrollTrigger: { trigger: newsletter, start: 'top 80%' },
                opacity: 0, y: 24, stagger: 0.1, duration: 0.8, ease: 'power2.out',
            });
        }
    }

    /* ══════════════════════════════════════════════════════════
     *  2. WHATSAPP STICKY — SPRING ENTRANCE
     * ══════════════════════════════════════════════════════════ */
    function initWhatsAppEntrance() {
        const btn = document.querySelector('.wa-sticky');
        if (!btn) return;
        gsap.from(btn, {
            opacity: 0,
            scale: 0.6,
            x: 50,
            duration: 0.8,
            delay: 2.2,
            ease: 'back.out(1.7)',
        });
    }

    /* ══════════════════════════════════════════════════════════
     *  3. HERO PARTICLE FIELD (Three.js)
     *  Warm-toned floating dust on the hero card background
     * ══════════════════════════════════════════════════════════ */
    function initHeroParticles() {
        const card = document.querySelector('.hero-card');
        if (!card) return;

        // Skip if a real video/image is present (already visually rich)
        if (card.dataset.hasVideo === 'true') return;
        if (card.querySelector('.hero-bg-image')) return;

        // ── Create canvas ─────────────────────────────────────────
        const canvas = document.createElement('canvas');
        canvas.id = 'mm-hero-canvas';
        canvas.style.cssText = [
            'position:absolute',
            'inset:0',
            'width:100%',
            'height:100%',
            'z-index:0',
            'pointer-events:none',
            'border-radius:inherit',
        ].join(';');
        card.insertBefore(canvas, card.firstChild);

        // ── Scroll fade out ───────────────────────────────────────
        gsap.to(canvas, {
            scrollTrigger: {
                trigger: card,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            },
            opacity: 0,
            ease: 'none'
        });

        // ── Renderer ─────────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);

        // ── Scene & Camera ────────────────────────────────────────
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 500);
        camera.position.z = 55;

        // ── Particles ─────────────────────────────────────────────
        const COUNT = 900;
        const positions = new Float32Array(COUNT * 3);
        const colors = new Float32Array(COUNT * 3);
        const alphas = new Float32Array(COUNT); // individual opacity for twinkle

        // Warm brand palette
        const palette = [
            new THREE.Color(0xC9A87A), // champagne gold
            new THREE.Color(0x9A6A5A), // warm mid-garnet
            new THREE.Color(0xD4B896), // pale gold
            new THREE.Color(0xF3E8E4), // soft blush
            new THREE.Color(0x7A4A5A), // muted garnet
        ];

        for (let i = 0; i < COUNT; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 130;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 90;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
            const c = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
            alphas[i] = 0.3 + Math.random() * 0.7;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.6,
            vertexColors: true,
            transparent: true,
            opacity: 0.5,
            sizeAttenuation: true,
        });

        const particles = new THREE.Points(geo, mat);
        scene.add(particles);

        // ── Drift velocities ─────────────────────────────────────
        const driftY = new Float32Array(COUNT);
        const driftX = new Float32Array(COUNT);
        for (let i = 0; i < COUNT; i++) {
            driftY[i] = 0.004 + Math.random() * 0.010; // upward
            driftX[i] = (Math.random() - 0.5) * 0.003;  // gentle sideways
        }

        // ── Mouse parallax ────────────────────────────────────────
        let targetRX = 0, targetRY = 0;
        let currentRX = 0, currentRY = 0;
        document.addEventListener('mousemove', (e) => {
            targetRY = ((e.clientX / window.innerWidth) - 0.5) * 0.10;
            targetRX = -((e.clientY / window.innerHeight) - 0.5) * 0.06;
        });

        // ── Resize ────────────────────────────────────────────────
        function resize() {
            const w = card.offsetWidth;
            const h = card.offsetHeight;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        resize();
        new ResizeObserver(resize).observe(card);

        // ── Pause when off-screen ─────────────────────────────────
        let visible = true;
        new IntersectionObserver((entries) => {
            visible = entries[0].isIntersecting;
        }, { threshold: 0.05 }).observe(card);

        // ── Render loop ───────────────────────────────────────────
        const pos = geo.attributes.position.array;

        function animate(time) {
            requestAnimationFrame(animate);
            if (!visible) return;

            // Drift particles upward (wrap at boundary)
            for (let i = 0; i < COUNT; i++) {
                pos[i * 3] += driftX[i];
                pos[i * 3 + 1] += driftY[i];
                if (pos[i * 3 + 1] > 45) pos[i * 3 + 1] = -45;
                if (pos[i * 3] > 65) pos[i * 3] = -65;
                if (pos[i * 3] < -65) pos[i * 3] = 65;
            }
            geo.attributes.position.needsUpdate = true;

            // Smooth mouse parallax
            currentRX += (targetRX - currentRX) * 0.04;
            currentRY += (targetRY - currentRY) * 0.04;
            particles.rotation.x = currentRX;
            particles.rotation.y = currentRY;

            // Slow auto-rotate
            particles.rotation.z += 0.0002;

            // Opacity breathing
            mat.opacity = 0.42 + Math.sin(time * 0.0008) * 0.08;

            renderer.render(scene, camera);
        }
        animate(0);
    }

    /* ══════════════════════════════════════════════════════════
     *  4. FOOTER 3D PARALLAX
     * ══════════════════════════════════════════════════════════ */
    function initFooter3D() {
        const trustSeals = document.querySelector('.footer__trust-seals');
        if (trustSeals) {
            gsap.fromTo(trustSeals,
                { rotateX: -10, transformPerspective: 800 },
                {
                    rotateX: 5,
                    scrollTrigger: {
                        trigger: '.site-footer',
                        start: 'top bottom',
                        end: 'bottom bottom',
                        scrub: 1
                    }
                }
            );
        }
    }

    /* ══════════════════════════════════════════════════════════
     *  5. INGREDIENTS 3D ORBS (Three.js)
     * ══════════════════════════════════════════════════════════ */
    function initIngredientsOrbs() {
        const canvas = document.getElementById('ingredients-canvas');
        if (!canvas) return;

        const container = canvas.parentElement;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        camera.position.z = 20;

        // Group to hold orbs
        const orbsGroup = new THREE.Group();
        scene.add(orbsGroup);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 2);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);

        const pointLight = new THREE.PointLight(0xffefd5, 3, 50); // warm light
        pointLight.position.set(-2, 2, 2);
        scene.add(pointLight);

        // Geometries & Materials
        const sphereGeo = new THREE.SphereGeometry(1, 48, 48);

        const matGarnet = new THREE.MeshPhysicalMaterial({
            color: 0x2E1F1A, emissive: 0x4A1525, emissiveIntensity: 0.4,
            roughness: 0.1, metalness: 0.1, clearcoat: 1.0, clearcoatRoughness: 0.1,
            transparent: true, opacity: 0.9, transmission: 0.5, thickness: 0.5,
        });

        const matChampagne = new THREE.MeshPhysicalMaterial({
            color: 0xC9A87A, emissive: 0x332512, emissiveIntensity: 0.6,
            roughness: 0.2, metalness: 0.3, clearcoat: 0.8,
            transparent: true, opacity: 0.85,
        });

        const matCream = new THREE.MeshPhysicalMaterial({
            color: 0xF3E8E4, emissive: 0x40302C, emissiveIntensity: 0.3,
            roughness: 0.3, metalness: 0.05, clearcoat: 0.5,
            transparent: true, opacity: 0.95,
        });

        // Create meshes
        const orb1 = new THREE.Mesh(sphereGeo, matGarnet); orb1.scale.set(3.5, 3.5, 3.5);
        const orb2 = new THREE.Mesh(sphereGeo, matChampagne); orb2.scale.set(1.5, 1.5, 1.5);
        const orb3 = new THREE.Mesh(sphereGeo, matCream); orb3.scale.set(2, 2, 2);

        orbsGroup.add(orb1, orb2, orb3);

        // Orbital variables
        let angle1 = 0, angle2 = Math.PI, angle3 = Math.PI / 2;
        const radius1 = 4.5, radius2 = 7, radius3 = 6;

        // Resize
        function resize() {
            const w = container.offsetWidth;
            const h = container.offsetHeight;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        resize();
        window.addEventListener('resize', resize);

        // Render loop
        let ticking = true;

        function animate(time) {
            if (!ticking) return;
            requestAnimationFrame(animate);

            // Orbit logic
            angle1 += 0.003;
            orb1.position.x = Math.cos(angle1) * radius1;
            orb1.position.y = Math.sin(angle1 * 0.8) * radius1 * 0.5;
            orb1.position.z = Math.sin(angle1) * radius1 * 0.5;
            orb1.rotation.y += 0.005; orb1.rotation.x += 0.002;

            angle2 -= 0.004;
            orb2.position.x = Math.cos(angle2) * radius2;
            orb2.position.y = Math.sin(angle2 * 1.2) * radius2 * 0.5;
            orb2.position.z = Math.sin(angle2) * radius2 * 0.5;
            orb2.rotation.y -= 0.01;

            angle3 += 0.002;
            orb3.position.x = Math.sin(angle3) * radius3;
            orb3.position.y = Math.cos(angle3 * 0.9) * radius3 * 0.5;
            orb3.position.z = Math.cos(angle3) * radius3 * 0.5;
            orb3.rotation.x -= 0.005;
            const sc = 2 + Math.sin(time * 0.001) * 0.2;
            orb3.scale.set(sc, sc, sc);

            renderer.render(scene, camera);
        }

        ScrollTrigger.create({
            trigger: container,
            start: 'top bottom',
            end: 'bottom top',
            onEnter: () => { ticking = true; canvas.style.opacity = '1'; requestAnimationFrame(animate); },
            onLeave: () => { ticking = false; },
            onEnterBack: () => { ticking = true; canvas.style.opacity = '1'; requestAnimationFrame(animate); },
            onLeaveBack: () => { ticking = false; canvas.style.opacity = '0'; }
        });

        document.addEventListener('mousemove', (e) => {
            if (!ticking) return;
            const targetX = ((e.clientX / window.innerWidth) - 0.5) * 2;
            const targetY = -((e.clientY / window.innerHeight) - 0.5) * 2;
            orbsGroup.rotation.y += (targetX - orbsGroup.rotation.y) * 0.05;
            orbsGroup.rotation.x += (targetY - orbsGroup.rotation.x) * 0.05;
        });
    }

    // ── Boot ──────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
