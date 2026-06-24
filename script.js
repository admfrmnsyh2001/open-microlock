// ==========================================================================
// UTILITY FUNCTIONS & AUDIO SYNTHESIZER
// ==========================================================================

// Play procedural retro-futuristic sound effects using Web Audio API
function playSynthSound(type) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        if (type === 'click') {
            // Short click/beep
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
        } else if (type === 'success') {
            // High-pitched secure positive double beep
            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1318.51, audioCtx.currentTime + 0.1); // E6
            
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
            
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc1.start();
            osc1.stop(audioCtx.currentTime + 0.15);
            osc2.start(audioCtx.currentTime + 0.1);
            osc2.stop(audioCtx.currentTime + 0.35);
        } else if (type === 'lock') {
            // Descending status sound
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
            osc.frequency.exponentialRampToValueAtTime(261.63, audioCtx.currentTime + 0.3); // C4
            
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'process') {
            // Processing pulse beep
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.05);
        }
    } catch (e) {
        console.warn("Audio Context blocked or not supported by browser security settings until user interacts.", e);
    }
}

// ==========================================================================
// NAVBAR & MOBILE MENU LOGIC
// ==========================================================================
const navbar = document.querySelector('.navbar');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav a');

// Toggle scroll class on navbar
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Auto active link on scroll
    let current = '';
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (window.pageYOffset >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Mobile menu toggle open/close
mobileMenuToggle.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    const icon = mobileMenuToggle.querySelector('i');
    if (mobileNav.classList.contains('open')) {
        icon.className = 'fas fa-xmark';
    } else {
        icon.className = 'fas fa-bars';
    }
});

// Close mobile nav when link is clicked
mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        mobileMenuToggle.querySelector('i').className = 'fas fa-bars';
    });
});

// ==========================================================================
// DARMI SIMULATOR CONTROLS
// ==========================================================================
const btnUnlock = document.getElementById('btnUnlock');
const btnLock = document.getElementById('btnLock');
const lockIndicator = document.getElementById('lockIndicator');
const doorStatus = document.getElementById('doorStatus');
const consoleLogs = document.getElementById('consoleLogs');

function addLogLine(text, type = 'info') {
    const line = document.createElement('div');
    line.className = `log-line ${type}`;
    
    // Get timestamp
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    
    line.innerText = `[${timeStr}] ${text}`;
    consoleLogs.appendChild(line);
    
    // Auto scroll console to bottom
    consoleLogs.scrollTop = consoleLogs.scrollHeight;
}

// Sequence lists for simulator operations
const unlockSequence = [
    { text: '[CLIENT] Sending REST secure unlock request to Cloud server...', type: 'info', delay: 400 },
    { text: '[SERVER] Request received. Matching device token metadata...', type: 'system', delay: 800 },
    { text: '[SERVER] User verification SUCCESS: "ADMIN_REVANZA" approved.', type: 'success', delay: 600 },
    { text: '[MQTT] Publishing command payloads to broker...', type: 'info', delay: 400 },
    { text: '[MQTT] Broker routed payload -> openmicrolock/device/01/control', type: 'info', delay: 700 },
    { text: '[ESP32] Packet received! Length: 64 bytes. Decoding...', type: 'warning', delay: 900 },
    { text: '[CRYPT] Deciphering RSA-2048 Digital Signature: Match!', type: 'success', delay: 500 },
    { text: '[HARDWARE] Pin 12 (Solenoid Relay) set to HIGH.', type: 'system', delay: 400 },
    { text: '[HARDWARE] Feedback loop sensor: Magnetic bolt disengaged.', type: 'success', delay: 500 }
];

const lockSequence = [
    { text: '[CLIENT] Sending remote lock request payload...', type: 'info', delay: 500 },
    { text: '[MQTT] Broker routed payload: CMD="LOCK"', type: 'info', delay: 600 },
    { text: '[ESP32] Signature check OK. Setting Pin 12 to LOW.', type: 'system', delay: 400 },
    { text: '[HARDWARE] Solenoid relay deactivated.', type: 'warning', delay: 500 },
    { text: '[HARDWARE] Feedback loop sensor: Bolt locked in position.', type: 'success', delay: 400 }
];

