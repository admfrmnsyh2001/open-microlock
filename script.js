/* =====================================================
   OPEN MICROLOCK — script.js
   3D Interactive Chip + DARMI Simulator Logic
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {


    // =========================================
    // 1. THREE.JS WEBGL ICOSAHEDRON ANIMATION
    // =========================================

    const mountEl = document.getElementById('threeCanvas');

    if (mountEl && typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.z = 3;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountEl.appendChild(renderer.domElement);

        const geometry = new THREE.IcosahedronGeometry(1.2, 20);

        const vertexShader = `
            uniform float time;
            varying vec3 vNormal;
            varying vec3 vPosition;

            vec3 mod289v3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289v4(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289v4(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

            float snoise(vec3 v) {
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                vec3 i  = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;
                i = mod289v3(i);
                vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                float n_ = 0.142857142857;
                vec3 ns = n_ * D.wyz - D.xzx;
                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);
                vec4 x = x_ * ns.x + ns.yyyy;
                vec4 y = y_ * ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);
                vec4 b0 = vec4(x.xy, y.xy);
                vec4 b1 = vec4(x.zw, y.zw);
                vec4 s0 = floor(b0)*2.0+1.0;
                vec4 s1 = floor(b1)*2.0+1.0;
                vec4 sh = -step(h, vec4(0.0));
                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
                vec3 p0 = vec3(a0.xy,h.x);
                vec3 p1 = vec3(a0.zw,h.y);
                vec3 p2 = vec3(a1.xy,h.z);
                vec3 p3 = vec3(a1.zw,h.w);
                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
                p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
                vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
            }

            void main() {
                vNormal = normal;
                vPosition = position;
                float displacement = snoise(position * 2.0 + time * 0.5) * 0.2;
                vec3 newPosition = position + normal * displacement;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
        `;

        const fragmentShader = `
            uniform vec3 color;
            uniform vec3 pointLightPos;
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 lightDir = normalize(pointLightPos - vPosition);
                float diffuse = max(dot(normal, lightDir), 0.0);
                float fresnel = 1.0 - dot(normal, vec3(0.0, 0.0, 1.0));
                fresnel = pow(fresnel, 2.0);
                vec3 finalColor = color * diffuse + color * fresnel * 0.5;
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pointLightPos: { value: new THREE.Vector3(0, 0, 5) },
                color: { value: new THREE.Color(0x00e5cc) }
            },
            vertexShader,
            fragmentShader,
            wireframe: true
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(0, 0, 5);
        scene.add(pointLight);

        let frameId;
        function animateScene(t) {
            material.uniforms.time.value = t * 0.0003;
            mesh.rotation.y += 0.0005;
            mesh.rotation.x += 0.0002;
            renderer.render(scene, camera);
            frameId = requestAnimationFrame(animateScene);
        }
        animateScene(0);

        // Resize handler
        function handleThreeResize() {
            const w = mountEl.clientWidth;
            const h = mountEl.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
        window.addEventListener('resize', handleThreeResize);

        // Mouse-tracking light
        window.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = -(e.clientY / window.innerHeight) * 2 + 1;
            const vec = new THREE.Vector3(x, y, 0.5).unproject(camera);
            const dir = vec.sub(camera.position).normalize();
            const dist = -camera.position.z / dir.z;
            const pos = camera.position.clone().add(dir.multiplyScalar(dist));
            pointLight.position.copy(pos);
            material.uniforms.pointLightPos.value = pos;
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
