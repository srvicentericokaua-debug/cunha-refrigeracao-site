// =========================================================
// CUNHA REFRIGERAÇÃO — app.js
// =========================================================

// ---------- Intro loader ----------
// Plays every time the page loads or refreshes (no "seen once" skip logic,
// per how it was asked for). Runs first, immediately, so the 2s covers
// the actual page setup happening underneath rather than starting late.
(function initSiteLoader() {
  const loader = document.getElementById("siteLoader");
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add("is-hidden");
    document.body.classList.remove("loader-active");
    setTimeout(() => loader.remove(), 700);
  }, 2000);
})();

const CONTACT = {
  whatsapp: "5515997369471",
  phoneDisplay: "(15) 99736-9471",
  email: "refrigeracaocunha30@gmail.com",
  whatsappMessage: "Olá! Vim pelo site e gostaria de solicitar um orçamento."
};

// Avaliações reais extraídas do Google (perfil "Cunha Refrigeração", Sorocaba).
// Todas 5 estrelas. Para atualizar, edite este array — o carrossel é gerado
// automaticamente a partir dele.
const REVIEWS = [
  { name: "Aline Sales", stars: 5, time: "Há 2 semanas",
    text: "Ótimo atendimento, e ainda no feriado. Excelente trabalho. Fiquei muito satisfeita." },
  { name: "Danilo Natália", stars: 5, time: "Há 2 semanas",
    text: "Excelente técnico, ótimo profissional e um preço excelente, super recomendo." },
  { name: "Malu Scianni", stars: 5, time: "Há 2 semanas",
    text: "Ótimo atendimento, profissional extremamente atencioso. Recomendo muito!" },
  { name: "Emilyn Gomes da Silva", stars: 5, time: "Há 2 semanas",
    text: "Ótimo atendimento, atencioso e comprometido em resolver o problema." },
  { name: "Diógenes Caldeira", stars: 5, time: "Há 6 semanas",
    text: "Sem tempo ruim! Desenrolado e serviço impecável." },
  { name: "Lilian Prado", stars: 5, time: "Há 10 semanas",
    text: "Atendimento rápido e excelente! Vieram no mesmo dia em que entrei em contato. Foram muito honestos e transparentes." },
  { name: "Juliana Oliveira", stars: 5, time: "Há 18 semanas",
    text: "Recentemente tive um problema com a minha geladeira, trocaram o motor e está funcionando muito bem! Agilidade no atendimento e preço acessível." },
  { name: "André Pereira", stars: 5, time: "Há 22 semanas",
    text: "Ótimo profissional, atendimento nota 10." }
];

