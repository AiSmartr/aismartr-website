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

  // home hero extras (only runs where the hero exists)
  var hero = document.getElementById('vh');
  if (!hero) return;

  var box = document.getElementById('embers');
  if (box) {
    var n = window.innerWidth < 768 ? 8 : 18;
    for (var i = 0; i < n; i++) {
      var e = document.createElement('span');
      e.className = 'ember';
      var s = 3 + Math.random() * 7;
      e.style.cssText = 'left:' + (Math.random() * 100) + '%;width:' + s + 'px;height:' + s + 'px;animation-duration:' + (9 + Math.random() * 10) + 's;animation-delay:-' + (Math.random() * 14) + 's;--dx:' + ((Math.random() * 120) - 60) + 'px';
      box.appendChild(e);
    }
  }

  if (window.matchMedia('(pointer:fine)').matches) {
    hero.addEventListener('mousemove', function (ev) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--px', ((ev.clientX - r.left) / r.width * 2 - 1).toFixed(3));
      hero.style.setProperty('--py', ((ev.clientY - r.top) / r.height * 2 - 1).toFixed(3));
    });
  }

  var words = document.querySelectorAll('#words b'), w = 0;
  if (words.length) setInterval(function () {
    words[w].classList.remove('on'); w = (w + 1) % words.length; words[w].classList.add('on');
  }, 2300);

  var items = document.querySelectorAll('#feed li'), f = 0;
  if (items.length) setInterval(function () {
    items[f].classList.remove('on'); f = (f + 1) % items.length; items[f].classList.add('on');
  }, 2000);
})();
