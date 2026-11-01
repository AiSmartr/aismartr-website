(function () {
  var hero = document.getElementById('vh');
  if (!hero) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TAU = Math.PI * 2;

  /* ---------- embers, mouse parallax, rotating word ---------- */
  var px = 0, py = 0;
  var box = document.getElementById('embers');
  if (box && !reduce) {
    var n = window.innerWidth < 768 ? 8 : 18;
    for (var i = 0; i < n; i++) {
      var e = document.createElement('span');
      e.className = 'ember';
      var s = 3 + Math.random() * 7;
      e.style.cssText = 'left:' + (Math.random() * 100) + '%;width:' + s + 'px;height:' + s + 'px;animation-duration:' + (9 + Math.random() * 10) + 's;animation-delay:-' + (Math.random() * 14) + 's;--dx:' + ((Math.random() * 120) - 60) + 'px';
      box.appendChild(e);
    }
  }
  if (!reduce && window.matchMedia('(pointer:fine)').matches) {
    hero.addEventListener('mousemove', function (ev) {
      var r = hero.getBoundingClientRect();
      px = (ev.clientX - r.left) / r.width * 2 - 1;
      py = (ev.clientY - r.top) / r.height * 2 - 1;
      hero.style.setProperty('--px', px.toFixed(3));
      hero.style.setProperty('--py', py.toFixed(3));
    });
  }
  var words = document.querySelectorAll('#words b'), w = 0;
  if (words.length && !reduce) setInterval(function () {
    words[w].classList.remove('on'); w = (w + 1) % words.length; words[w].classList.add('on');
  }, 2300);
})();