(function setContactLinks() {
  const waLink = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(CONTACT.whatsappMessage)}`;

  document.querySelectorAll("#ctaHeroWhats, #ctaFinalWhats, #ctaMapWhats, #whatsappFloat, #footerWhats")
    .forEach(el => { el.setAttribute("href", waLink); });

  const footerWhats = document.getElementById("footerWhats");
  if (footerWhats) footerWhats.textContent = `WhatsApp: ${CONTACT.phoneDisplay}`;

  const phoneDisplay = document.getElementById("contactPhoneDisplay");
  if (phoneDisplay) phoneDisplay.textContent = CONTACT.phoneDisplay;

  const emailDisplay = document.getElementById("contactEmailDisplay");
  if (emailDisplay) emailDisplay.textContent = CONTACT.email;

  document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
    el.setAttribute("href", `mailto:${CONTACT.email}`);
  });

  const contactCta = document.querySelector('.header-actions .btn-primary');
  if (contactCta) contactCta.setAttribute("href", "#contato");

  const googleReviewsLink = document.getElementById("googleReviewsLink");
  if (googleReviewsLink) {
    googleReviewsLink.setAttribute("href", "https://www.google.com/search?q=Cunha+Refrigera%C3%A7%C3%A3o+Sorocaba");
  }
})();

// ---------- Testimonials carousel (built from REVIEWS) ----------
function renderTestimonials() {
  const track = document.getElementById("testimonialsTrack");
  if (!track) return;

  const cardHTML = (r) => `
    <div class="testimonial-card">
      <div class="testimonial-top">
        <span class="rating-stars">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</span>
        <span class="google-mark"><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></span>
      </div>
      <p>"${r.text}"</p>
      <div class="testimonial-author">
        <span class="author-name">${r.name}</span>
        <span class="author-loc">${r.time} · Google</span>
      </div>
    </div>`;

  // Duplicated once for a seamless infinite loop (see .testimonials-track animation).
  track.innerHTML = REVIEWS.map(cardHTML).join("") + REVIEWS.map(cardHTML).join("");

  // Drag-to-pause: pointer users can grab the strip; it just pauses the
  // auto-scroll rather than implementing full manual scrolling.
  let isDown = false;
  track.addEventListener("pointerdown", () => {
    isDown = true;
    track.classList.add("is-dragging");
  });
  window.addEventListener("pointerup", () => {
    if (isDown) { isDown = false; track.classList.remove("is-dragging"); }
  });
}
renderTestimonials();

// ---------- Lenis smooth scroll + GSAP ScrollTrigger ----------
const hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
let lenis;

if (hasGSAP) {
  gsap.registerPlugin(ScrollTrigger);

  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  document.body.classList.add("js-ready");
}

// ---------- Scroll-triggered reveal system ----------
// Reads the anim-* class already applied in HTML/CSS and animates each
// element (or each group of siblings inside [data-stagger]) into place
// with GSAP once it scrolls into view. Falls back to a plain
// IntersectionObserver + CSS transition if GSAP failed to load (e.g. CDN
// blocked), so content never stays permanently hidden.
function initReveals() {
  const neutral = { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, duration: 0.9, ease: "power3.out" };

  function animateTargets(targets, stagger) {
    const vars = { ...neutral };
    if (stagger) vars.stagger = stagger;
    targets.forEach(el => {
      if (el.classList.contains("anim-clip-reveal")) {
        gsap.set(el, { clipPath: "inset(0 0 100% 0)" });
      }
    });
    const hasClip = targets.some(el => el.classList.contains("anim-clip-reveal"));
    if (hasClip) vars.clipPath = "inset(0% 0 0% 0)";
    gsap.to(targets, vars);
  }

  document.querySelectorAll("[data-stagger]").forEach(container => {
    const items = Array.from(container.querySelectorAll(":scope > .reveal"));
    if (!items.length) return;
    ScrollTrigger.create({
      trigger: container,
      start: "top 85%",
      once: true,
      onEnter: () => animateTargets(items, 0.12)
    });
  });

  const grouped = new Set();
  document.querySelectorAll("[data-stagger] > .reveal").forEach(el => grouped.add(el));

  document.querySelectorAll(".reveal").forEach(el => {
    if (grouped.has(el)) return;
    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => animateTargets([el], 0)
    });
  });
}

function initRevealsFallback() {
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

  revealEls.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 90}ms`;
    revealObserver.observe(el);
  });
}

if (hasGSAP) {
  initReveals();
} else {
  initRevealsFallback();
}

// ---------- Animated counters ----------
// Any stat number tagged with data-counter counts up from zero the first
// time it scrolls into view. data-decimals keeps fractional values (e.g.
// the 5.0 rating) formatted with a fixed number of decimal places instead
// of rounding to an integer.
function initCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  counters.forEach(el => {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || "";
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const proxy = { val: 0 };

    const format = (v) => (decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString());

    const run = () => gsap.to(proxy, {
      val: target,
      duration: 1.6,
      ease: "power1.out",
      snap: decimals > 0 ? { val: 1 / Math.pow(10, decimals) } : { val: 1 },
      onUpdate: () => { el.textContent = format(proxy.val) + suffix; }
    });

    if (hasGSAP) {
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: run
      });
    } else {
      el.textContent = format(target) + suffix;
    }
  });
}
initCounters();

