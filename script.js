(() => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const CONFIG = {
        formspreeEndpoint: '',
        email: 'hamadtariq504@gmail.com',
        linkedin: 'https://www.linkedin.com/in/itsmehamad/',
        github: 'https://github.com/hamadtariq',
        credlyAws: 'https://www.credly.com/badges/f1ab6d9d-f884-4465-81ea-abdf9e8103c1/public_url',
        msLearnMd102: 'https://learn.microsoft.com/en-us/users/HamadTariq-6960/credentials/89B53038678339F2',
    };

    document.documentElement.classList.add('js');

    /* ===== THEME TOGGLE ===== */
    class ThemeToggle {
        constructor() {
            this.btn = document.getElementById('themeToggle');
            this.init();
        }

        init() {
            const saved = localStorage.getItem('theme');
            const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
            const theme = saved || (prefersLight ? 'light' : 'dark');
            this.apply(theme);

            if (this.btn) {
                this.btn.addEventListener('click', () => {
                    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
                    this.apply(next);
                    localStorage.setItem('theme', next);
                });
            }
        }

        apply(theme) {
            document.documentElement.dataset.theme = theme;
            if (window.particlesInstance) {
                window.particlesInstance.setTheme(theme);
            }
        }
    }

    /* ===== SPLIT TEXT ===== */
    class SplitTextAnimator {
        constructor() {
            this.elements = document.querySelectorAll('.split-text');
            this.init();
        }

        init() {
            this.elements.forEach((el) => {
                const words = el.textContent.trim().split(/\s+/);
                el.innerHTML = words.map((word) => `<span class="word">${word}</span>`).join(' ');
            });
        }

        animate(el) {
            if (el.classList.contains('animated')) return;
            el.classList.add('animated');
        }
    }

    /* ===== LENIS SMOOTH SCROLL ===== */
    class SmoothScroll {
        constructor() {
            this.lenis = null;
            this.init();
        }

        init() {
            if (prefersReducedMotion) return;
            if (typeof Lenis === 'undefined') {
                this.fallback();
                return;
            }

            this.lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smoothWheel: true,
                wheelMultiplier: 1,
                touchMultiplier: 1.5,
            });

            const raf = (time) => {
                this.lenis.raf(time);
                requestAnimationFrame(raf);
            };
            requestAnimationFrame(raf);
        }

        fallback() {
            document.documentElement.style.scrollBehavior = 'smooth';
        }

        scrollTo(target) {
            const el = typeof target === 'string' ? document.querySelector(target) : target;
            if (!el) return;
            if (this.lenis) {
                this.lenis.scrollTo(el, { offset: -70, duration: 1.5 });
            } else {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }

        scrollTop() {
            if (this.lenis) {
                this.lenis.scrollTo(0, { duration: 1.5 });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }

    /* ===== CUSTOM CURSOR ===== */
    class Cursor {
        constructor() {
            this.cursor = document.querySelector('.cursor');
            this.ring = document.querySelector('.cursor-ring');
            this.dot = document.querySelector('.cursor-dot');
            this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            this.ringPos = { x: this.pos.x, y: this.pos.y };
            this.dotPos = { x: this.pos.x, y: this.pos.y };
            this.visible = false;
            this.pressed = false;
            this.rafId = null;
            this.init();
        }

        init() {
            if (!hasFinePointer) return;
            if (!this.cursor) return;

            document.body.classList.add('has-cursor');

            window.addEventListener('mousemove', (e) => {
                this.pos.x = e.clientX;
                this.pos.y = e.clientY;
                if (!this.visible) {
                    this.visible = true;
                    this.cursor.style.opacity = '1';
                }
            });

            window.addEventListener('mousedown', () => {
                this.pressed = true;
            });

            window.addEventListener('mouseup', () => {
                this.pressed = false;
            });

            document.addEventListener('mouseleave', () => {
                this.visible = false;
                this.cursor.style.opacity = '0';
            });

            const interactive = 'a, button, input, textarea, select, [data-magnetic], .tilt-card, .cert-card';
            document.addEventListener('mouseover', (e) => {
                if (e.target.closest(interactive)) {
                    this.cursor.classList.add('hovering');
                }
            });

            document.addEventListener('mouseout', (e) => {
                if (e.target.closest(interactive)) {
                    this.cursor.classList.remove('hovering');
                }
            });

            this.animate();
        }

        animate() {
            const lerp = (start, end, amount) => start + (end - start) * amount;
            const scale = this.pressed ? 0.8 : 1;

            this.ringPos.x = lerp(this.ringPos.x, this.pos.x, 0.18);
            this.ringPos.y = lerp(this.ringPos.y, this.pos.y, 0.18);
            this.dotPos.x = lerp(this.dotPos.x, this.pos.x, 0.5);
            this.dotPos.y = lerp(this.dotPos.y, this.pos.y, 0.5);

            this.ring.style.transform = `translate(${this.ringPos.x}px, ${this.ringPos.y}px) translate(-50%, -50%) scale(${scale})`;
            this.dot.style.transform = `translate(${this.dotPos.x}px, ${this.dotPos.y}px) translate(-50%, -50%) scale(${scale})`;

            this.rafId = requestAnimationFrame(() => this.animate());
        }
    }

    /* ===== MAGNETIC BUTTONS ===== */
    class MagneticButtons {
        constructor() {
            this.buttons = document.querySelectorAll('[data-magnetic]');
            this.init();
        }

        init() {
            this.buttons.forEach((btn) => {
                const strength = 0.3;
                let rafId = null;

                const onMove = (e) => {
                    if (!hasFinePointer) return;
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - (rect.left + rect.width / 2);
                    const y = e.clientY - (rect.top + rect.height / 2);

                    cancelAnimationFrame(rafId);
                    rafId = requestAnimationFrame(() => {
                        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
                    });
                };

                const onLeave = () => {
                    cancelAnimationFrame(rafId);
                    rafId = requestAnimationFrame(() => {
                        btn.style.transform = 'translate(0, 0)';
                    });
                };

                btn.addEventListener('mousemove', onMove);
                btn.addEventListener('mouseleave', onLeave);
            });
        }
    }

    /* ===== PARTICLES ===== */
    class Particles {
        constructor() {
            this.canvas = document.getElementById('particles-canvas');
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.mouse = { x: -1000, y: -1000 };
            this.palettes = {
                dark: ['#00ff9d', '#00d4ff', '#a855f7', '#ffffff'],
                light: ['#00b377', '#0088cc', '#8b3df0', '#2a2a3e'],
            };
            this.colors = this.palettes[document.documentElement.dataset.theme || 'dark'];
            this.init();
        }

        setTheme(theme) {
            this.colors = this.palettes[theme] || this.palettes.dark;
            this.particles.forEach((p) => {
                p.color = this.colors[Math.floor(Math.random() * this.colors.length)];
            });
        }

        init() {
            this.resize();
            window.addEventListener('resize', () => this.resize());

            if (hasFinePointer) {
                window.addEventListener('mousemove', (e) => {
                    this.mouse.x = e.clientX;
                    this.mouse.y = e.clientY;
                });
            }

            const count = prefersReducedMotion ? 20 : 60;
            for (let i = 0; i < count; i++) {
                this.particles.push(this.createParticle());
            }

            this.animate();
        }

        resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.canvas.width = window.innerWidth * dpr;
            this.canvas.height = window.innerHeight * dpr;
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        createParticle() {
            return {
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 2 + 0.5,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                alpha: Math.random() * 0.5 + 0.2,
                pulse: Math.random() * Math.PI * 2,
            };
        }

        draw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                p.pulse += 0.02;

                if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
                if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120;
                    p.x += (dx / dist) * force * 2;
                    p.y += (dy / dist) * force * 2;
                }

                const alpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = alpha;
                this.ctx.fill();

                for (let j = i + 1; j < this.particles.length; j++) {
                    const p2 = this.particles[j];
                    const ddx = p.x - p2.x;
                    const ddy = p.y - p2.y;
                    const dist2 = Math.sqrt(ddx * ddx + ddy * ddy);
                    if (dist2 < 100) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(p.x, p.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.strokeStyle = p.color;
                        this.ctx.globalAlpha = (1 - dist2 / 100) * 0.15;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                }
            });

            this.ctx.globalAlpha = 1;
            requestAnimationFrame(() => this.draw());
        }

        animate() {
            if (prefersReducedMotion) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                return;
            }
            this.draw();
        }
    }

    /* ===== NAVBAR ===== */
    class Navbar {
        constructor(scrollManager) {
            this.navbar = document.getElementById('navbar');
            this.toggle = document.getElementById('navToggle');
            this.links = document.getElementById('navLinks');
            this.scrollManager = scrollManager;
            this.init();
        }

        init() {
            if (this.toggle) {
                this.toggle.addEventListener('click', () => {
                    if (this.links.classList.contains('open')) {
                        this.close();
                    } else {
                        this.open();
                    }
                });
            }

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.close();
            });

            const backdrop = document.getElementById('navBackdrop');
            if (backdrop) {
                backdrop.addEventListener('click', () => this.close());
            }

            this.links.querySelectorAll('a').forEach((link) => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = link.getAttribute('href');
                    this.scrollManager.scrollTo(target);
                    this.close();
                });
            });
        }

        open() {
            this.toggle.classList.add('active');
            this.links.classList.add('open');
            document.body.classList.add('menu-open');
        }

        close() {
            if (!this.links.classList.contains('open')) return;
            this.toggle.classList.remove('active');
            this.links.classList.remove('open');
            document.body.classList.remove('menu-open');
        }

        onScroll() {
            const y = window.scrollY;
            if (y > 60) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }

            const sections = document.querySelectorAll('section[id]');
            let current = 'home';
            sections.forEach((section) => {
                if (window.scrollY >= section.offsetTop - 120) {
                    current = section.id;
                }
            });

            this.links.querySelectorAll('a').forEach((link) => {
                link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
            });
        }
    }

    /* ===== TILT CARDS ===== */
    class TiltCards {
        constructor() {
            this.cards = document.querySelectorAll('[data-tilt]');
            this.init();
        }

        init() {
            this.cards.forEach((card) => {
                const onMove = (e) => {
                    if (!hasFinePointer) return;
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    const rotateY = ((x - centerX) / centerX) * 8;
                    const rotateX = -((y - centerY) / centerY) * 8;

                    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;

                    const glow = card.querySelector('.cert-glow, .project-glow');
                    if (glow) {
                        glow.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(0, 255, 157, 0.15), transparent 60%)`;
                    }
                };

                const onLeave = () => {
                    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
                    const glow = card.querySelector('.cert-glow, .project-glow');
                    if (glow) {
                        glow.style.background = '';
                    }
                };

                card.addEventListener('mousemove', onMove);
                card.addEventListener('mouseleave', onLeave);
            });
        }
    }

    /* ===== COUNTERS ===== */
    class Counters {
        constructor() {
            this.counters = document.querySelectorAll('.counter');
            this.init();
        }

        init() {
            if (typeof IntersectionObserver === 'undefined') {
                this.counters.forEach((c) => this.runCounter(c));
                return;
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        this.runCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.4 });

            this.counters.forEach((c) => observer.observe(c));
        }

        runCounter(el) {
            const target = parseInt(el.dataset.target, 10);
            const duration = 1800;
            const start = performance.now();
            const isPercent = el.textContent.includes('%');

            const tick = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const value = Math.round(target * eased);
                el.textContent = isPercent ? `${value}%` : value;
                if (progress < 1) {
                    requestAnimationFrame(tick);
                }
            };

            requestAnimationFrame(tick);
        }
    }

    /* ===== SKILL BARS ===== */
    class SkillBars {
        constructor() {
            this.fills = document.querySelectorAll('.skill-fill');
            this.init();
        }

        init() {
            if (typeof IntersectionObserver === 'undefined') {
                this.fills.forEach((f) => f.style.width = f.style.getPropertyValue('--level') || f.parentElement.parentElement.dataset.level + '%');
                return;
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const level = entry.target.style.getPropertyValue('--level');
                        entry.target.style.width = level;
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });

            this.fills.forEach((f) => {
                f.style.width = '0';
                observer.observe(f);
            });
        }
    }

    /* ===== CERT PROGRESS BARS ===== */
    class CertProgress {
        constructor() {
            this.bars = document.querySelectorAll('.cert-item .progress-fill');
            this.init();
        }

        init() {
            if (typeof IntersectionObserver === 'undefined') {
                this.bars.forEach((b) => b.style.width = b.style.getPropertyValue('--progress'));
                return;
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const progress = entry.target.style.getPropertyValue('--progress');
                        entry.target.style.width = progress;
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });

            this.bars.forEach((b) => {
                b.style.width = '0';
                observer.observe(b);
            });
        }
    }

    /* ===== SCROLL REVEAL ===== */
    class ScrollReveal {
        constructor() {
            this.elements = document.querySelectorAll('[data-reveal]');
            this.init();
        }

        init() {
            const addClasses = (el) => {
                el.classList.add('revealed');
                if (el.classList.contains('split-text') && window.splitTextAnimator) {
                    window.splitTextAnimator.animate(el);
                }
            };

            if (typeof IntersectionObserver === 'undefined') {
                this.elements.forEach(addClasses);
                return;
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            addClasses(entry.target);
                        }, entry.target.dataset.revealDelay || 0);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

            this.elements.forEach((el) => observer.observe(el));
        }
    }

    /* ===== PARALLAX ===== */
    class Parallax {
        constructor() {
            this.elements = document.querySelectorAll('[data-parallax]');
            this.init();
        }

        init() {
            if (prefersReducedMotion) return;

            window.addEventListener('scroll', () => {
                this.elements.forEach((el) => {
                    const speed = parseFloat(el.dataset.parallax || 0.2);
                    const section = el.closest('section') || document.body;
                    const rect = section.getBoundingClientRect();
                    const center = window.innerHeight / 2;
                    const offset = (rect.top + rect.height / 2 - center) * speed * 0.1;
                    el.style.transform = `translateY(${offset}px)`;
                });
            }, { passive: true });
        }
    }

    /* ===== CONTACT FORM ===== */
    class ContactForm {
        constructor() {
            this.form = document.getElementById('contactForm');
            this.status = document.getElementById('formStatus');
            this.init();
        }

        init() {
            if (!this.form) return;

            this.form.querySelectorAll('input, textarea').forEach((field) => {
                field.addEventListener('focus', () => {
                    field.parentElement.classList.add('focused');
                });
                field.addEventListener('blur', () => {
                    field.parentElement.classList.remove('focused');
                    if (field.value.trim()) {
                        field.parentElement.classList.add('filled');
                    } else {
                        field.parentElement.classList.remove('filled');
                    }
                });
            });

            this.form.addEventListener('submit', (e) => {
                e.preventDefault();

                const btn = this.form.querySelector('button[type="submit"]');
                const original = btn.innerHTML;
                const name = document.getElementById('name').value.trim();
                const email = document.getElementById('email').value.trim();
                const subject = document.getElementById('subject').value.trim();
                const message = document.getElementById('message').value.trim();

                btn.innerHTML = '<span class="btn-text">Sending...</span>';
                btn.disabled = true;

                if (CONFIG.formspreeEndpoint) {
                    this.sendToFormspree({ name, email, subject, message, btn, original });
                } else {
                    this.sendViaMailto({ name, email, subject, message, btn, original });
                }
            });
        }

        sendToFormspree({ name, email, subject, message, btn, original }) {
            fetch(CONFIG.formspreeEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ name, email, subject, message, _subject: `Portfolio: ${subject}` }),
            }).then((res) => {
                if (!res.ok) throw new Error('Formspree error');
                btn.innerHTML = '<span class="btn-text">Message Sent ✓</span>';
                this.status.textContent = '> message delivered. I\'ll get back to you within 24h.';
                this.status.classList.add('visible');
                this.form.reset();
                this.form.querySelectorAll('.filled').forEach((el) => el.classList.remove('filled'));
            }).catch(() => {
                btn.innerHTML = '<span class="btn-text">Send via Mail →</span>';
                this.status.textContent = '> sending failed. opening your email client instead...';
                this.status.classList.add('visible');
                this.sendViaMailto({ name, email, subject, message, btn, original, quiet: true });
            }).finally(() => {
                setTimeout(() => {
                    btn.innerHTML = original;
                    btn.disabled = false;
                    this.status.classList.remove('visible');
                }, 4000);
            });
        }

        sendViaMailto({ name, email, subject, message, btn, original, quiet }) {
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
            const mailto = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${body}`;

            if (!quiet) {
                btn.innerHTML = '<span class="btn-text">Opening Mail Client...</span>';
            }

            setTimeout(() => {
                window.location.href = mailto;
                if (!quiet) {
                    btn.innerHTML = '<span class="btn-text">Message Prepared ✓</span>';
                    this.status.textContent = '> your email client has been opened. press send to deliver the message.';
                    this.status.classList.add('visible');
                    setTimeout(() => {
                        btn.innerHTML = original;
                        btn.disabled = false;
                        this.status.classList.remove('visible');
                    }, 4000);
                }
            }, quiet ? 0 : 800);
        }
    }

    /* ===== TERMINAL COMMANDS ===== */
    class TerminalCommands {
        constructor(scrollManager) {
            this.input = document.getElementById('terminalInput');
            this.scrollManager = scrollManager;
            if (!this.input) return;
            this.outputContainer = this.input.closest('.terminal-body');
            this.commands = {
                help: 'Available commands:\n  whoami     - about me\n  skills     - tech stack\n  experience - work history\n  certs      - certifications\n  verify <c> - open a credential (aws|ms)\n  projects   - featured work\n  contact    - reach me\n  blog       - my writeups\n  cd <s>     - jump to a section\n  ls         - list sections\n  theme      - toggle theme\n  date       - current date\n  github     - open my GitHub\n  linkedin   - open my LinkedIn\n  email      - email me\n  clear      - clear terminal\n  exit       - close session',
                whoami: 'Hamad Tariq\nIT Administrator & DevOps Engineer\n5+ years keeping infrastructure running & shipping automation',
                experience: 'Nov 2023 - Present   IT Administrator & DevOps Engineer\nFeb 2021 - Jun 2023  IT Support Specialist\n\nTry: cd experience',
                skills: 'Cloud:      AWS, Azure, GCP\nContainers:  Docker, Kubernetes\nIaC:         Terraform, Ansible, CloudFormation, Bicep\nCI/CD:       GitHub Actions, Azure DevOps, ArgoCD\nScripting:   Bash, PowerShell, Python\nNetworking:  Routing, Switching, VLANs (CCNA track)\nObserv:      Prometheus, Grafana, ELK',
                certs: 'EARNED\n  [x] AWS Certified Solutions Architect - Associate\n      issued 09 Aug 2026 | valid to Aug 2029 | verify aws\n  [x] Microsoft 365 Certified: Endpoint Administrator Associate (MD-102)\n      issued 18 Aug 2026 | renew by Aug 2027 | verify ms\n\nSCHEDULED (Sep 2026)\n  [ ] Azure Administrator AZ-104\n  [ ] CCNA 200-301\n  [ ] Azure DevOps Engineer AZ-400\n\nTry: cd certs / verify aws / verify ms',
                projects: '1. Multi-Cloud IaC Framework\n2. K8s Cluster Bootstrap\n3. Network Automation Suite\n4. Pipeline Template Library\n5. Observability Stack\n6. Compliance Automation\n\nTry: cd projects',
                contact: `email:    ${CONFIG.email}\nlinkedin: ${CONFIG.linkedin}\ngithub:   ${CONFIG.github}\n\nTry: email / linkedin / github`,
                blog: 'My writeups live in the blog section below. More coming soon.',
                ls: 'home  about  experience  certifications  skills  projects  blog  contact',
                sudo: 'nice try. you are already root.',
                clear: '__CLEAR__',
                exit: 'this is my portfolio. you cannot leave. but you can contact me!',
            };
            this.init();
        }

        init() {
            this.input.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter') return;
                const raw = this.input.value.trim();
                this.input.value = '';
                if (!raw) return;

                this.printPrompt(raw);
                this.execute(raw);
            });
        }

        printPrompt(cmd) {
            const line = document.createElement('div');
            line.className = 'terminal-line';
            line.innerHTML = `<span class="prompt">$</span><span class="command"> ${this.escapeHtml(cmd)}</span>`;
            this.outputContainer.insertBefore(line, this.input.closest('.terminal-line'));
        }

        printOutput(text) {
            if (text === '__CLEAR__') {
                this.outputContainer.querySelectorAll('.terminal-echo, .terminal-line:not(.terminal-input-line)').forEach((el) => el.remove());
                return;
            }
            const out = document.createElement('div');
            out.className = 'terminal-echo';
            out.textContent = text;
            this.outputContainer.insertBefore(out, this.input.closest('.terminal-line'));
        }

        execute(raw) {
            const args = raw.split(/\s+/);
            const cmd = args[0].toLowerCase();
            const sections = { home: '#home', about: '#about', experience: '#experience', certs: '#certifications', certifications: '#certifications', skills: '#skills', projects: '#projects', blog: '#blog', contact: '#contact' };

            if (cmd === 'clear') {
                this.printOutput('__CLEAR__');
                return;
            }

            if (cmd === 'cd') {
                const target = sections[args[1] && args[1].toLowerCase()];
                if (target) {
                    this.printOutput(`navigating to ${target.slice(1)}...`);
                    this.scrollManager.scrollTo(target);
                } else {
                    this.printOutput('usage: cd <home|about|experience|certs|skills|projects|blog|contact>');
                }
                return;
            }

            if (cmd === 'theme') {
                document.getElementById('themeToggle').click();
                this.printOutput(`theme switched to ${document.documentElement.dataset.theme}`);
                return;
            }

            if (cmd === 'verify') {
                const creds = {
                    aws: { url: CONFIG.credlyAws, label: 'AWS Solutions Architect Associate on Credly' },
                    ms: { url: CONFIG.msLearnMd102, label: 'M365 Endpoint Administrator (MD-102) on Microsoft Learn' },
                };
                const cred = creds[(args[1] || '').toLowerCase()];
                if (cred) {
                    window.open(cred.url, '_blank', 'noopener');
                    this.printOutput(`opening ${cred.label}...`);
                } else {
                    this.printOutput('usage: verify <aws|ms>');
                }
                return;
            }

            if (cmd === 'github' || cmd === 'linkedin') {
                window.open(CONFIG[cmd], '_blank');
                this.printOutput(`opening ${cmd} in a new tab...`);
                return;
            }

            if (cmd === 'email') {
                window.location.href = `mailto:${CONFIG.email}`;
                this.printOutput(`opening mail client for ${CONFIG.email}...`);
                return;
            }

            if (this.commands[cmd]) {
                this.printOutput(this.commands[cmd]);
            } else if (cmd) {
                this.printOutput(`command not found: ${cmd}\nType 'help' to see available commands`);
            }

            const target = sections[cmd];
            if (target) {
                this.scrollManager.scrollTo(target);
            }
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }

    /* ===== TYPEWRITER EFFECT (terminal commands) ===== */
    class Typewriter {
        constructor() {
            this.lines = document.querySelectorAll('.terminal-line .command');
            this.init();
        }

        init() {
            if (prefersReducedMotion) return;
            if (!this.lines.length) return;

            let delay = 400;

            this.lines.forEach((line, i) => {
                const text = line.textContent;
                line.textContent = '';
                setTimeout(() => this.typeLine(line, text, 0), delay);
                delay += 600 + text.length * 30;
            });
        }

        typeLine(el, text, i) {
            if (i < text.length) {
                el.textContent = text.slice(0, i + 1);
                setTimeout(() => this.typeLine(el, text, i + 1), 30);
            }
        }
    }

    /* ===== SCROLL PROGRESS BAR ===== */
    class ScrollProgress {
        constructor() {
            this.bar = document.getElementById('scrollProgress');
            if (!this.bar) return;
            this.update();
            window.addEventListener('scroll', () => this.update(), { passive: true });
        }

        update() {
            const doc = document.documentElement;
            const max = doc.scrollHeight - doc.clientHeight;
            const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
            this.bar.style.width = pct + '%';
        }
    }

    /* ===== BACK TO TOP ===== */
    class BackToTop {
        constructor(scrollManager) {
            this.btn = document.getElementById('backToTop');
            if (!this.btn) return;
            this.btn.addEventListener('click', () => scrollManager.scrollTop());
            window.addEventListener('scroll', () => {
                this.btn.classList.toggle('visible', window.scrollY > 600);
            }, { passive: true });
        }
    }

    /* ===== COPY EMAIL ===== */
    class CopyEmail {
        constructor() {
            this.btn = document.getElementById('copyEmail');
            if (!this.btn) return;
            this.email = CONFIG.email;
            this.btn.addEventListener('click', () => this.copy());
        }

        copy() {
            const done = () => {
                const original = this.btn.innerHTML;
                this.btn.innerHTML = '✓';
                this.btn.classList.add('copied');
                setTimeout(() => {
                    this.btn.innerHTML = original;
                    this.btn.classList.remove('copied');
                }, 1600);
            };

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(this.email).then(done).catch(() => this.fallback(done));
            } else {
                this.fallback(done);
            }
        }

        fallback(done) {
            const ta = document.createElement('textarea');
            ta.value = this.email;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                done();
            } catch (e) { /* clipboard unavailable */ }
            document.body.removeChild(ta);
        }
    }

    /* ===== GITHUB REPOS ===== */
    class GitHubRepos {
        constructor() {
            this.container = document.getElementById('githubRepos');
            this.section = document.getElementById('githubSection');
            if (!this.container) return;
            this.fetch();
        }

        fetch() {
            fetch('https://api.github.com/users/hamadtariq/repos?sort=updated&per_page=6')
                .then((res) => {
                    if (!res.ok) throw new Error('GitHub API error');
                    return res.json();
                })
                .then((repos) => this.render(repos))
                .catch(() => {
                    if (this.section) this.section.hidden = true;
                });
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        render(repos) {
            if (!Array.isArray(repos) || !repos.length) {
                this.section.hidden = true;
                return;
            }
            const filtered = repos.filter((r) => !r.fork).slice(0, 6);
            if (!filtered.length) {
                this.section.hidden = true;
                return;
            }

            this.container.innerHTML = filtered.map((repo, i) => `
                <a href="${repo.html_url}" target="_blank" rel="noopener" class="repo-card glass" style="animation-delay: ${i * 80}ms">
                    <div class="repo-name">${this.escapeHtml(repo.name)}</div>
                    <p class="repo-desc">${this.escapeHtml(repo.description || 'No description provided.')}</p>
                    <div class="repo-footer">
                        ${repo.language ? `<span class="repo-language"><span class="lang-dot"></span>${this.escapeHtml(repo.language)}</span>` : ''}
                        <span class="repo-stars">★ ${repo.stargazers_count}</span>
                    </div>
                </a>
            `).join('');
            this.section.hidden = false;
        }
    }

    /* ===== INIT ===== */
    const init = () => {
        window.splitTextAnimator = new SplitTextAnimator();
        const scrollManager = new SmoothScroll();
        new ThemeToggle();
        new Cursor();
        new MagneticButtons();
        window.particlesInstance = new Particles();
        window.navbarInstance = new Navbar(scrollManager);
        new TiltCards();
        new Counters();
        new SkillBars();
        new CertProgress();
        new ScrollReveal();
        new Parallax();
        new ContactForm();
        new Typewriter();
        new TerminalCommands(scrollManager);
        new ScrollProgress();
        new BackToTop(scrollManager);
        new CopyEmail();
        new GitHubRepos();

        window.addEventListener('scroll', () => {
            document.querySelectorAll('.navbar').forEach((n) => {
                if (n.id === 'navbar') window.navbarInstance && window.navbarInstance.onScroll();
            });
        }, { passive: true });

        window.addEventListener('resize', () => {
            window.navbarInstance && window.navbarInstance.onScroll();
        });

        document.querySelectorAll('[data-scroll-to]').forEach((btn) => {
            btn.addEventListener('click', () => {
                scrollManager.scrollTo(btn.dataset.scrollTo);
            });
        });

        setTimeout(() => {
            const heroName = document.getElementById('heroName');
            const heroRole = document.getElementById('heroRole');
            if (heroName) window.splitTextAnimator.animate(heroName);
            if (heroRole) setTimeout(() => window.splitTextAnimator.animate(heroRole), 300);
        }, 1200);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