async function runSequence(sequence) {
    for (const step of sequence) {
        await new Promise(resolve => setTimeout(resolve, step.delay));
        addLogLine(step.text, step.type);
        playSynthSound('process');
    }
}

// Unlock Command Execution
btnUnlock.addEventListener('click', async () => {
    btnUnlock.disabled = true;
    playSynthSound('click');
    addLogLine('----------------------------------------------------', 'system');
    addLogLine('[SYSTEM] Initiating DARMI Secure Access Command...', 'command');
    
    // Run async log simulator
    await runSequence(unlockSequence);
    
    // Unlock state updates
    lockIndicator.classList.remove('locked');
    lockIndicator.classList.add('unlocked');
    lockIndicator.querySelector('i').className = 'fas fa-lock-open';
    lockIndicator.querySelector('.indicator-text').innerText = 'UNLOCKED';
    
    doorStatus.innerText = 'Solenoid: Aktif (Unlocked)';
    doorStatus.style.borderColor = 'var(--color-success)';
    doorStatus.style.color = 'var(--color-success)';
    
    addLogLine('[SYSTEM] Operation completed. Solenoid is now OPEN.', 'success');
    playSynthSound('success');
    
    btnLock.disabled = false;
});

// Lock Command Execution
btnLock.addEventListener('click', async () => {
    btnLock.disabled = true;
    playSynthSound('click');
    addLogLine('----------------------------------------------------', 'system');
    addLogLine('[SYSTEM] Initiating Secure Lock Command...', 'command');
    
    // Run async log simulator
    await runSequence(lockSequence);
    
    // Lock state updates
    lockIndicator.classList.remove('unlocked');
    lockIndicator.classList.add('locked');
    lockIndicator.querySelector('i').className = 'fas fa-lock';
    lockIndicator.querySelector('.indicator-text').innerText = 'LOCKED';
    
    doorStatus.innerText = 'Solenoid: Non-Aktif (Locked)';
    doorStatus.style.borderColor = 'rgba(255,255,255,0.05)';
    doorStatus.style.color = 'var(--text-muted)';
    
    addLogLine('[SYSTEM] Operation completed. Lock SECURED.', 'success');
    playSynthSound('lock');
    
    btnUnlock.disabled = false;
});

// ==========================================================================
// TIMELINE TAB SWITCHER
// ==========================================================================
const tabBtns = document.querySelectorAll('.tab-btn');
const timelineWrappers = document.querySelectorAll('.timeline-container-wrapper');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        playSynthSound('click');
        
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        timelineWrappers.forEach(wrapper => wrapper.classList.remove('active'));
        const targetId = btn.getAttribute('data-target');
        const targetTimeline = document.getElementById(targetId);
        targetTimeline.classList.add('active');
        
        // Trigger reveal immediately for visible items in the active tab
        const items = targetTimeline.querySelectorAll('.timeline-item');
        items.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('revealed');
            }
        });
    });
});

// ==========================================================================
// SCROLL REVEAL ANIMATIONS (Intersection Observer)
// ==========================================================================
const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target); // Only animate once
        }
    });
}, revealOptions);

// Add class for styling transition setup
document.querySelectorAll('.about-card, .timeline-item, .node-card, .profile-card, .sim-panel').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    
    // Custom inline style mapping for reveal animation helper
    revealObserver.observe(el);
});

// Add transition trigger rules in script-injected CSS
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    .revealed {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    .timeline-item.left {
        transform: translateX(-30px);
    }
    .timeline-item.right {
        transform: translateX(30px);
    }
    .timeline-item.left.revealed, .timeline-item.right.revealed {
        transform: translateX(0) !important;
    }
`;
document.head.appendChild(styleSheet);

// ==========================================================================
// JOIN FORM SUBMISSION
// ==========================================================================
const joinForm = document.getElementById('joinForm');
const formSuccess = document.getElementById('formSuccess');

joinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    playSynthSound('click');
    
    const submitBtn = joinForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'Mengirim data...';
    submitBtn.disabled = true;
    
    // Simulate API request delay
    setTimeout(() => {
        playSynthSound('success');
        formSuccess.classList.add('show');
        joinForm.reset();
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }, 1500);
});
