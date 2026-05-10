/* ============================================================
   SetupProTest — canvas.js  |  Animated background
   ============================================================ */

(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], lines = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.hue = Math.random() * 60 + 170; // cyan-purple range
      this.alpha = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue},100%,70%,${this.alpha})`;
      ctx.shadowColor = `hsl(${this.hue},100%,70%)`;
      ctx.shadowBlur = 6;
      ctx.fill();
    }
  }

  function initParticles(n = 80) {
    particles = Array.from({ length: n }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.12;
          const hue = (a.hue + b.hue) / 2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `hsla(${hue},100%,70%,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.shadowBlur = 0;
          ctx.stroke();
        }
      }
    }
  }

  // Scanning line effect
  let scanY = 0;
  function drawScanLine() {
    scanY = (scanY + 0.4) % H;
    const grad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
    grad.addColorStop(0, 'rgba(0,245,255,0)');
    grad.addColorStop(0.5, 'rgba(0,245,255,0.025)');
    grad.addColorStop(1, 'rgba(0,245,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY - 40, W, 80);
  }

  // Grid lines
  function drawGrid() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const alpha = isDark ? 0.025 : 0.04;
    ctx.strokeStyle = `rgba(0,180,255,${alpha})`;
    ctx.lineWidth = 0.5;
    ctx.shadowBlur = 0;

    const step = 80;
    for (let x = 0; x <= W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, W, H);

    drawGrid();
    drawScanLine();
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
  }

  window.addEventListener('resize', () => { resize(); initParticles(); });
  resize();
  initParticles();
  animate();
})();