// ---------- Hero glow parallax ----------
if (hasGSAP) {
  gsap.to(".hero .hero-glow-a", {
    y: 80,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
  gsap.to(".hero .hero-glow-b", {
    y: -60,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
}

// ---------- Serviços: scroll-driven frame sequence ----------
// 118 WebP frames extracted from the source video with ffmpeg
// (public/frames/frame-0001.webp … frame-0118.webp, 1600px wide). Frames
// are decoded images, not a video seek, so scrubbing is glass-smooth even
// while the user scrolls fast. Content blocks (data-enter/data-leave/
// data-animation/data-persist on .vs-block) share the same progress value
// so text reveals stay in sync with the frame under it.
function initServicesFrameSequence() {
  const runway = document.getElementById("vsRunway");
  const canvas = document.getElementById("servicosCanvas");
  if (!runway || !canvas) return;

  const FRAME_COUNT = 118;
  const PRELOAD_COUNT = 16;
  const framePath = (n) => `public/frames/frame-${String(n).padStart(4, "0")}.webp`;

  const ctx = canvas.getContext("2d");
  const frames = new Array(FRAME_COUNT);
  let currentFrame = -1;

  function loadFrame(i) {
    if (frames[i]) return frames[i];
    const img = new Image();
    img.decoding = "async";
    img.src = framePath(i + 1);
    frames[i] = img;
    return img;
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    if (currentFrame >= 0) drawFrame(currentFrame);
  }

  function drawFrame(index) {
    const img = frames[index];
    if (!img || !img.complete || !img.naturalWidth) return;
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale, dh = ih * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  function setFrame(progress) {
    const index = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(progress * (FRAME_COUNT - 1))));
    if (index === currentFrame) return;
    currentFrame = index;
    loadFrame(index);
    requestAnimationFrame(() => drawFrame(index));
  }

  // Two-phase load: first frames eagerly (fast first paint), the rest in
  // idle time in the background so the page never feels blocked.
  const preloadTargets = [];
  for (let i = 0; i < Math.min(PRELOAD_COUNT, FRAME_COUNT); i++) preloadTargets.push(loadFrame(i));

  Promise.all(preloadTargets.map(img => new Promise(resolve => {
    if (img.complete) resolve(); else { img.onload = resolve; img.onerror = resolve; }
  }))).then(() => {
    resizeCanvas();
    setFrame(0);
    drawFrame(0);

    let i = PRELOAD_COUNT;
    const loadNext = () => {
      if (i >= FRAME_COUNT) return;
      loadFrame(i);
      i++;
      if ("requestIdleCallback" in window) requestIdleCallback(loadNext, { timeout: 300 });
      else setTimeout(loadNext, 25);
    };
    loadNext();
  });

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const updateBlocks = initVideoScrollBlocks();
  const updateProgressDots = initVideoScrollDots();

  if (hasGSAP) {
    ScrollTrigger.create({
      trigger: runway,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.25,
      onUpdate: (self) => {
        setFrame(self.progress);
        updateBlocks(self.progress);
        updateProgressDots(self.progress);
      }
    });
  } else {
    window.addEventListener("scroll", () => {
      const rect = runway.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      setFrame(progress);
      updateBlocks(progress);
      updateProgressDots(progress);
    }, { passive: true });
  }
}

// Reveals/hides each .vs-block as scroll progress enters/leaves its
// data-enter/data-leave window. data-persist="true" blocks (the closing
// CTA) never hide again once shown. Each block gets its own entrance type
// per data-animation, mirroring the site-wide anim-* vocabulary.
function initVideoScrollBlocks() {
  const blocks = Array.from(document.querySelectorAll(".vs-block")).map(block => {
    const type = block.dataset.animation || "fade-up";
    const enter = parseFloat(block.dataset.enter) / 100;
    const leave = parseFloat(block.dataset.leave) / 100;
    const persist = block.dataset.persist === "true";
    let visible = false;

    const hiddenVars = { opacity: 0, duration: 0.4, ease: "power2.inOut", overwrite: true };
    if (type === "fade-up") hiddenVars.y = 40;
    else if (type === "slide-left") hiddenVars.x = -60;
    else if (type === "slide-right") hiddenVars.x = 60;
    else if (type === "scale-up") hiddenVars.scale = 0.88;
    else if (type === "rotate-in") { hiddenVars.y = 30; hiddenVars.rotation = 3; }

    if (hasGSAP) gsap.set(block, hiddenVars);
    else block.style.opacity = 0;

    const showVars = { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, duration: 0.4, ease: "power2.inOut", overwrite: true };

    // Each service block's Lottie icon plays only while that block is the
    // one currently shown, restarting from frame 0 every time it re-enters
    // so it always reads as a fresh, intentional animation, not a loop
    // caught mid-cycle.
    let lottieAnim = null;
    const lottieEl = block.querySelector(".vs-lottie[data-lottie]");
    if (lottieEl && typeof lottie !== "undefined") {
      lottieAnim = lottie.loadAnimation({
        container: lottieEl,
        renderer: "svg",
        loop: true,
        autoplay: false,
        path: lottieEl.dataset.lottie
      });
    }

    return {
      enter, leave, persist,
      show() {
        if (visible) return;
        visible = true;
        block.classList.add("is-active");
        if (hasGSAP) gsap.to(block, showVars); else block.style.opacity = 1;
        if (lottieAnim) lottieAnim.goToAndPlay(0, true);
      },
      hide() {
        if (visible === false) return;
        visible = false;
        block.classList.remove("is-active");
        if (hasGSAP) gsap.to(block, hiddenVars); else block.style.opacity = 0;
        if (lottieAnim) lottieAnim.pause();
      }
    };
  });

  // Enter/leave windows are contiguous (block N's leave === block N+1's
  // enter), so a strict "< leave" upper bound keeps exactly one block
  // matching at any given progress — no dual-match at the shared boundary,
  // in either scroll direction.
  return (progress) => {
    blocks.forEach(b => {
      const inRange = progress >= b.enter && (b.persist || progress < b.leave);
      if (inRange) b.show(); else b.hide();
    });
  };
}

// Small dot rail on the right edge tracking which .vs-block is active.
function initVideoScrollDots() {
  const blocks = Array.from(document.querySelectorAll(".vs-block"));
  const rail = document.getElementById("vsProgress");
  if (!rail || !blocks.length) return () => {};

  rail.innerHTML = blocks.map(() => "<span></span>").join("");
  const dots = Array.from(rail.children);
  const ranges = blocks.map(b => [parseFloat(b.dataset.enter) / 100, parseFloat(b.dataset.leave) / 100]);

  return (progress) => {
    let activeIndex = 0;
    ranges.forEach(([enter], i) => { if (progress >= enter) activeIndex = i; });
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === activeIndex));
  };
}

initServicesFrameSequence();

// Desktop-only interactions (custom cursor, magnetic buttons, card spotlight)
// need a real mouse; a fine pointer + hover capability is the reliable way
// to detect that, rather than screen width alone.
const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// ---------- Magnetic buttons ----------
function initMagneticButtons() {
  if (!hasGSAP || !isFinePointer) return;
  document.querySelectorAll(".btn-primary.btn-lg").forEach(btn => {
    const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });

    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.25);
      yTo((e.clientY - r.top - r.height / 2) * 0.35);
    });
    btn.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
  });
}
initMagneticButtons();

