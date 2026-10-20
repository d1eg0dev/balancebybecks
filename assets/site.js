/* BALANCE by Becks — shared behaviour
   1) Every [data-book] opens the Calendly pop-up (falls back to a new tab).
   2) .rise elements fade in on scroll.
   3) Footer year + Bali clock.                                              */
(function () {
  'use strict';

  /* ---------- booking ---------- */
  var URL_ = window.BOOKING_URL || 'https://calendly.com/balancebybecks/new-meeting';

  function openBooking(e) {
    if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function') {
      if (e) e.preventDefault();
      window.Calendly.initPopupWidget({ url: URL_ + '?hide_gdpr_banner=1' });
      return false;
    }
    /* no widget (blocked, offline, still loading): let the link do its job */
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-book]');
    if (t) openBooking(e);
  });

  /* The inline calendar auto-initialises: the element carries Calendly's own
     .calendly-inline-widget class and data-url, so the widget script picks it
     up whenever it finishes loading. Nothing to do here. */

  /* ---------- reveal ---------- */
  var risers = document.querySelectorAll('.rise');
  if (!('IntersectionObserver' in window)) {
    risers.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    risers.forEach(function (el) { io.observe(el); });
  }

  /* ---------- year ---------- */
  var y = document.querySelectorAll('[data-year]');
  y.forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Bali clock ---------- */
  var clock = document.querySelector('[data-bali]');
  if (clock) {
    var tick = function () {
      try {
        clock.textContent = new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Makassar'
        }).format(new Date());
      } catch (err) { clock.textContent = '--:--'; }
    };
    tick();
    setInterval(tick, 30000);
  }
})();
