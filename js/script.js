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
