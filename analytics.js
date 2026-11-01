/* AI Smartr analytics + conversion events.
   Paste ONE id below to turn tracking on. Leave both empty to keep it off.
     GA4_ID        e.g. 'G-XXXXXXXXXX'
     PLAUSIBLE_DOMAIN  e.g. 'aismartr.com' (cookieless) */
(function () {
  var GA4_ID = '';
  var PLAUSIBLE_DOMAIN = '';

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  if (GA4_ID) {
    var g = document.createElement('script');
    g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(g);
    gtag('js', new Date());
    gtag('config', GA4_ID);
  }
  if (PLAUSIBLE_DOMAIN) {
    var p = document.createElement('script');
    p.defer = true; p.setAttribute('data-domain', PLAUSIBLE_DOMAIN);
    p.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(p);
    window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
  }

  window.aiTrack = function (name, params) {
    try {
      if (GA4_ID) gtag('event', name, params || {});
      if (PLAUSIBLE_DOMAIN && window.plausible) window.plausible(name, { props: params || {} });
    } catch (e) {}
  };

  // booking CTA clicks, phone/email clicks
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (a.matches('.btn-primary,.btn-go,.btn-nav,.btn-line,.btn-ghost') || href.indexOf('cal-booking') > -1) {
      window.aiTrack('cta_click', { label: (a.textContent || '').trim().slice(0, 60), page: location.pathname });
    } else if (href.indexOf('mailto:') === 0) {
      window.aiTrack('email_click', { page: location.pathname });
    }
  });

  // Cal.com booking completed
  window.aiBindCal = function () {
    if (!window.Cal) return;
    window.Cal('on', { action: 'bookingSuccessful', callback: function () { window.aiTrack('generate_lead', { method: 'cal_booking', page: location.pathname }); } });
  };
})();
