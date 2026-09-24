// Frecce del carosello eventi: scorrono di una scheda alla volta e ripartono dall'inizio in fondo.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var behavior = reduce ? 'auto' : 'smooth';

  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var track = root.querySelector('[data-track]');
    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    if (!track) return;

    function step() {
      var first = track.children[0];
      if (!first) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return first.getBoundingClientRect().width + gap;
    }

    function go(dir) {
      var max = track.scrollWidth - track.clientWidth;
      if (max <= 1) return;
      if (dir > 0 && track.scrollLeft >= max - 2) {
        track.scrollTo({ left: 0, behavior: behavior });
      } else if (dir < 0 && track.scrollLeft <= 2) {
        track.scrollTo({ left: max, behavior: behavior });
      } else {
        track.scrollBy({ left: dir * step(), behavior: behavior });
      }
    }

    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
  });
})();

// Menu su mobile e tablet: si apre dal pulsante, si chiude scegliendo una voce, con Esc o toccando fuori.
(function () {
  var header = document.querySelector('.header');
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('menu');
  if (!header || !toggle || !nav) return;

  function set(open) {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  }

  toggle.addEventListener('click', function () { set(!header.classList.contains('is-open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  document.addEventListener('click', function (e) {
    if (header.classList.contains('is-open') && !header.contains(e.target)) set(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('is-open')) { set(false); toggle.focus(); }
  });

  var desktop = window.matchMedia('(min-width: 1024px)');
  var reset = function () { set(false); };
  if (desktop.addEventListener) desktop.addEventListener('change', reset);
  else if (desktop.addListener) desktop.addListener(reset);
})();

// Header sticky: stato compatto quando si scorre, voce del menu attiva, spazio giusto per le ancore.
(function () {
  var header = document.querySelector('.header');
  if (!header) return;
  var topbar = document.querySelector('.topbar');
  var root = document.documentElement;
  var links = [].slice.call(document.querySelectorAll('#menu a[href^="#"]'));
  var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var ticking = false;

  function setPadding() {
    var h = Math.round(header.getBoundingClientRect().height) + 16;
    root.style.scrollPaddingTop = 'calc(env(safe-area-inset-top, 0px) + ' + h + 'px)';
  }

  function update() {
    ticking = false;
    var threshold = topbar ? topbar.offsetHeight : 0;
    header.classList.toggle('is-stuck', window.scrollY > threshold + 2);

    var line = header.getBoundingClientRect().bottom + window.innerHeight * 0.25;
    var active = -1;
    targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= line) active = i; });
    links.forEach(function (a, i) {
      var on = i === active;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }

  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { setPadding(); onScroll(); });
  setPadding();
  update();
})();

// Video delle sezioni: si caricano solo quando stanno per entrare nello schermo,
// partono da soli senza audio e si fermano quando escono. Con "riduci movimento" resta la foto.
(function () {
  var videos = [].slice.call(document.querySelectorAll('video.lazy-video'));
  if (!videos.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  function load(v) {
    if (v.dataset.loaded) return;
    v.src = v.dataset.src;
    v.dataset.loaded = '1';
  }
  function play(v) {
    load(v);
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  if (!('IntersectionObserver' in window)) { videos.forEach(play); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) play(e.target); else if (e.target.dataset.loaded) e.target.pause();
    });
  }, { rootMargin: '200px 0px' });
  videos.forEach(function (v) { io.observe(v); });
})();
