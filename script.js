/* =====================================================
   OPEN MICROLOCK — script.js
   3D Interactive Chip + DARMI Simulator Logic
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // 1. THREE.JS — 3D INTERACTIVE CHIP
    // =========================================

    const canvas = document.getElementById('canvas-container');
    if (!canvas || typeof THREE === 'undefined') {
        console.warn('[CHIP3D] Three.js not available or container missing.');
    } else {
        initChip3D(canvas);
    }

    function initChip3D(container) {
        const scene = new THREE.Scene();

        const w = container.clientWidth;
        const h = container.clientHeight;

        const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        camera.position.set(0, 0, 7);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // ---- LIGHTS ----
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);

        const frontLight = new THREE.DirectionalLight(0x00e5cc, 2.5);
        frontLight.position.set(0, 3, 6);
        scene.add(frontLight);

        const backLight = new THREE.DirectionalLight(0x5064ff, 1.8);
        backLight.position.set(-4, -2, -4);
        scene.add(backLight);

        const topLight = new THREE.PointLight(0x00e5cc, 1.5, 20);
        topLight.position.set(0, 6, 3);
        scene.add(topLight);

        // ---- MATERIALS ----
        const chipBodyMat = new THREE.MeshStandardMaterial({
            color: 0x1a2035,
            metalness: 0.85,
            roughness: 0.2,
            envMapIntensity: 1.0,
        });

        const pinMat = new THREE.MeshStandardMaterial({
            color: 0x9ab8c8,
            metalness: 0.98,
            roughness: 0.1,
        });

        const traceMat = new THREE.MeshStandardMaterial({
            color: 0x00e5cc,
            emissive: 0x00e5cc,
            emissiveIntensity: 0.6,
            metalness: 0.5,
            roughness: 0.3,
        });

        const coreMat = new THREE.MeshStandardMaterial({
            color: 0x0a0f1e,
            metalness: 0.6,
            roughness: 0.4,
        });

        // ---- CHIP BODY ----
        const chipGroup = new THREE.Group();

        const bodyGeo = new THREE.BoxGeometry(3.2, 3.2, 0.35, 1, 1, 1);
        const body = new THREE.Mesh(bodyGeo, chipBodyMat);
        chipGroup.add(body);

        // ---- DIE (center square) ----
        const dieGeo = new THREE.BoxGeometry(1.8, 1.8, 0.05);
        const die = new THREE.Mesh(dieGeo, coreMat);
        die.position.z = 0.2;
        chipGroup.add(die);

        // ---- CIRCUIT TRACE LINES ON DIE ----
        const makeTrace = (x, y, w, h) => {
            const geo = new THREE.BoxGeometry(w, h, 0.03);
            const mesh = new THREE.Mesh(geo, traceMat);
            mesh.position.set(x, y, 0.23);
            return mesh;
        };
        chipGroup.add(makeTrace(0, 0, 1.6, 0.05));
        chipGroup.add(makeTrace(0, 0, 0.05, 1.6));
        chipGroup.add(makeTrace(0.5, 0.5, 0.5, 0.04));
        chipGroup.add(makeTrace(-0.5, -0.5, 0.5, 0.04));
        chipGroup.add(makeTrace(0.5, -0.3, 0.04, 0.6));
        chipGroup.add(makeTrace(-0.5, 0.3, 0.04, 0.6));

        // ---- CENTER CORE DOT ----
        const coreGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16);
        const core = new THREE.Mesh(coreGeo, traceMat);
        core.rotation.x = Math.PI / 2;
        core.position.z = 0.24;
        chipGroup.add(core);

        // ---- PINS (all 4 sides) ----
        const pinGeo = new THREE.BoxGeometry(0.12, 0.35, 0.08);
        const PIN_COLS = 6;
        const SPACING = 0.38;
        const OFFSET = -(PIN_COLS - 1) * SPACING / 2;

        for (let i = 0; i < PIN_COLS; i++) {
            const x = OFFSET + i * SPACING;

            // Top pins
            const topPin = new THREE.Mesh(pinGeo, pinMat);
            topPin.position.set(x, 1.77, 0);
            chipGroup.add(topPin);

            // Bottom pins
            const botPin = new THREE.Mesh(pinGeo, pinMat);
            botPin.position.set(x, -1.77, 0);
            chipGroup.add(botPin);

            // Left pins (rotated 90deg)
            const leftPin = new THREE.Mesh(pinGeo, pinMat);
            leftPin.rotation.z = Math.PI / 2;
            leftPin.position.set(-1.77, x, 0);
            chipGroup.add(leftPin);

            // Right pins (rotated 90deg)
            const rightPin = new THREE.Mesh(pinGeo, pinMat);
            rightPin.rotation.z = Math.PI / 2;
            rightPin.position.set(1.77, x, 0);
            chipGroup.add(rightPin);
        }

        // ---- CORNER MARKERS ----
        const cornerMat = new THREE.MeshStandardMaterial({ color: 0x00e5cc, emissive: 0x00e5cc, emissiveIntensity: 0.8 });
        const cornerGeo = new THREE.SphereGeometry(0.07, 8, 8);
        const corners = [
            [-1.4, 1.4], [1.4, 1.4], [-1.4, -1.4], [1.4, -1.4]
        ];
        corners.forEach(([cx, cy]) => {
            const c = new THREE.Mesh(cornerGeo, cornerMat);
            c.position.set(cx, cy, 0.2);
            chipGroup.add(c);
        });

        // ---- EDGE CHAMFER GLOW (lines) ----
        const edgeMat = new THREE.LineBasicMaterial({ color: 0x00e5cc, transparent: true, opacity: 0.35 });
        const edgePts = [
            new THREE.Vector3(-1.6, 1.6, 0.18),
            new THREE.Vector3(1.6, 1.6, 0.18),
            new THREE.Vector3(1.6, -1.6, 0.18),
            new THREE.Vector3(-1.6, -1.6, 0.18),
            new THREE.Vector3(-1.6, 1.6, 0.18),
        ];
        const edgeGeo = new THREE.BufferGeometry().setFromPoints(edgePts);
        const edgeLine = new THREE.Line(edgeGeo, edgeMat);
        chipGroup.add(edgeLine);

        chipGroup.rotation.x = 0.3;
        chipGroup.rotation.y = 0.25;
        scene.add(chipGroup);

        // ---- PARTICLES (floating dots) ----
        const particleCount = 150;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 14;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 3;
        }
        const partGeo = new THREE.BufferGeometry();
        partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const partMat = new THREE.PointsMaterial({ color: 0x00e5cc, size: 0.04, transparent: true, opacity: 0.4 });
        const particles = new THREE.Points(partGeo, partMat);
        scene.add(particles);

        // ---- MOUSE INTERACTION ----
        let targetRotX = 0.3;
        let targetRotY = 0.25;
        let curRotX = 0.3;
        let curRotY = 0.25;

        window.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / rect.width - 0.5;
            const my = (e.clientY - rect.top) / rect.height - 0.5;
            targetRotY = mx * 1.2;
            targetRotX = my * 0.8;
        });

        // Idle float
        let clock = 0;

        // ---- ANIMATION LOOP ----
        function animate() {
            requestAnimationFrame(animate);
            clock += 0.008;

            // Smooth interpolation toward target rotation
            curRotX += (targetRotX - curRotX) * 0.06;
            curRotY += (targetRotY - curRotY) * 0.06;

            chipGroup.rotation.x = curRotX + Math.sin(clock * 0.7) * 0.04;
            chipGroup.rotation.y = curRotY + Math.sin(clock * 0.5) * 0.06;
            chipGroup.position.y = Math.sin(clock * 0.9) * 0.12;

            particles.rotation.y += 0.0008;

            renderer.render(scene, camera);
        }
        animate();

        // ---- RESIZE ----
        window.addEventListener('resize', () => {
            const nw = container.clientWidth;
            const nh = container.clientHeight;
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh);
        });
    }

    // =========================================
    // 2. MOBILE MENU
    // =========================================
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
        });
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => mobileNav.classList.remove('open'));
        });
    }

    // =========================================
    // 3. NAVBAR ACTIVE LINK — scroll spy
    // =========================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(l => l.classList.remove('active'));
                const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
                if (active) active.classList.add('active');
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => observer.observe(s));

    // =========================================
    // 4. DARMI SIMULATOR
    // =========================================
    const btnUnlock = document.getElementById('btnUnlock');
    const btnLock = document.getElementById('btnLock');
    const lockIndicator = document.getElementById('lockIndicator');
    const doorStatus = document.getElementById('doorStatus');
    const consoleLogs = document.getElementById('consoleLogs');

    let isLocked = true;

    function log(message, type = 'info') {
        const now = new Date();
        const ts = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
        const line = document.createElement('div');
        line.className = `log-line ${type}`;
        line.textContent = `[${ts}] ${message}`;
        consoleLogs.appendChild(line);
        consoleLogs.scrollTop = consoleLogs.scrollHeight;
    }

    function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    if (btnUnlock && btnLock) {
        btnUnlock.addEventListener('click', async () => {
            if (!isLocked) return;
            btnUnlock.disabled = true;

            log('[CMD] UNLOCK payload transmitted.', 'warn');
            await delay(600);
            log('[AUTH] Token validated. Handshake OK.', 'info');
            await delay(500);
            log('[ACT] Relay energized → UNLOCKED.', 'success');

            isLocked = false;
            lockIndicator.classList.replace('locked', 'unlocked');
            lockIndicator.innerHTML = '<i class="fas fa-lock-open"></i>';
            doorStatus.textContent = 'STATE: UNLOCKED';

            btnLock.disabled = false;
        });

        btnLock.addEventListener('click', async () => {
            if (isLocked) return;
            btnLock.disabled = true;

            log('[CMD] LOCK payload transmitted.', 'warn');
            await delay(600);
            log('[AUTH] Re-auth confirmed.', 'info');
            await delay(500);
            log('[ACT] Relay deactivated → LOCKED.', 'success');

            isLocked = true;
            lockIndicator.classList.replace('unlocked', 'locked');
            lockIndicator.innerHTML = '<i class="fas fa-lock"></i>';
            doorStatus.textContent = 'STATE: LOCKED_SECURE';

            btnUnlock.disabled = false;
        });
    }

    // =========================================
    // 5. SCROLL — fade-in for sections
    // =========================================
    const fadeSections = document.querySelectorAll('section, .bento-panel');
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    fadeSections.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(28px)';
        el.style.transition = 'opacity 0.65s ease, transform 0.65s ease';
        fadeObserver.observe(el);
    });

});
