(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  // scroll reveal
  var sel = '.value-card,.step,.service-row,.price-card,.price-chip,.blog-post-row,.expect-card,.faq-item,.sb-inner,.contact-method,.story-lessons li,.post-stat-box,.post-highlight,.post-callout,.section-header,.wg-list,.wg-copy,.stat-row,.stats-bar-inner';
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('in');
        io.unobserve(el);
        setTimeout(function () { el.classList.remove('reveal', 'in'); }, 1100);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll(sel).forEach(function (el) {
      var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--d', (Math.min(idx, 5) * 0.08) + 's');
      el.classList.add('reveal');
      io.observe(el);
    });
  }
})();
