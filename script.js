(() => {
  const $ = s => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = $('#loader'), bar = $('#loader-bar'), pct = $('#pct');
  $('#yr').textContent = new Date().getFullYear();

  // Build the HUD: rings draw in, segments lock on, core powers up
  const segs = $('#segs'), NS = 'http://www.w3.org/2000/svg', N = 24;
  for (let i = 0; i < N; i++) {
    const l = document.createElementNS(NS, 'line');
    l.setAttribute('class', 'seg');
    l.setAttribute('x1', 110); l.setAttribute('x2', 110);
    l.setAttribute('y1', 4); l.setAttribute('y2', 14);
    l.setAttribute('transform', `rotate(${i * 360 / N} 110 110)`);
    segs.appendChild(l);
  }
  const rings = [...document.querySelectorAll('.ring')], lines = [...segs.children];
  const stages = ['Initializing', 'Assembling frame', 'Routing power', 'Calibrating', 'Systems online'];
  function build(p) {
    rings.forEach((r, i) => {
      const f = Math.min(1, Math.max(0, (p - i * 18) / 45));
      r.style.strokeDashoffset = 100 - f * 100;
    });
    lines.forEach((l, i) => l.classList.toggle('on', p >= 30 + (i / N) * 55));
    $('#tri').style.opacity = p > 70 ? 1 : 0;
    $('#core').style.opacity = p > 85 ? 1 : p / 200;
    $('#status').textContent = stages[Math.min(4, Math.floor(p / 25))] + (p < 100 ? '...' : '');
    if (p >= 100) loader.classList.add('ready');
  }

  // Loader: counts up to 90% while the page loads, then finishes at 100%
  let shown = 0, target = 0, loaded = false;
  const tick = () => {
    target = loaded ? 100 : Math.min(90, target + (90 - target) * 0.04 + 0.2);
    shown += (target - shown) * 0.15;
    if (loaded && shown > 99.5) shown = 100;
    bar.style.width = shown + '%';
    pct.textContent = Math.round(shown);
    build(shown);
    shown < 100 ? requestAnimationFrame(tick) : finish();
  };
  const finish = () => {
    setTimeout(() => loader.classList.add('done'), 600);
    document.body.classList.remove('loading');
    setTimeout(() => { loader.remove(); revealSkills(); }, 1500);
  };
  addEventListener('load', () => { loaded = true; });
  if (reduce) { loader.remove(); document.body.classList.remove('loading'); revealSkills(); }
  else requestAnimationFrame(tick);

  // Scroll progress bar
  const sp = $('#scroll-progress');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    sp.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Skill bars animate when scrolled into view
  function revealSkills() {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const li = e.target, fill = li.querySelector('i'), num = li.querySelector('b');
      const end = +num.dataset.count, t0 = performance.now();
      fill.style.width = fill.dataset.w + '%';
      const count = t => {
        const p = reduce ? 1 : Math.min(1, (t - t0) / 1400);
        num.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(count);
      };
      requestAnimationFrame(count);
      io.unobserve(li);
    }), { threshold: 0.6 });
    document.querySelectorAll('.skills li').forEach(li => io.observe(li));
  }
})();
