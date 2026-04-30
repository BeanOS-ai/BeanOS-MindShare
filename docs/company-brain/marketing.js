/**
 * marketing.js — scroll story + ambient particles for BeanOS marketing.
 *
 * 1. Particle background (matches the landing).
 * 2. Scroll progress bar.
 * 3. Story sections fade in as they enter the viewport.
 * 4. Active chapter highlight as the user scrolls past.
 * 5. Smooth-scroll for in-page anchor links.
 *
 * Vanilla — no frameworks, no build step.
 */
(() => {
    "use strict";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------------- 1. Particle background ---------------- */
    if (!reduceMotion) {
        const canvas = document.getElementById("particles-canvas");
        if (canvas) {
            const ctx = canvas.getContext("2d");
            let particles = [];
            let raf;

            const resize = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            };

            class Particle {
                constructor() { this.init(); }
                init() {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.vx = (Math.random() - 0.5) * 0.45;
                    this.vy = (Math.random() - 0.5) * 0.45;
                    this.r = Math.random() * 1.5 + 0.5;
                    this.alpha = Math.random() * 0.4 + 0.1;
                    this.hue = Math.random() < 0.15 ? "30,64,175" : "160,190,255";
                }
                update() {
                    this.x += this.vx;
                    this.y += this.vy;
                    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
                }
                draw() {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${this.hue},${this.alpha})`;
                    ctx.fill();
                }
            }

            const init = () => {
                resize();
                const count = Math.max(60, Math.min(140, Math.floor((canvas.width * canvas.height) / 8000)));
                particles = Array.from({ length: count }, () => new Particle());
            };

            const connect = () => {
                const maxD = 110;
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const d = Math.hypot(dx, dy);
                        if (d < maxD) {
                            ctx.beginPath();
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.strokeStyle = `rgba(160,190,255,${(1 - d / maxD) * 0.12})`;
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                        }
                    }
                }
            };

            const loop = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for (const p of particles) {
                    p.update();
                    p.draw();
                }
                connect();
                raf = requestAnimationFrame(loop);
            };

            window.addEventListener("resize", () => {
                cancelAnimationFrame(raf);
                init();
                loop();
            });
            init();
            loop();
        }
    }

    /* ---------------- 2. Scroll progress bar ---------------- */
    const progress = document.getElementById("scrollProgress");
    if (progress && !reduceMotion) {
        let ticking = false;
        const update = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
            progress.style.width = pct.toFixed(2) + "%";
            ticking = false;
        };
        window.addEventListener(
            "scroll",
            () => {
                if (!ticking) {
                    window.requestAnimationFrame(update);
                    ticking = true;
                }
            },
            { passive: true },
        );
        update();
    }

    /* ---------------- 3. Story section reveal ---------------- */
    const stories = document.querySelectorAll("section.story");

    if (reduceMotion) {
        stories.forEach((s) => s.classList.add("in-view"));
    } else if ("IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in-view");
                        sectionObserver.unobserve(entry.target);
                    }
                }
            },
            {
                rootMargin: "0px 0px -18% 0px",
                threshold: 0.16,
            },
        );
        stories.forEach((s) => sectionObserver.observe(s));
    } else {
        stories.forEach((s) => s.classList.add("in-view"));
    }

    /* ---------------- 4. Active chapter highlight ---------------- */
    const chapterSets = Array.from(document.querySelectorAll(".story-chapters"));
    if (chapterSets.length > 0 && !reduceMotion && "IntersectionObserver" in window) {
        const chapterObserver = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    const all = entry.target.parentElement?.querySelectorAll(".chapter") ?? [];
                    all.forEach((c) => c.classList.remove("active"));
                    entry.target.classList.add("active");
                }
            },
            {
                rootMargin: "-40% 0px -50% 0px",
                threshold: 0,
            },
        );
        chapterSets.forEach((set) => {
            set.querySelectorAll(".chapter").forEach((ch) => chapterObserver.observe(ch));
        });
    }

    /* ---------------- 5. Smooth-scroll for in-page anchors ---------------- */
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (ev) => {
            const id = link.getAttribute("href");
            if (!id || id === "#") return;
            const target = document.querySelector(id);
            if (!target) return;
            ev.preventDefault();
            target.scrollIntoView({
                behavior: reduceMotion ? "auto" : "smooth",
                block: "start",
            });
        });
    });

    /* ---------------- 6. Diagram lightbox ---------------- */
    const lightbox = document.getElementById("lightbox");
    const stage = document.getElementById("lightboxStage");
    const closeBtn = lightbox?.querySelector(".lightbox-close");

    const openLightbox = (sourceCard) => {
        if (!lightbox || !stage) return;
        const body = sourceCard.querySelector(".figure-card-body");
        if (!body) return;
        // Clone the diagram body so animations re-fire in the lightbox copy.
        stage.innerHTML = "";
        stage.appendChild(body.cloneNode(true));
        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("lightbox-open");
    };
    const closeLightbox = () => {
        if (!lightbox) return;
        lightbox.classList.remove("open");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.classList.remove("lightbox-open");
        if (stage) stage.innerHTML = "";
    };

    document.querySelectorAll(".diagram-card").forEach((card) => {
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.addEventListener("click", () => openLightbox(card));
        card.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                openLightbox(card);
            }
        });
    });
    closeBtn?.addEventListener("click", closeLightbox);
    lightbox?.addEventListener("click", (ev) => {
        if (ev.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape" && lightbox?.classList.contains("open")) closeLightbox();
    });
})();
