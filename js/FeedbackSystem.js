import { CONFIG } from './config.js';

export class FeedbackSystem {
  constructor(core, layer, canvas) {
    this.core = core;
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.parts = [];
    this.looping = false;
    this.idx = 0;
    this.pool = [];
    for (let i = 0; i < CONFIG.maxFloaters; i++) { // pool reutilizável
      const d = document.createElement('div');
      d.className = 'floater';
      d.addEventListener('animationend', () => d.classList.remove('go'));
      layer.appendChild(d);
      this.pool.push(d);
    }
    this.resize();
    addEventListener('resize', () => this.resize());
  }
  resize() { this.cv.width = innerWidth; this.cv.height = innerHeight; }

  center() {
    const b = this.core.getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + b.height / 2, r: b.width / 2 };
  }

  floater(text, x, y) {
    const d = this.pool[this.idx++ % this.pool.length];
    d.classList.remove('go');
    d.textContent = text;
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    void d.offsetWidth; // reinicia a animação
    d.classList.add('go');
  }

  burst(x, y, n, speed) {
    for (let i = 0; i < n && this.parts.length < CONFIG.maxParticles; i++) {
      const a = Math.random() * Math.PI * 2, s = (0.4 + Math.random()) * speed;
      this.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1 });
    }
    if (!this.looping) { this.looping = true; requestAnimationFrame(t => this.loop()); }
  }

  loop() {
    const c = this.ctx;
    c.clearRect(0, 0, this.cv.width, this.cv.height);
    let w = 0;
    for (const p of this.parts) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.035;
      if (p.life <= 0) continue;
      c.globalAlpha = p.life;
      c.fillStyle = '#38e8ff';
      c.fillRect(p.x, p.y, 4, 4);
      this.parts[w++] = p;
    }
    this.parts.length = w;
    c.globalAlpha = 1;
    if (w) requestAnimationFrame(() => this.loop());
    else this.looping = false;
  }

  hit(px, py, damage, combo, mult) {
    const m = this.center();
    const x = px ?? m.x + (Math.random() - 0.5) * m.r;
    const y = py ?? m.y;
    this.floater('+' + damage, x + (Math.random() - 0.5) * 30, y - 20);
    this.burst(x, y, 5 + Math.min(10, combo / 5), 3 + mult);
    this.core.animate(
      [{ transform: 'scale(1)', filter: 'brightness(1)' },
       { transform: 'scale(0.92)', filter: 'brightness(1.6)' },
       { transform: 'scale(1)', filter: 'brightness(1)' }],
      { duration: 110 });
    document.documentElement.style.setProperty('--glow', 30 + mult * 18 + 'px');
  }

  death() {
    const m = this.center();
    this.burst(m.x, m.y, CONFIG.maxParticles, 8);
    this.core.classList.add('dead');
  }

  clear() {
    this.parts.length = 0;
    this.ctx.clearRect(0, 0, this.cv.width, this.cv.height);
    this.pool.forEach(d => d.classList.remove('go'));
    this.core.classList.remove('dead');
    document.documentElement.style.setProperty('--glow', '30px');
  }
}
