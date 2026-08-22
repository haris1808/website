document.addEventListener('DOMContentLoaded', () => {

    // ==================== PWA SERVICE WORKER REGISTRATION ====================
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').then((reg) => {
                console.log('PWA ServiceWorker registered with scope: ', reg.scope);
            }).catch((err) => {
                console.log('PWA ServiceWorker registration failed: ', err);
            });
        });
    }

    // ==================== THEME TOGGLE ====================
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    function setTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'dark');
        }
    }

    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            setTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
    }

    // ==================== PRELOADER ====================
    const preloader = document.getElementById('preloader');
    const terminalLines = document.querySelectorAll('.terminal-line');
    const preloaderProgress = document.querySelector('.preloader-progress');

    let loadProgress = 0;
    const loadInterval = setInterval(() => {
        loadProgress += Math.random() * 20 + 10;
        if (loadProgress > 100) loadProgress = 100;
        if (preloaderProgress) preloaderProgress.style.width = loadProgress + '%';
        if (loadProgress >= 100) clearInterval(loadInterval);
    }, 150);

    terminalLines.forEach((line) => {
        const delay = parseInt(line.getAttribute('data-delay') || '0');
        setTimeout(() => line.classList.add('visible'), delay);
    });

    setTimeout(() => {
        if (preloader) {
            preloader.classList.add('hidden');
            document.body.classList.add('loaded');
        }
    }, 1600);

    // ==================== SCROLL PROGRESS & ACTIVE NAV ====================
    const scrollProgress = document.getElementById('scrollProgress');
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');
    const navLinks = document.querySelectorAll('.nav-link');
    const bottomNavLinks = document.querySelectorAll('.mobile-bottom-nav .nav-item');
    const sections = document.querySelectorAll('section');

    function onScroll() {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // Progress bar & Circular Progress Ring
        if (docHeight > 0) {
            const scrollPercent = (scrollY / docHeight) * 100;
            if (scrollProgress) {
                scrollProgress.style.width = scrollPercent + '%';
            }
            const circle = document.getElementById('progressRingCircle');
            if (circle) {
                const circumference = 2 * Math.PI * 20; // 125.66px (r=20)
                const offset = circumference - (scrollPercent / 100) * circumference;
                circle.style.strokeDashoffset = Math.max(0, offset);
            }
        }

        // Hero Parallax Depth Effect
        const heroContent = document.querySelector('.hero-content');
        const heroParticles = document.getElementById('particles');
        if (heroContent && scrollY < 750) {
            heroContent.style.transform = `translateY(${scrollY * 0.14}px)`;
            heroContent.style.opacity = `${Math.max(0, 1 - scrollY / 620)}`;
        }
        if (heroParticles && scrollY < 750) {
            heroParticles.style.transform = `translateY(${scrollY * 0.28}px)`;
        }

        // Navbar blur on scroll
        if (navbar) {
            if (scrollY > 40) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // Back to top button
        if (backToTop) {
            if (scrollY > 350) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        // Active nav highlighting
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });

                bottomNavLinks.forEach(link => {
                    if (link.tagName === 'A') {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + sectionId) {
                            link.classList.add('active');
                        }
                    }
                });
            }
        });

        // Scroll reveals
        document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
            const top = el.getBoundingClientRect().top;
            if (top < window.innerHeight - 60) {
                el.classList.add('active');
            }
        });

        // Stagger reveals
        document.querySelectorAll('.skills-grid, .services-grid, .cert-grid, .case-studies-grid, .showcase-grid, .estimator-wrapper').forEach(grid => {
            const top = grid.getBoundingClientRect().top;
            if (top < window.innerHeight - 40) {
                grid.querySelectorAll('.reveal-stagger').forEach((el, i) => {
                    setTimeout(() => el.classList.add('active'), i * 80);
                });
            }
        });

        // Skill progress bars
        document.querySelectorAll('.skill-progress').forEach(bar => {
            const top = bar.getBoundingClientRect().top;
            if (top < window.innerHeight - 30) {
                bar.style.width = bar.getAttribute('data-progress') + '%';
            }
        });

        // Hero Stats Counter
        animateStats();
    }

    // ==================== HERO STATS ROLLING COUNTER ====================
    let statsAnimated = false;
    function animateStats() {
        if (statsAnimated) return;
        const statsGrid = document.querySelector('.hero-stats');
        if (!statsGrid) return;
        const rect = statsGrid.getBoundingClientRect();
        if (rect.top < window.innerHeight - 20) {
            statsAnimated = true;
            document.querySelectorAll('.stat-number').forEach(stat => {
                const target = parseFloat(stat.getAttribute('data-count'));
                if (isNaN(target)) return;
                const duration = 1500;
                const startTime = performance.now();
                function step(now) {
                    const progress = Math.min((now - startTime) / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 3);
                    const current = Math.floor(ease * target);
                    stat.textContent = current;
                    if (progress < 1) {
                        requestAnimationFrame(step);
                    } else {
                        stat.textContent = target;
                    }
                }
                requestAnimationFrame(step);
            });
        }
    }

    // ==================== 3D PERSPECTIVE CARD TILT ====================
    function init3DCardTilt() {
        const tiltElements = document.querySelectorAll('.tilt-card, .service-card, .case-card, .compare-card, .cert-card, .contact-item, .estimator-controls-card, .estimator-summary-card');
        tiltElements.forEach(card => {
            card.style.transformStyle = 'preserve-3d';

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -6.5;
                const rotateY = ((x - centerX) / centerX) * 6.5;

                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease';
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });

            card.addEventListener('mouseenter', () => {
                card.style.transition = 'transform 0.08s ease-out, box-shadow 0.2s ease';
            });
        });
    }
    init3DCardTilt();

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ==================== MOBILE DRAWER NAVIGATION ====================
    const hamburger = document.getElementById('hamburger');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerClose = document.getElementById('drawerClose');
    const navOverlay = document.getElementById('navOverlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    function openDrawer() {
        hamburger.classList.add('active');
        mobileDrawer.classList.add('active');
        navOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        hamburger.classList.remove('active');
        mobileDrawer.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (hamburger) hamburger.addEventListener('click', () => {
        mobileDrawer.classList.contains('active') ? closeDrawer() : openDrawer();
    });
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (navOverlay) navOverlay.addEventListener('click', () => {
        closeDrawer();
        closeTerminalModal();
        closeWaModal();
        closeCVModal();
    });

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeDrawer);
    });

    // ==================== TYPING ANIMATION ====================
    const typingTexts = {
        en: ['IT Support Specialist', 'Network Engineer', 'Hardware & System Troubleshooter', 'SLA & Infrastructure Specialist'],
        id: ['Spesialis IT Support', 'Teknisi Jaringan & Router', 'Troubleshooter Hardware & Sistem', 'Spesialis SLA & Infrastruktur']
    };

    let currentLang = 'en';
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingElement = document.getElementById('typingText');

    function typeText() {
        if (!typingElement) return;
        const texts = typingTexts[currentLang];
        const currentText = texts[textIndex];

        if (isDeleting) {
            typingElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 35 : 75;

        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2200;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typeSpeed = 400;
        }

        setTimeout(typeText, typeSpeed);
    }
    typeText();

    // ==================== PARTICLES GENERATOR ====================
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        for (let i = 0; i < 28; i++) {
            const p = document.createElement('div');
            p.classList.add('particle');
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (Math.random() * 8 + 4) + 's';
            p.style.animationDelay = (Math.random() * 4) + 's';
            p.style.width = (Math.random() * 3 + 1.5) + 'px';
            p.style.height = p.style.width;
            particlesContainer.appendChild(p);
        }
    }

    // ==================== SKILLS TABS (SWIPEABLE) ====================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const swipeContainer = document.getElementById('skillsSwipeContainer');

    function activateTab(tabId) {
        tabBtns.forEach(b => {
            b.classList.remove('active');
            if (b.getAttribute('data-tab') === tabId) b.classList.add('active');
        });

        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
                content.querySelectorAll('.skill-progress').forEach(bar => {
                    bar.style.width = '0';
                    setTimeout(() => {
                        bar.style.width = bar.getAttribute('data-progress') + '%';
                    }, 50);
                });
            }
        });
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => activateTab(btn.getAttribute('data-tab')));
    });

    if (swipeContainer) {
        let touchStartX = 0;
        const tabOrder = ['hardware', 'software', 'network'];

        swipeContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        swipeContainer.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 60) {
                const currentActive = document.querySelector('.tab-btn.active').getAttribute('data-tab');
                let idx = tabOrder.indexOf(currentActive);
                if (diff > 0 && idx < tabOrder.length - 1) {
                    activateTab(tabOrder[idx + 1]);
                } else if (diff < 0 && idx > 0) {
                    activateTab(tabOrder[idx - 1]);
                }
            }
        }, { passive: true });
    }

    // ==================== CASE STUDIES CATEGORY FILTER ====================
    const caseFilterBtns = document.querySelectorAll('.case-filter-btn');
    const caseCards = document.querySelectorAll('.case-card');

    caseFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            caseFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');

            caseCards.forEach((card, index) => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'flex';
                    setTimeout(() => card.classList.add('active'), index * 60);
                } else {
                    card.style.display = 'none';
                    card.classList.remove('active');
                }
            });
        });
    });

    // ==================== COUNTER ANIMATION ====================
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersStarted = false;

    function startCounters() {
        if (countersStarted) return;
        statNumbers.forEach(stat => {
            const rect = stat.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                countersStarted = true;
                const target = parseInt(stat.getAttribute('data-count'));
                const duration = 1800;
                const increment = target / (duration / 16);
                let current = 0;

                const counter = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(counter);
                    }
                    stat.textContent = Math.floor(current);
                }, 16);
            }
        });
    }
    window.addEventListener('scroll', startCounters, { passive: true });
    startCounters();

    // ==================== TESTIMONIAL SLIDER ====================
    const track = document.getElementById('testimonialTrack');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    const dotsContainer = document.getElementById('testimonialDots');
    
    if (track) {
        const cards = track.querySelectorAll('.testimonial-card');
        let currentSlide = 0;
        let autoSlideInterval;

        cards.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('testimonial-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.testimonial-dot');

        function goToSlide(index) {
            currentSlide = index;
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
            dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
        }

        function nextSlide() { goToSlide((currentSlide + 1) % cards.length); }
        function prevSlide() { goToSlide((currentSlide - 1 + cards.length) % cards.length); }

        if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoSlide(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoSlide(); });

        function startAutoSlide() { autoSlideInterval = setInterval(nextSlide, 6000); }
        function resetAutoSlide() { clearInterval(autoSlideInterval); startAutoSlide(); }
        startAutoSlide();

        let touchStartX = 0;
        track.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        track.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextSlide(); else prevSlide();
                resetAutoSlide();
            }
        }, { passive: true });
    }

    // ==================== LANGUAGE TOGGLE ====================
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        const langLabel = langToggle.querySelector('.lang-label');
        langToggle.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'id' : 'en';
            langLabel.textContent = currentLang === 'en' ? 'EN' : 'ID';

            document.querySelectorAll('[data-en]').forEach(el => {
                const text = currentLang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-id-lang');
                if (text) {
                    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                        el.placeholder = text;
                    } else {
                        el.innerHTML = text;
                    }
                }
            });

            textIndex = 0;
            charIndex = 0;
            isDeleting = false;
        });
    }

    // ==================== 1. INTERACTIVE IT TERMINAL (CLI) ENGINE ====================
    const terminalOverlay = document.getElementById('terminalOverlay');
    const terminalInput = document.getElementById('terminalInput');
    const terminalOutput = document.getElementById('terminalOutput');
    const openTerminalNav = document.getElementById('openTerminalNav');
    let cmdHistory = [];
    let historyIndex = -1;

    window.openTerminalModal = function() {
        if (terminalOverlay) {
            terminalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            setTimeout(() => { if (terminalInput) terminalInput.focus(); }, 150);
        }
    };

    window.closeTerminalModal = function() {
        if (terminalOverlay) {
            terminalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    window.clearTerminal = function() {
        if (terminalOutput) terminalOutput.innerHTML = '';
    };

    if (openTerminalNav) openTerminalNav.addEventListener('click', openTerminalModal);

    // Keyboard shortcut to launch terminal: Ctrl + ` (Backtick) or Ctrl + Shift + T
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey && e.key === '`') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't')) {
            e.preventDefault();
            if (terminalOverlay.classList.contains('active')) {
                closeTerminalModal();
            } else {
                openTerminalModal();
            }
        }
    });

    const terminalCommands = {
        help: () => `
<span class="term-res-info">Available Diagnostic &amp; Exploration Commands:</span>
  <span class="highlight">help</span>       - Display this list of commands
  <span class="highlight">neofetch</span>   - System specification &amp; Haris profile summary
  <span class="highlight">skills</span>     - Technical competencies breakdown
  <span class="highlight">ping</span>       - Test connection latency (e.g. <code>ping google.com</code>)
  <span class="highlight">diagnose</span>   - Run full automated IT health check simulation
  <span class="highlight">status</span>     - Show current NOC health, SLA &amp; availability
  <span class="highlight">cases</span>      - List real troubleshooting case studies
  <span class="highlight">contact</span>    - Show direct contact channels
  <span class="highlight">theme</span>      - Toggle theme (e.g. <code>theme light</code> or <code>theme dark</code>)
  <span class="highlight">lang</span>       - Toggle language (e.g. <code>lang id</code> or <code>lang en</code>)
  <span class="highlight">matrix</span>     - Trigger green Matrix digital rain effect
  <span class="highlight">whoami</span>     - Display current user context
  <span class="highlight">date</span>       - Display current system timestamp
  <span class="highlight">clear</span>      - Clear terminal screen
  <span class="highlight">exit</span>       - Close this terminal session
`,
        neofetch: () => `
<pre style="color:#00d4ff; line-height: 1.3;">
       /\\         <span style="color:#fff; font-weight:700;">muhamadharis@it-support-hub</span>
      /  \\        ---------------------------
     /\\   \\       <span style="color:#7c3aed;">OS:</span> Arch Linux / Windows 11 Enterprise
    /  __  \\      <span style="color:#7c3aed;">Host:</span> Custom Ryzen Workstation &amp; MikroTik CCR
   /  (  )  \\     <span style="color:#7c3aed;">Kernel:</span> 6.8.9-zen1-hardened
  /__/""\\____\\    <span style="color:#7c3aed;">Uptime:</span> 5+ Years in IT Support Operations
                  <span style="color:#7c3aed;">Shell:</span> Bash / PowerShell 7.4
                  <span style="color:#7c3aed;">Certifications:</span> CompTIA A+, CCNA Core, MTCNA
                  <span style="color:#7c3aed;">Specialization:</span> Hardware Diagnostics &amp; LAN/WLAN Routing
                  <span style="color:#7c3aed;">SLA Target:</span> 99.9% Uptime
</pre>
`,
        skills: () => `
<span class="term-res-info">[HARDWARE]</span> PC/Server Assembly, Motherboard Repair, Component Testing, S.M.A.R.T Drive Diagnostics, Thermal Overhaul.
<span class="term-res-info">[NETWORK]</span>  MikroTik RouterOS, VLAN Segmentation, RSTP Loop Prevention, LAN Crimping, Access Point Setup, Wireshark.
<span class="term-res-info">[SYSTEM]</span>   Windows 10/11 Deployment, Windows Server, Linux Ubuntu, Sysprep/DISM, Clonezilla, M365 Admin.
<span class="term-res-info">[SECURITY]</span> Centralized Antivirus, Malware Mitigation, USB Lockdown, Scheduled Offsite Backups.
`,
        diagnose: () => `
<span class="term-res-info">Initiating Full Enterprise Diagnostic Routine...</span>
[✓] CPU Thermal Margin: <span class="term-res-success">41°C (Normal)</span>
[✓] RAM Integrity: <span class="term-res-success">MemTest86 Clean (0 Errors)</span>
[✓] Storage Health: <span class="term-res-success">NVMe SSD S.M.A.R.T OK (Health: 99%)</span>
[✓] Network Gateway: <span class="term-res-success">192.168.1.1 Responsive (RTT &lt;1ms)</span>
[✓] DNS Resolution: <span class="term-res-success">1.1.1.1 / 8.8.8.8 Resolved in 12ms</span>
[✓] Antivirus Signature: <span class="term-res-success">Up to date (Definition: Active)</span>
<span class="term-res-success">>> All Diagnostic Tests PASSED! System is 100% stable and operational.</span>
`,
        status: () => `
<span class="term-res-success">● SYSTEM STATUS: OPERATIONAL</span>
- Work Status: <span class="highlight">Available for Full-time / Project Hire</span>
- Average SLA Resolution Time: <span class="highlight">&lt; 15 Minutes</span>
- Enterprise Failure Reduction Rate: <span class="highlight">35%</span>
- Location: Palembang, Indonesia (Available On-Site &amp; Remote)
`,
        cases: () => `
<span class="term-res-info">Highlighted Case Studies:</span>
1. <span class="highlight">Broadcast Storm Recovery</span> - Resolved LAN packet loss &amp; looping with RSTP on MikroTik.
2. <span class="highlight">Zero-Loss POS Storage Migration</span> - Cloned failing HDD to NVMe SSD with Clonezilla.
3. <span class="highlight">Ransomware Containment</span> - Sanitized 5 infected branch machines with persistent autoruns cleanup.
4. <span class="highlight">50+ PC Golden Image Rollout</span> - Automated Windows deployment via Sysprep &amp; unattended XML in 48h.
Type <span class="highlight">contact</span> to request detailed technical documentation.
`,
        contact: () => `
<span class="term-res-info">Direct Channels to Reach Muhamad Haris:</span>
- WhatsApp : <a href="https://wa.me/6281517318354" target="_blank" style="color:#25d366;">+62 815-1731-8354</a>
- Email    : <a href="mailto:mhrs.354@gmail.com" style="color:#00d4ff;">mhrs.354@gmail.com</a>
- Location : Palembang, Sumatera Selatan, Indonesia
`,
        whoami: () => `<span class="highlight">guest_recruiter@muhamadharis-hub (Authorized Read-Only Session)</span>`,
        date: () => new Date().toString(),
        matrix: () => {
            let stream = '';
            for (let i = 0; i < 15; i++) {
                stream += '<span style="color:#22c55e;">' + Array.from({length: 45}, () => String.fromCharCode(33 + Math.floor(Math.random() * 90))).join('') + '</span><br>';
            }
            return stream;
        },
        clear: () => { clearTerminal(); return ''; },
        exit: () => { closeTerminalModal(); return 'Closing session...'; }
    };

    if (terminalInput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const rawCmd = terminalInput.value.trim();
                terminalInput.value = '';
                if (!rawCmd) return;

                cmdHistory.push(rawCmd);
                historyIndex = cmdHistory.length;

                const parts = rawCmd.split(' ');
                const cmd = parts[0].toLowerCase();
                const arg = parts.slice(1).join(' ');

                const echoDiv = document.createElement('div');
                echoDiv.className = 'term-output-entry';
                echoDiv.innerHTML = `<div class="term-command-echo"><span class="term-user">guest@muhamadharis-pc</span>:<span class="term-path">~</span>$&nbsp;${rawCmd}</div>`;

                let responseHtml = '';

                if (cmd === 'ping') {
                    const host = arg || 'google.com';
                    responseHtml = `
PING ${host} (142.250.190.46): 56 data bytes
64 bytes from 142.250.190.46: icmp_seq=0 ttl=118 time=14.2 ms
64 bytes from 142.250.190.46: icmp_seq=1 ttl=118 time=13.8 ms
64 bytes from 142.250.190.46: icmp_seq=2 ttl=118 time=15.1 ms
--- ${host} ping statistics ---
3 packets transmitted, 3 packets received, <span class="term-res-success">0.0% packet loss</span>
round-trip min/avg/max = 13.8/14.3/15.1 ms
`;
                } else if (cmd === 'theme') {
                    if (arg === 'light' || arg === 'dark') {
                        setTheme(arg);
                        responseHtml = `<span class="term-res-success">Theme set to ${arg} mode.</span>`;
                    } else {
                        responseHtml = `<span class="term-res-warn">Usage: theme [dark|light]</span>`;
                    }
                } else if (cmd === 'lang') {
                    if (arg === 'id' || arg === 'en') {
                        if (currentLang !== arg) langToggle.click();
                        responseHtml = `<span class="term-res-success">Language changed to ${arg.toUpperCase()}.</span>`;
                    } else {
                        responseHtml = `<span class="term-res-warn">Usage: lang [id|en]</span>`;
                    }
                } else if (cmd === 'sudo') {
                    responseHtml = `<span class="term-res-error">[SECURITY AUDIT] guest is not in the sudoers file. This incident will be reported to Haris. 😉</span>`;
                } else if (terminalCommands[cmd]) {
                    responseHtml = terminalCommands[cmd]();
                } else {
                    responseHtml = `<span class="term-res-error">bash: ${cmd}: command not found. Type <span class="highlight">help</span> for commands.</span>`;
                }

                if (responseHtml) {
                    const resContent = document.createElement('div');
                    resContent.innerHTML = responseHtml;
                    echoDiv.appendChild(resContent);
                }

                terminalOutput.appendChild(echoDiv);
                terminalOverlay.querySelector('.terminal-body').scrollTop = terminalOverlay.querySelector('.terminal-body').scrollHeight;
            } else if (e.key === 'ArrowUp') {
                if (historyIndex > 0) {
                    historyIndex--;
                    terminalInput.value = cmdHistory[historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                if (historyIndex < cmdHistory.length - 1) {
                    historyIndex++;
                    terminalInput.value = cmdHistory[historyIndex];
                } else {
                    historyIndex = cmdHistory.length;
                    terminalInput.value = '';
                }
            }
        });
    }

    // ==================== 2. WHATSAPP PRESET BUILDER ====================
    const waModalOverlay = document.getElementById('waModalOverlay');
    const waCustomText = document.getElementById('waCustomText');
    const presetChips = document.querySelectorAll('.preset-chip');

    window.openWaModal = function() {
        if (waModalOverlay) {
            waModalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (waCustomText && !waCustomText.value) {
                const activeChip = document.querySelector('.preset-chip.active');
                if (activeChip) waCustomText.value = activeChip.getAttribute('data-msg');
            }
        }
    };

    window.closeWaModal = function() {
        if (waModalOverlay) {
            waModalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    presetChips.forEach(chip => {
        chip.addEventListener('click', () => {
            presetChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            if (waCustomText) waCustomText.value = chip.getAttribute('data-msg');
        });
    });

    window.sendWhatsAppMessage = function() {
        const text = waCustomText ? waCustomText.value.trim() : '';
        const phone = '6281517318354';
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text || 'Halo Haris, saya ingin berdiskusi.')}`;
        window.open(url, '_blank', 'noopener');
        closeWaModal();
    };

    // ==================== 3. ENHANCED CV MODAL & ATS DOWNLOAD ====================
    const cvModalOverlay = document.getElementById('cvModalOverlay');

    window.openCVModal = function() {
        if (cvModalOverlay) {
            cvModalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeCVModal = function() {
        if (cvModalOverlay) {
            cvModalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    window.printCV = function() {
        // Lepaskan lock overflow pada body sebelum dialog print dipanggil agar print preview langsung muncul
        const wasModalOpen = cvModalOverlay && cvModalOverlay.classList.contains('active');
        document.body.style.overflow = 'visible';

        const afterPrintHandler = function() {
            if (wasModalOpen) {
                document.body.style.overflow = 'hidden';
            }
            window.removeEventListener('afterprint', afterPrintHandler);
        };

        window.addEventListener('afterprint', afterPrintHandler);

        // Jeda mikro 30ms agar browser rendering engine langsung siap tanpa loading preview tertahan
        setTimeout(() => {
            window.print();
        }, 30);
    };

    window.downloadPdfCV = function() {
        const cvPaper = document.getElementById('cvPaper');
        if (!cvPaper) {
            window.print();
            return;
        }

        // Tampilkan feedback visual pada tombol jika diperlukan
        const downloadBtns = document.querySelectorAll('.cv-btn-download');
        downloadBtns.forEach(btn => {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>MENYIAPKAN PDF...</span>';
            btn.style.pointerEvents = 'none';
        });

        const restoreBtns = () => {
            downloadBtns.forEach(btn => {
                btn.innerHTML = '<i class="fas fa-file-pdf"></i> <span>DOWNLOAD PDF</span>';
                btn.style.pointerEvents = '';
            });
        };

        if (typeof html2pdf !== 'undefined') {
            const opt = {
                margin: [6, 8, 6, 8], // mm
                filename: 'CV_Muhamad_Haris_IT_Support.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2.5, useCORS: true, letterRendering: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            const clone = cvPaper.cloneNode(true);
            clone.style.boxShadow = 'none';
            clone.style.borderRadius = '0';
            clone.style.padding = '0';
            clone.style.background = '#ffffff';

            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.left = '-9999px';
            container.style.top = '0';
            container.style.width = '740px';
            container.style.background = '#ffffff';
            container.appendChild(clone);
            document.body.appendChild(container);

            html2pdf().set(opt).from(clone).save().then(() => {
                container.remove();
                restoreBtns();
            }).catch(err => {
                console.warn('html2pdf error, fallback ke print dialog:', err);
                container.remove();
                restoreBtns();
                window.print();
            });
        } else {
            restoreBtns();
            window.print();
        }
    };

    // ==================== 3D TILT & MAGNETIC (Desktop Only) ====================
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) {
        document.querySelectorAll('.tilt-card').forEach(card => {
            const glare = card.querySelector('.tilt-glare');
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / centerY * -6;
                const rotateY = (x - centerX) / centerX * 6;

                card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
                if (glare) {
                    const gx = (x / rect.width) * 100;
                    const gy = (y / rect.height) * 100;
                    glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.08), transparent 60%)`;
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
                card.style.transition = 'transform 0.4s ease';
                setTimeout(() => card.style.transition = '', 400);
            });
            card.addEventListener('mouseenter', () => { card.style.transition = 'none'; });
        });
    }

    // ==================== CONTACT FORM (Simulated + Web3Forms Ready) ====================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            const accessKey = contactForm.querySelector('input[name="access_key"]');
            if (!accessKey || accessKey.value === 'YOUR_ACCESS_KEY_HERE') {
                // Simulation mode
                e.preventDefault();
                const btn = contactForm.querySelector('.btn-submit');
                const span = btn.querySelector('span');
                const orig = span.textContent;
                span.textContent = currentLang === 'en' ? 'Sending Message...' : 'Mengirim Pesan...';
                btn.disabled = true;

                setTimeout(() => {
                    span.textContent = currentLang === 'en' ? '✓ Message Delivered!' : '✓ Pesan Terkirim!';
                    btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';

                    setTimeout(() => {
                        span.textContent = orig;
                        btn.style.background = '';
                        btn.disabled = false;
                        contactForm.reset();
                    }, 3000);
                }, 1200);
            }
        });
    }

    // ==================== 10. WEB AUDIO SYNTHESIZER & SOUND FX ====================
    let audioCtx = null;
    let isSoundEnabled = localStorage.getItem('mh_sound_enabled') !== 'false';

    const soundToggleBtn = document.getElementById('soundToggle');
    const soundIcon = document.getElementById('soundIcon');

    function updateSoundToggleUI() {
        if (soundToggleBtn && soundIcon) {
            if (isSoundEnabled) {
                soundToggleBtn.classList.remove('muted');
                soundIcon.className = 'fas fa-volume-up';
                soundToggleBtn.title = 'Sound FX: ON (Click to Mute)';
            } else {
                soundToggleBtn.classList.add('muted');
                soundIcon.className = 'fas fa-volume-mute';
                soundToggleBtn.title = 'Sound FX: MUTED (Click to Enable)';
            }
        }
    }

    if (soundToggleBtn) {
        updateSoundToggleUI();
        soundToggleBtn.addEventListener('click', () => {
            isSoundEnabled = !isSoundEnabled;
            localStorage.setItem('mh_sound_enabled', isSoundEnabled);
            updateSoundToggleUI();
            if (isSoundEnabled) playAudioClick();
        });
    }

    function initAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playAudioTone(freq, type = 'sine', duration = 0.08, gainVal = 0.05) {
        if (!isSoundEnabled) return;
        try {
            initAudio();
            if (!audioCtx) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {}
    }

    function playAudioClick() {
        playAudioTone(1200, 'sine', 0.04, 0.03);
    }

    function playAudioPing() {
        playAudioTone(880, 'triangle', 0.12, 0.06);
        setTimeout(() => playAudioTone(1320, 'sine', 0.15, 0.04), 60);
    }

    function playAudioSuccess() {
        playAudioTone(523.25, 'sine', 0.1, 0.05);
        setTimeout(() => playAudioTone(659.25, 'sine', 0.1, 0.05), 80);
        setTimeout(() => playAudioTone(783.99, 'sine', 0.18, 0.06), 160);
    }

    function playAudioAlert() {
        playAudioTone(350, 'sawtooth', 0.15, 0.06);
        setTimeout(() => playAudioTone(250, 'sawtooth', 0.2, 0.06), 120);
    }

    // Attach click sound to major interactive buttons
    document.querySelectorAll('.btn, .nav-link, .lab-tab-btn, .case-filter-btn, .preset-pill, .hamburger, .lang-toggle, .theme-toggle').forEach(el => {
        el.addEventListener('click', () => {
            playAudioClick();
        });
    });

    // ==================== 11. INTERACTIVE IT LAB (TOPOLOGY & SUBNET) ====================
    window.switchLabTab = function(tabName) {
        playAudioClick();
        document.querySelectorAll('.lab-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.lab-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        if (tabName === 'topology') {
            document.getElementById('labTopologyTab')?.classList.add('active');
        } else if (tabName === 'subnet') {
            document.getElementById('labSubnetTab')?.classList.add('active');
            calculateSubnet();
        }
    };

    window.runTopologyPacketTrace = function() {
        playAudioPing();
        const sourceSelect = document.getElementById('topoSource');
        const destSelect = document.getElementById('topoDest');
        const sourceVal = sourceSelect ? sourceSelect.value : 'office';
        const destVal = destSelect ? destSelect.value : 'server';

        const topoLog = document.getElementById('topoLogBody');
        if (!topoLog) return;
        
        // Highlight nodes
        document.querySelectorAll('.topo-node').forEach(node => {
            node.classList.remove('node-highlight-source', 'node-highlight-dest', 'node-packet-hit');
        });

        const sourceNode = document.getElementById(`node-${sourceVal}`);
        const destNode = document.getElementById(`node-${destVal}`);
        const switchNode = document.getElementById('node-switch');

        if (sourceNode) sourceNode.classList.add('node-highlight-source');
        if (destNode) destNode.classList.add('node-highlight-dest');

        // Animate cable paths
        document.querySelectorAll('.cable-line').forEach(line => line.classList.add('active-pulse'));

        const timeStr = new Date().toLocaleTimeString();
        let logHtml = `<div class="log-line text-primary"><strong>[${timeStr}] TRACE-ROUTE:</strong> ${sourceVal.toUpperCase()} &rarr; ${destVal.toUpperCase()}</div>`;
        logHtml += `<div class="log-line">&gt; Gateway: 192.168.1.1 (MikroTik RouterOS) | 802.1Q VLAN Tag: Checked</div>`;

        topoLog.innerHTML = logHtml + topoLog.innerHTML;

        setTimeout(() => {
            if (switchNode) switchNode.classList.add('node-packet-hit');
            const latency = (Math.random() * 0.4 + 0.15).toFixed(2);
            let packetLog = `<div class="log-line">&gt; 64 bytes from target: icmp_seq=1 ttl=64 time=${latency}ms [0% loss]</div>`;
            topoLog.innerHTML = packetLog + topoLog.innerHTML;
        }, 400);

        setTimeout(() => {
            if (destNode) destNode.classList.add('node-packet-hit');
            playAudioSuccess();
            const finishLog = `<div class="log-line log-success"><strong>[SUCCESS]</strong> Packet stream delivered with SLA 99.9% compliance. Route stable.</div>`;
            topoLog.innerHTML = finishLog + topoLog.innerHTML;

            setTimeout(() => {
                document.querySelectorAll('.cable-line').forEach(line => line.classList.remove('active-pulse'));
            }, 1200);
        }, 800);
    };

    window.runBroadcastStormSim = function() {
        playAudioAlert();
        const topoLog = document.getElementById('topoLogBody');
        if (!topoLog) return;
        const timeStr = new Date().toLocaleTimeString();

        let stormLog = `<div class="log-line log-danger"><strong>[${timeStr}] [ALERT] PHYSICAL LOOP DETECTED ON PORT 8!</strong></div>`;
        stormLog += `<div class="log-line log-warning">&gt; ARP Broadcast Rate: 14,200 pkt/sec (Threshold Exceeded)</div>`;
        topoLog.innerHTML = stormLog + topoLog.innerHTML;

        document.querySelectorAll('.cable-line').forEach(line => line.classList.add('active-pulse'));

        setTimeout(() => {
            playAudioSuccess();
            let mitigateLog = `<div class="log-line log-success">&gt; [RSTP LOOP PROTECT ACTIVATED] Port 8 isolated automatically.</div>`;
            mitigateLog += `<div class="log-line log-success"><strong>[RECOVERED]</strong> VLAN 10 (POS) &amp; VLAN 30 (Server) protected. Zero packet loss on critical branches.</div>`;
            topoLog.innerHTML = mitigateLog + topoLog.innerHTML;
            document.querySelectorAll('.cable-line').forEach(line => line.classList.remove('active-pulse'));
        }, 1200);
    };

    window.clearTopoLog = function() {
        playAudioClick();
        const topoLog = document.getElementById('topoLogBody');
        if (topoLog) {
            topoLog.innerHTML = '<div class="log-line text-muted">[Console Cleared] Ready for next packet trace.</div>';
        }
    };

    // --- Subnet Calculator Engine ---
    window.calculateSubnet = function() {
        const ipInput = document.getElementById('calcIpAddress');
        const cidrSelect = document.getElementById('calcCidr');
        const cidrDisplay = document.getElementById('cidrDisplay');

        if (!ipInput || !cidrSelect) return;

        let ipStr = ipInput.value.trim();
        let cidr = parseInt(cidrSelect.value, 10);

        if (cidrDisplay) cidrDisplay.textContent = `/${cidr}`;

        const ipParts = ipStr.split('.').map(p => parseInt(p, 10));
        if (ipParts.length !== 4 || ipParts.some(p => isNaN(p) || p < 0 || p > 255)) {
            return;
        }

        const ipNum = ((ipParts[0] << 24) >>> 0) + ((ipParts[1] << 16) >>> 0) + ((ipParts[2] << 8) >>> 0) + (ipParts[3] >>> 0);
        const maskNum = cidr === 0 ? 0 : (~((1 << (32 - cidr)) - 1)) >>> 0;
        const wildcardNum = (~maskNum) >>> 0;

        const netNum = (ipNum & maskNum) >>> 0;
        const bcastNum = (netNum | wildcardNum) >>> 0;

        function numToIp(num) {
            return [
                (num >>> 24) & 255,
                (num >>> 16) & 255,
                (num >>> 8) & 255,
                num & 255
            ].join('.');
        }

        const netAddr = numToIp(netNum);
        const bcastAddr = numToIp(bcastNum);
        const maskAddr = numToIp(maskNum);
        const wildcardAddr = numToIp(wildcardNum);

        let totalHosts = 0;
        let hostRange = '';

        if (cidr === 31) {
            totalHosts = 2;
            hostRange = `${numToIp(netNum)} — ${numToIp(bcastNum)}`;
        } else if (cidr === 32) {
            totalHosts = 1;
            hostRange = numToIp(netNum);
        } else {
            totalHosts = Math.pow(2, 32 - cidr) - 2;
            const firstHost = numToIp(netNum + 1);
            const lastHost = numToIp(bcastNum - 1);
            hostRange = `${firstHost} — ${lastHost}`;
        }

        const resNet = document.getElementById('resNetAddr');
        const resBcast = document.getElementById('resBcastAddr');
        const resRange = document.getElementById('resHostRange');
        const resHosts = document.getElementById('resTotalHosts');
        const resMask = document.getElementById('resSubnetMask');
        const resWild = document.getElementById('resWildcard');
        const bitSummary = document.getElementById('bitmaskSummary');
        const bitBar = document.getElementById('bitmaskBar');

        if (resNet) resNet.textContent = netAddr;
        if (resBcast) resBcast.textContent = bcastAddr;
        if (resRange) resRange.textContent = hostRange;
        if (resHosts) resHosts.textContent = `${totalHosts.toLocaleString()} Usable Hosts`;
        if (resMask) resMask.textContent = `${maskAddr} (/${cidr})`;
        if (resWild) resWild.textContent = wildcardAddr;
        if (bitSummary) bitSummary.textContent = `${cidr} Net Bits / ${32 - cidr} Host Bits`;

        if (bitBar) {
            let barHtml = '';
            for (let i = 1; i <= 32; i++) {
                const isNet = i <= cidr;
                barHtml += `<div class="bit-box ${isNet ? 'bit-net' : 'bit-host'}" title="Bit ${i}: ${isNet ? 'Network Bit' : 'Host Bit'}"></div>`;
            }
            bitBar.innerHTML = barHtml;
        }
    };

    window.applySubnetPreset = function(ip, cidr) {
        playAudioClick();
        const ipInput = document.getElementById('calcIpAddress');
        const cidrSelect = document.getElementById('calcCidr');
        if (ipInput) ipInput.value = ip;
        if (cidrSelect) cidrSelect.value = cidr;
        calculateSubnet();
    };

    calculateSubnet();

    // ==================== 12. BEFORE & AFTER INTERACTIVE SLIDER ====================
    function initCompareSliders() {
        document.querySelectorAll('.compare-slider-container').forEach(container => {
            const after = container.querySelector('.compare-after');
            const handle = container.querySelector('.compare-handle');
            if (!after || !handle) return;

            let isDragging = false;

            function updatePosition(clientX) {
                const rect = container.getBoundingClientRect();
                let x = clientX - rect.left;
                if (x < 0) x = 0;
                if (x > rect.width) x = rect.width;
                const percent = (x / rect.width) * 100;
                after.style.width = `${percent}%`;
                handle.style.left = `${percent}%`;
            }

            container.addEventListener('mousedown', (e) => {
                isDragging = true;
                updatePosition(e.clientX);
            });

            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                updatePosition(e.clientX);
            });

            window.addEventListener('mouseup', () => {
                if (isDragging) isDragging = false;
            });

            container.addEventListener('touchstart', (e) => {
                isDragging = true;
                if (e.touches.length > 0) updatePosition(e.touches[0].clientX);
            }, { passive: true });

            window.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                if (e.touches.length > 0) updatePosition(e.touches[0].clientX);
            }, { passive: true });

            window.addEventListener('touchend', () => {
                if (isDragging) isDragging = false;
            });
        });
    }
    initCompareSliders();

    // ==================== 13. INTERACTIVE SERVICE & SLA ESTIMATOR ====================
    window.updateEstimator = function() {
        const range = document.getElementById('workstationRange');
        const badge = document.getElementById('workstationCountDisplay');
        const count = range ? parseInt(range.value, 10) : 25;

        if (badge) badge.textContent = `${count} Unit`;

        const chkMikrotik = document.getElementById('chkMikrotik')?.checked;
        const chkMaintenance = document.getElementById('chkMaintenance')?.checked;
        const chkSecurity = document.getElementById('chkSecurity')?.checked;
        const chkBackup = document.getElementById('chkBackup')?.checked;

        document.querySelectorAll('.scope-checkbox-card').forEach(card => {
            const input = card.querySelector('input');
            if (input) card.classList.toggle('active', input.checked);
        });

        const activeCount = [chkMikrotik, chkMaintenance, chkSecurity, chkBackup].filter(Boolean).length;

        let eta = '1 - 2 Hari Kerja';
        if (count > 80 || activeCount >= 4) {
            eta = '3 - 5 Hari Kerja (Staged)';
        } else if (count > 30 || activeCount >= 3) {
            eta = '2 - 3 Hari Kerja';
        }

        let tier = 'Standard Office SLA';
        if (count >= 50 || activeCount >= 3) {
            tier = 'Pro Enterprise SLA (24/7 Priority)';
        }

        const estEta = document.getElementById('estEta');
        const estSla = document.getElementById('estSla');
        const estTier = document.getElementById('estTier');
        const estModules = document.getElementById('estModules');

        if (estEta) estEta.textContent = eta;
        if (estSla) estSla.textContent = '99.9% Uptime Commitment';
        if (estTier) estTier.textContent = tier;
        if (estModules) estModules.textContent = `${activeCount} Layanan Aktif`;
    };

    window.sendEstimatorToWhatsApp = function() {
        playAudioClick();
        const count = document.getElementById('workstationRange')?.value || '25';
        const eta = document.getElementById('estEta')?.textContent || '1 - 2 Hari';
        const tier = document.getElementById('estTier')?.textContent || 'Pro Enterprise';
        
        const services = [];
        if (document.getElementById('chkMikrotik')?.checked) services.push('• Setup MikroTik VLAN & Routing');
        if (document.getElementById('chkMaintenance')?.checked) services.push('• Hardware Overhaul & Maintenance');
        if (document.getElementById('chkSecurity')?.checked) services.push('• Centralized Antivirus & Security');
        if (document.getElementById('chkBackup')?.checked) services.push('• Backup & Disaster Recovery Setup');

        const message = `Halo Muhamad Haris, saya ingin berkonsultasi mengenai kebutuhan IT Support & Jaringan kantor kami:

🏢 *Kapasitas Workstation:* ${count} Unit PC/Server
⏱️ *Estimasi Pengerjaan:* ${eta}
🛡️ *Tingkat Dukungan:* ${tier}
📋 *Cakupan Layanan:*
${services.join('\n')}

Mohon informasi ketersediaan jadwal konsultasi & penawaran kerjasamanya. Terima kasih!`;

        const waUrl = `https://wa.me/6281517318354?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
    };

    // ==================== 14. GLOBAL COMMAND PALETTE (CTRL+K) ====================
    const cmdPaletteOverlay = document.getElementById('cmdPaletteOverlay');
    const cmdPaletteInput = document.getElementById('cmdPaletteInput');
    const cmdPaletteResults = document.getElementById('cmdPaletteResults');
    let selectedCmdIndex = 0;

    const cmdIndexData = [
        { group: 'Navigasi Cepat', title: 'Beranda / Hero', subtitle: 'Lompat ke bagian atas website', icon: 'fas fa-home', action: () => jumpToSection('#hero') },
        { group: 'Navigasi Cepat', title: 'Tentang Saya & Profil', subtitle: 'Biodata, foto profil, dan ringkasan', icon: 'fas fa-user', action: () => jumpToSection('#about') },
        { group: 'Navigasi Cepat', title: 'Keahlian & Tools', subtitle: 'Hardware, MikroTik, Windows, Linux', icon: 'fas fa-tools', action: () => jumpToSection('#skills') },
        { group: 'Navigasi Cepat', title: 'Layanan IT Support', subtitle: 'Solusi perakitan, jaringan, maintenance', icon: 'fas fa-concierge-bell', action: () => jumpToSection('#services') },
        { group: 'Navigasi Cepat', title: 'Studi Kasus Troubleshooting', subtitle: 'Broadcast storm, data recovery, sysprep', icon: 'fas fa-clipboard-check', action: () => jumpToSection('#case-studies') },
        { group: 'Navigasi Cepat', title: 'Interactive IT Lab & Subnet', subtitle: 'Simulasi topologi jaringan & kalkulator IPv4', icon: 'fas fa-network-wired', action: () => jumpToSection('#lab') },
        { group: 'Navigasi Cepat', title: 'Showcase Overhaul Hardware', subtitle: 'Before & After penataan kabel rak server', icon: 'fas fa-sliders-h', action: () => jumpToSection('#showcase') },
        { group: 'Navigasi Cepat', title: 'Kalkulator Estimasi SLA', subtitle: 'Hitung kebutuhan workstation & WhatsApp', icon: 'fas fa-calculator', action: () => jumpToSection('#estimator') },
        { group: 'Navigasi Cepat', title: 'Sertifikasi & Kredensial', subtitle: 'MikroTik MTCNA, CompTIA A+, M365', icon: 'fas fa-award', action: () => jumpToSection('#certifications') },
        { group: 'Navigasi Cepat', title: 'Pengalaman Kerja', subtitle: 'PT Indomarco Prismatama & PT PLN', icon: 'fas fa-briefcase', action: () => jumpToSection('#experience') },
        { group: 'Navigasi Cepat', title: 'Hubungi Kontak', subtitle: 'Formulir pesan & saluran konsultasi', icon: 'fas fa-envelope', action: () => jumpToSection('#contact') },

        { group: 'Aksi Instan', title: 'Pratinjau & Download PDF CV', subtitle: 'Buka modal CV format A4 & cetak PDF', icon: 'fas fa-file-pdf', action: () => { closeCmdPaletteModal(); openCVModal(); } },
        { group: 'Aksi Instan', title: 'Buka Interactive IT Terminal (CLI)', subtitle: 'Buka terminal diagnostik baris perintah', icon: 'fas fa-terminal', action: () => { closeCmdPaletteModal(); openTerminalModal(); } },
        { group: 'Aksi Instan', title: 'Kirim Pesan WhatsApp Langsung', subtitle: 'Buka preset percakapan WhatsApp', icon: 'fab fa-whatsapp', action: () => { closeCmdPaletteModal(); openWaModal(); } },
        { group: 'Aksi Instan', title: 'Toggle Dark / Light Mode', subtitle: 'Ganti tema gelap atau terang', icon: 'fas fa-adjust', action: () => { document.getElementById('themeToggle')?.click(); } },
        { group: 'Aksi Instan', title: 'Ganti Bahasa (ID / EN)', subtitle: 'Switch bahasa website Indonesia / English', icon: 'fas fa-language', action: () => { document.getElementById('langToggle')?.click(); } },
        { group: 'Aksi Instan', title: 'Toggle Audio FX UI', subtitle: 'Aktifkan / bisukan efek suara taktil', icon: 'fas fa-volume-up', action: () => { document.getElementById('soundToggle')?.click(); } }
    ];

    function jumpToSection(selector) {
        closeCmdPaletteModal();
        const el = document.querySelector(selector);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    }

    window.openCmdPaletteModal = function() {
        playAudioClick();
        if (cmdPaletteOverlay) {
            cmdPaletteOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (cmdPaletteInput) {
                cmdPaletteInput.value = '';
                cmdPaletteInput.focus();
            }
            renderCmdResults('');
        }
    };

    window.closeCmdPaletteModal = function() {
        if (cmdPaletteOverlay) {
            cmdPaletteOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    window.closeCmdPaletteOnOverlay = function(e) {
        if (e.target === cmdPaletteOverlay) {
            closeCmdPaletteModal();
        }
    };

    function renderCmdResults(query) {
        if (!cmdPaletteResults) return;
        const q = query.toLowerCase().trim();
        const filtered = cmdIndexData.filter(item => 
            !q || item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q) || item.group.toLowerCase().includes(q)
        );

        if (filtered.length === 0) {
            cmdPaletteResults.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.85rem;"><i class="fas fa-search" style="font-size: 1.5rem; margin-bottom: 8px; display: block;"></i>Tidak ada perintah atau seksi yang cocok.</div>';
            return;
        }

        let html = '';
        let currentGroup = '';
        selectedCmdIndex = 0;

        filtered.forEach((item, idx) => {
            if (item.group !== currentGroup) {
                currentGroup = item.group;
                html += `<div class="cmd-group-title">${currentGroup}</div>`;
            }
            html += `
                <div class="cmd-item ${idx === 0 ? 'selected' : ''}" data-index="${idx}" onclick="executeCmdItem(${idx})">
                    <div class="cmd-item-left">
                        <div class="cmd-item-icon"><i class="${item.icon}"></i></div>
                        <div class="cmd-item-info">
                            <span class="cmd-item-title">${item.title}</span>
                            <span class="cmd-item-subtitle">${item.subtitle}</span>
                        </div>
                    </div>
                    <span class="cmd-item-tag">${item.group.split(' ')[0]}</span>
                </div>
            `;
        });

        cmdPaletteResults.innerHTML = html;
        cmdPaletteResults._filtered = filtered;
    }

    window.executeCmdItem = function(idx) {
        playAudioClick();
        if (cmdPaletteResults && cmdPaletteResults._filtered && cmdPaletteResults._filtered[idx]) {
            cmdPaletteResults._filtered[idx].action();
        }
    };

    if (cmdPaletteInput) {
        cmdPaletteInput.addEventListener('input', (e) => {
            renderCmdResults(e.target.value);
        });

        cmdPaletteInput.addEventListener('keydown', (e) => {
            const items = cmdPaletteResults?.querySelectorAll('.cmd-item');
            if (!items || items.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                items[selectedCmdIndex]?.classList.remove('selected');
                selectedCmdIndex = (selectedCmdIndex + 1) % items.length;
                items[selectedCmdIndex]?.classList.add('selected');
                items[selectedCmdIndex]?.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                items[selectedCmdIndex]?.classList.remove('selected');
                selectedCmdIndex = (selectedCmdIndex - 1 + items.length) % items.length;
                items[selectedCmdIndex]?.classList.add('selected');
                items[selectedCmdIndex]?.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Enter') {
                e.preventDefault();
                executeCmdItem(selectedCmdIndex);
            } else if (e.key === 'Escape') {
                closeCmdPaletteModal();
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (cmdPaletteOverlay && cmdPaletteOverlay.classList.contains('active')) {
                closeCmdPaletteModal();
            } else {
                openCmdPaletteModal();
            }
        }
    });

    const openCmdPaletteBtn = document.getElementById('openCmdPalette');
    if (openCmdPaletteBtn) {
        openCmdPaletteBtn.addEventListener('click', openCmdPaletteModal);
    }

    // Smooth scroll for internal anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // ==================== 15. REACTIVE SPOTLIGHT CURSOR GLOW ====================
    function initSpotlightGlow() {
        const spotlightSelectors = '.service-card, .case-card, .compare-card, .cert-card, .estimator-controls-card, .estimator-summary-card, .topo-node, .calc-input-card, .calc-results-card, .stat-item, .contact-item';
        document.querySelectorAll(spotlightSelectors).forEach(card => {
            card.classList.add('spotlight-card');
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }
    initSpotlightGlow();

    // ==================== 16. LIVE NOC LATENCY TICKER ====================
    function initNocLiveTicker() {
        const pingEl = document.getElementById('heroPingVal');
        if (!pingEl) return;

        const pings = ['8ms', '11ms', '12ms', '14ms', '15ms', '9ms', '13ms'];
        let idx = 0;

        setInterval(() => {
            idx = (idx + 1) % pings.length;
            const newPing = pings[idx];
            pingEl.innerHTML = `<i class="fas fa-bolt"></i> RTT ${newPing}`;
            pingEl.style.transition = 'color 0.3s ease';
            pingEl.style.color = '#38bdf8';
            setTimeout(() => {
                pingEl.style.color = '#00d4ff';
            }, 300);
        }, 4000);
    }
    initNocLiveTicker();

    // ==================== 17. TOAST NOTIFICATION & ONE-CLICK COPY ====================
    let toastTimeout = null;
    window.showToast = function(message, iconClass = 'fas fa-check-circle') {
        const toast = document.getElementById('toastNotification');
        const toastMsg = document.getElementById('toastMsg');
        const toastIcon = document.getElementById('toastIcon');

        if (!toast || !toastMsg) return;

        toastMsg.textContent = message;
        if (toastIcon) toastIcon.className = iconClass;

        toast.classList.add('active');
        if (typeof playAudioSuccess === 'function') playAudioSuccess();

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('active');
        }, 3200);
    };

    window.copyToClipboard = function(text, label = 'Teks') {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            window.showToast(`${label} disalin ke clipboard!`, 'fas fa-check-circle');
        }).catch(() => {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            window.showToast(`${label} disalin ke clipboard!`, 'fas fa-check-circle');
        });
    };

    // ==================== 18. SMART CTRL+P PRINT INTERCEPTOR ====================
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
            e.preventDefault();
            const cvModal = document.getElementById('cvModal');
            if (cvModal && cvModal.classList.contains('active')) {
                printCV();
            } else {
                openCVModal();
                window.showToast('Membuka format CV A4 resmi siap cetak...', 'fas fa-print');
                setTimeout(() => {
                    printCV();
                }, 500);
            }
        }
    });

    // ==================== 19. DIRECT WHATSAPP CONTACT FORM SUBMIT ====================
    window.handleContactFormSubmit = function(e) {
        if (e) e.preventDefault();

        const name = document.getElementById('name')?.value.trim() || '-';
        const email = document.getElementById('email')?.value.trim() || '-';
        const subject = document.getElementById('subject')?.value.trim() || 'Konsultasi IT Support';
        const message = document.getElementById('message')?.value.trim() || '-';

        const waText = 
`Halo Mas Haris, saya ingin berdiskusi terkait kebutuhan IT:

👤 *Nama / Perusahaan:* ${name}
📧 *Email:* ${email}
📌 *Topik / Kebutuhan:* ${subject}
📝 *Pesan / Detail:*
${message}

(Dikirim via formulir kontak portofolio)`;

        const waUrl = `https://wa.me/6281517318354?text=${encodeURIComponent(waText)}`;

        if (typeof showToast === 'function') {
            showToast('Membuka WhatsApp...', 'fab fa-whatsapp');
        }
        if (typeof playAudioSuccess === 'function') {
            playAudioSuccess();
        }

        window.open(waUrl, '_blank', 'noopener,noreferrer');
    };

});