// ---------- Card spotlight (cursor-tracking glow) ----------
function initCardSpotlight() {
  if (!isFinePointer) return;
  document.querySelectorAll(".service-card, .testimonial-card").forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });
}
initCardSpotlight();

// ---------- Scrollspy nav ----------
function initScrollspy() {
  const links = {};
  document.querySelectorAll(".main-nav a").forEach(a => {
    const id = a.getAttribute("href").replace("#", "");
    links[id] = a;
  });
  const sections = Object.keys(links).map(id => document.getElementById(id)).filter(Boolean);
  if (!sections.length) return;

  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      Object.values(links).forEach(l => l.classList.remove("is-active"));
      const link = links[entry.target.id];
      if (link) link.classList.add("is-active");
    });
  }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

  sections.forEach(s => spy.observe(s));
}
initScrollspy();

// ---------- Float buttons: hide while hero is in view ----------
// The hero has its own WhatsApp CTA already, and on phones its full-width
// buttons sit in the same corner as these fixed buttons — hide them until
// the hero scrolls out of view.
function initFloatStackVisibility() {
  const hero = document.querySelector(".hero");
  const stack = document.querySelector(".float-stack");
  if (!hero || !stack) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      stack.classList.toggle("is-hidden", entry.isIntersecting);
    });
  }, { threshold: 0.15 });

  io.observe(hero);
}
initFloatStackVisibility();

