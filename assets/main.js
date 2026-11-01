const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;

document.getElementById('year').textContent = new Date().getFullYear();

// Clock in Beijing time
const clock = document.getElementById('clock');
const fmt = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
const tick = () => { clock.textContent = `UTC+8 · ${fmt.format(new Date())}`; };
tick();
setInterval(tick, 1000);

// Rotating word in the tagline
const rotate = document.getElementById('rotate');
const words = rotate.dataset.words.split(',');
let wi = 0;
setInterval(() => {
  wi = (wi + 1) % words.length;
  rotate.textContent = words[wi];
  rotate.classList.remove('swap');
  void rotate.offsetWidth;
  rotate.classList.add('swap');
}, 2200);

// Flow field: particles drift along a shifting angle field and swirl around the pointer
const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');
const mouse = { x: -9999, y: -9999 };
let w, h, particles = [], running = true, t = 0;

function resize() {
  if (canvas.clientWidth === w && canvas.clientHeight === h) return;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  w = canvas.clientWidth;
  h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const n = Math.min(Math.floor((w * h) / 2200), 900);
  particles = Array.from({ length: n }, spawn);
  ctx.fillStyle = '#0b0b0c';
  ctx.fillRect(0, 0, w, h);
}

function spawn() {
  return { x: Math.random() * w, y: Math.random() * h, life: Math.random() * 200, accent: Math.random() < 0.12 };
}

function angle(x, y) {
  return (Math.sin(x * 0.0021 + t) + Math.cos(y * 0.0027 - t * 0.7) + Math.sin((x + y) * 0.0013 + t * 0.4)) * Math.PI * 0.75;
}

function frame() {
  if (!running) return;
  t += 0.0025;
  ctx.fillStyle = 'rgba(11, 11, 12, 0.07)';
  ctx.fillRect(0, 0, w, h);
  ctx.lineWidth = 1.1;

  for (const p of particles) {
    let a = angle(p.x, p.y);
    const dx = p.x - mouse.x, dy = p.y - mouse.y;
    const d2 = dx * dx + dy * dy;
    let speed = 1.1;
    if (d2 < 32000) {
      const f = 1 - d2 / 32000;
      a = a * (1 - f) + (Math.atan2(dy, dx) + Math.PI / 2) * f;
      speed += f * 3;
    }
    const nx = p.x + Math.cos(a) * speed;
    const ny = p.y + Math.sin(a) * speed;
    ctx.strokeStyle = p.accent ? 'rgba(200, 255, 62, 0.55)' : 'rgba(239, 236, 228, 0.22)';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(nx, ny);
    ctx.stroke();
    p.x = nx; p.y = ny;
    if (--p.life < 0 || nx < 0 || nx > w || ny < 0 || ny > h) {
      Object.assign(p, spawn(), { life: 100 + Math.random() * 200 });
    }
  }
  requestAnimationFrame(frame);
}

resize();
addEventListener('resize', resize);
const hero = document.querySelector('.hero');
hero.addEventListener('pointermove', (e) => {
  const r = canvas.getBoundingClientRect();
  mouse.x = e.clientX - r.left;
  mouse.y = e.clientY - r.top;
});
hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });

if (reduceMotion) {
  running = false;
  for (let i = 0; i < 120; i++) { running = true; frame(); running = false; }
} else {
  // Pause the field while the hero is off-screen
  new IntersectionObserver(([e]) => {
    const was = running;
    running = e.isIntersecting;
    if (running && !was) requestAnimationFrame(frame);
  }).observe(hero);
  requestAnimationFrame(frame);
}

// Scroll reveal and stat counters
const revealer = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('in');
    const num = e.target.querySelector('[data-count]');
    if (num) countUp(num);
    revealer.unobserve(e.target);
  }
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => revealer.observe(el));

function countUp(el) {
  const end = +el.dataset.count;
  if (reduceMotion) { el.textContent = end; return; }
  const start = performance.now();
  const step = (now) => {
    const k = Math.min((now - start) / 1400, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Statement lights up word by word as it scrolls through the viewport
const statement = document.getElementById('statement');
statement.innerHTML = statement.textContent
  .match(/[A-Za-z0-9]+|./g)
  .map((c) => `<span class="w">${c}</span>`)
  .join('');
const chars = statement.querySelectorAll('.w');
function lightStatement() {
  const r = statement.getBoundingClientRect();
  const k = reduceMotion ? 1 : (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35);
  const lit = Math.floor(Math.max(0, Math.min(1, k)) * chars.length);
  chars.forEach((c, i) => c.classList.toggle('on', i < lit));
}
addEventListener('scroll', lightStatement, { passive: true });
lightStatement();

// Custom cursor, magnetic button, tilting artwork
if (finePointer && !reduceMotion) {
  const cursor = document.querySelector('.cursor');
  let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
  addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });
  (function follow() {
    cx += (tx - cx) * 0.2;
    cy += (ty - cy) * 0.2;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(follow);
  })();
  document.querySelectorAll('a, .services li').forEach((el) => {
    el.addEventListener('pointerenter', () => cursor.classList.add('big'));
    el.addEventListener('pointerleave', () => cursor.classList.remove('big'));
  });

  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  document.querySelectorAll('.work').forEach((card) => {
    const art = card.querySelector('.art');
    card.addEventListener('pointermove', (e) => {
      const r = art.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      art.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
    });
    card.addEventListener('pointerleave', () => { art.style.transform = ''; });
  });
}
