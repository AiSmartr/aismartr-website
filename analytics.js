/* AI Smartr analytics + conversion events.
   Tracking stays OFF until you paste a key below.
     POSTHOG_KEY       PostHog project token, e.g. 'phc_xxx' (public, safe to publish)
     POSTHOG_HOST      'https://us.i.posthog.com' (US) or 'https://eu.i.posthog.com' (EU)
     GA4_ID            optional, e.g. 'G-XXXXXXXXXX'
     PLAUSIBLE_DOMAIN  optional, e.g. 'aismartr.com'
   Events: cta_click, email_click, generate_lead (Cal booking done), ai_referral (visit from an AI answer engine). */
(function () {
  var POSTHOG_KEY = '';
  var POSTHOG_HOST = 'https://us.i.posthog.com';
  var GA4_ID = '';
  var PLAUSIBLE_DOMAIN = '';

  var dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1';
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  if (!dnt) {
    if (POSTHOG_KEY) {
      !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
      window.posthog.init(POSTHOG_KEY, { api_host: POSTHOG_HOST, defaults: '2026-08-30', person_profiles: 'identified_only', capture_pageleave: true });
    }
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
  }

  window.aiTrack = function (name, params) {
    if (dnt) return;
    try {
      if (POSTHOG_KEY && window.posthog) window.posthog.capture(name, params || {});
      if (GA4_ID) gtag('event', name, params || {});
      if (PLAUSIBLE_DOMAIN && window.plausible) window.plausible(name, { props: params || {} });
    } catch (e) {}
  };

  // visits that arrive from AI answer engines
  var AI_HOSTS = ['chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'gemini.google.com', 'copilot.microsoft.com', 'claude.ai', 'you.com', 'phind.com', 'meta.ai', 'poe.com'];
  try {
    var ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : '';
    var hit = AI_HOSTS.filter(function (h) { return ref === h || ref.slice(-h.length - 1) === '.' + h; })[0];
    var utm = (new URLSearchParams(location.search)).get('utm_source') || '';
    var utmHit = /chatgpt|openai|perplexity|gemini|copilot|claude/i.test(utm);
    if ((hit || utmHit) && !sessionStorage.getItem('ai_ref_sent')) {
      sessionStorage.setItem('ai_ref_sent', '1');
      var src = hit || utm;
      if (POSTHOG_KEY && window.posthog) window.posthog.register({ ai_referrer: src });
      window.aiTrack('ai_referral', { source: src, page: location.pathname });
    }
  } catch (e) {}

  // booking CTA clicks, email clicks
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (a.matches('.btn-primary,.btn-go,.btn-nav,.btn-line,.btn-ghost') || href.indexOf('cal-booking') > -1 || href === '#book') {
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
