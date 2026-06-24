/* =====================================================
   OPEN MICROLOCK — script.js
   3D Interactive Chip + DARMI Simulator Logic
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {


    // =========================================
    // 1. CHIP IMAGE — 3D CSS TILT INTERACTION
    // =========================================

    const chipTilt = document.getElementById('chipTilt');
    const chipImg = document.getElementById('chipImg');

    if (chipTilt && chipImg) {
        let rafId = null;
        let targetRotX = 0, targetRotY = 0;
        let curRotX = 0, curRotY = 0;
        let idleAngle = 0;
        let isHovering = false;

        // Smooth interpolation loop
        function animateChip() {
            rafId = requestAnimationFrame(animateChip);

            if (!isHovering) {
                idleAngle += 0.012;
                targetRotX = Math.sin(idleAngle * 0.7) * 6;
                targetRotY = Math.sin(idleAngle * 0.5) * 8;
            }

            curRotX += (targetRotX - curRotX) * 0.08;
            curRotY += (targetRotY - curRotY) * 0.08;

            chipTilt.style.transform = `perspective(700px) rotateX(${curRotX}deg) rotateY(${curRotY}deg)`;

            // Dynamic glow follows tilt
            const glowX = 50 + curRotY * 1.5;
            const glowY = 50 - curRotX * 1.5;
            chipImg.style.filter = `
                drop-shadow(0 0 40px rgba(0,229,204,0.35))
                drop-shadow(0 20px 60px rgba(0,0,0,0.8))
                drop-shadow(${curRotY * 0.5}px ${-curRotX * 0.5}px 30px rgba(0,229,204,0.2))
            `;
        }
        animateChip();

        // Mouse move → track inside hero only
        const heroSection = document.getElementById('home');
        if (heroSection) {
            heroSection.addEventListener('mousemove', (e) => {
                const rect = chipTilt.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (e.clientX - cx) / (rect.width * 0.5);
                const dy = (e.clientY - cy) / (rect.height * 0.5);

                isHovering = true;
                targetRotX = -dy * 18;
                targetRotY = dx * 22;
            });

            heroSection.addEventListener('mouseleave', () => {
                isHovering = false;
            });
        }
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
