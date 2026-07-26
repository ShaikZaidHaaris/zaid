(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Scroll reveals
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  // Starfield + subtle scan sweep
  const canvas = document.getElementById("sky");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars = [];
  let sweep = 0;
  let raf = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedStars();
  }

  function seedStars() {
    const count = Math.floor((width * height) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random() * 0.55 + 0.15,
      tw: Math.random() * Math.PI * 2,
      sp: 0.004 + Math.random() * 0.01,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, width, height);

    // Deep sky wash
    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, "#050b12");
    g.addColorStop(0.45, "#071018");
    g.addColorStop(1, "#0a1a22");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    // Soft aurora blot
    const a = ctx.createRadialGradient(
      width * 0.62,
      height * 0.28,
      0,
      width * 0.62,
      height * 0.28,
      Math.max(width, height) * 0.45
    );
    a.addColorStop(0, "rgba(62, 207, 154, 0.12)");
    a.addColorStop(0.45, "rgba(212, 165, 116, 0.05)");
    a.addColorStop(1, "transparent");
    ctx.fillStyle = a;
    ctx.fillRect(0, 0, width, height);

    // Stars
    for (const s of stars) {
      const twinkle = reduceMotion
        ? s.a
        : s.a * (0.65 + 0.35 * Math.sin(t * s.sp + s.tw));
      ctx.beginPath();
      ctx.fillStyle = `rgba(232, 238, 244, ${twinkle})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Radar sweep
    if (!reduceMotion) {
      sweep = (t * 0.00008) % 1;
      const cx = width * 0.58;
      const cy = height * 0.38;
      const radius = Math.max(width, height) * 0.55;
      const angle = sweep * Math.PI * 2;

      const sweepGrad = ctx.createConicGradient(angle, cx, cy);
      sweepGrad.addColorStop(0, "rgba(62, 207, 154, 0.16)");
      sweepGrad.addColorStop(0.08, "rgba(62, 207, 154, 0.03)");
      sweepGrad.addColorStop(0.2, "transparent");
      sweepGrad.addColorStop(1, "transparent");

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle - 0.35, angle + 0.02);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();
      ctx.restore();
    }

    if (!reduceMotion) {
      raf = requestAnimationFrame(draw);
    }
  }

  resize();
  window.addEventListener("resize", resize);

  if (reduceMotion) {
    draw(0);
  } else {
    raf = requestAnimationFrame(draw);
  }

  window.addEventListener("beforeunload", () => cancelAnimationFrame(raf));
})();