// ---------- Scroll progress bar ----------
const scrollProgress = document.getElementById("scrollProgress");
function updateScrollProgress() {
  if (!scrollProgress) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  scrollProgress.style.width = pct + "%";
}
window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

// ---------- Header scroll state ----------
const header = document.getElementById("siteHeader");
const onScroll = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 40);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---------- Mobile nav toggle ----------
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
navToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", isOpen);
});
mainNav.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ---------- FAQ accordion ----------
document.querySelectorAll(".faq-question").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".faq-item");
    const answer = item.querySelector(".faq-answer");
    const isOpen = item.classList.contains("is-open");

    document.querySelectorAll(".faq-item.is-open").forEach(openItem => {
      if (openItem !== item) {
        openItem.classList.remove("is-open");
        openItem.querySelector(".faq-answer").style.maxHeight = null;
      }
    });

    if (isOpen) {
      item.classList.remove("is-open");
      answer.style.maxHeight = null;
    } else {
      item.classList.add("is-open");
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

// ---------- Como funciona: interactive snow ----------
// Small canvas particle field that drifts downward and gets pushed aside
// by the cursor. Only runs while the section is actually on screen (an
// IntersectionObserver starts/stops the rAF loop) so it costs nothing on
// the rest of the page.
function initSnowEffect() {
  const section = document.getElementById("processo");
  const canvas = document.getElementById("snowCanvas");
  if (!section || !canvas) return;

  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const mouse = { x: -9999, y: -9999 };
  const COUNT = window.innerWidth < 768 ? 32 : 70;

  let w = 0, h = 0, particles = [], running = false, rafId = null;

  function resize() {
    const rect = section.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeParticle() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1 + Math.random() * 2.4,
      speed: 0.35 + Math.random() * 0.7,
      drift: Math.random() * Math.PI * 2,
      driftSpeed: 0.004 + Math.random() * 0.01,
      opacity: 0.3 + Math.random() * 0.5
    };
  }

  function step() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.y += p.speed;
      p.drift += p.driftSpeed;
      p.x += Math.sin(p.drift) * 0.3;

      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = 90;
      if (dist < radius) {
        const force = (radius - dist) / radius;
        p.x += (dx / (dist || 1)) * force * 6;
        p.y += (dy / (dist || 1)) * force * 6;
      }

      if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w; }
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210, 230, 255, ${p.opacity})`;
      ctx.shadowColor = "rgba(143,192,255,0.9)";
      ctx.shadowBlur = 4;
      ctx.fill();
    });
    rafId = requestAnimationFrame(step);
  }

  function start() { if (!running) { running = true; step(); } }
  function stop() { running = false; if (rafId) cancelAnimationFrame(rafId); }

  resize();
  particles = Array.from({ length: COUNT }, makeParticle);
  window.addEventListener("resize", resize);

  section.addEventListener("mousemove", (e) => {
    const rect = section.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  section.addEventListener("mouseleave", () => { mouse.x = -9999; mouse.y = -9999; });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => { entry.isIntersecting ? start() : stop(); });
  }, { threshold: 0.05 });
  io.observe(section);
}
initSnowEffect();

// ---------- Diferenciais: animated Lottie icons ----------
// Each icon only plays while scrolled into view — six 5-second loops
// running constantly off-screen would be wasted CPU for no visual payoff.
function initLottieIcons() {
  if (typeof lottie === "undefined") return;
  const targets = document.querySelectorAll(".diff-lottie[data-lottie]");
  if (!targets.length) return;

  const players = Array.from(targets).map(container => {
    const anim = lottie.loadAnimation({
      container,
      renderer: "svg",
      loop: true,
      autoplay: false,
      path: container.dataset.lottie
    });
    return anim;
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const idx = Array.prototype.indexOf.call(targets, entry.target);
      const anim = players[idx];
      if (!anim) return;
      if (entry.isIntersecting) anim.play(); else anim.pause();
    });
  }, { threshold: 0.2 });

  targets.forEach(el => io.observe(el));
}
initLottieIcons();

// ---------- Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();
