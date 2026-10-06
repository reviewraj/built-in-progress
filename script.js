(() => {
  const $ = s => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = $('#loader'), bar = $('#loader-bar'), pct = $('#pct');
  $('#yr').textContent = new Date().getFullYear();

  // Loader: counts up to 90% while the page loads, then finishes at 100%
  let shown = 0, target = 0, loaded = false;
  const tick = () => {
    target = loaded ? 100 : Math.min(90, target + (90 - target) * 0.04 + 0.2);
    shown += (target - shown) * 0.15;
    if (loaded && shown > 99.5) shown = 100;
    bar.style.width = shown + '%';
    pct.textContent = Math.round(shown);
    shown < 100 ? requestAnimationFrame(tick) : finish();
  };
  const finish = () => {
    loader.classList.add('done');
    document.body.classList.remove('loading');
    setTimeout(() => { loader.remove(); revealSkills(); }, 900);
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
