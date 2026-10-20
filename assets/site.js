/* BALANCE by Becks — shared behaviour
   1) Booking: one URL, one style, used by the pop-up and the inline calendar.
   2) .rise elements fade in on scroll.
   3) Footer year + Bali clock.                                              */
(function () {
  'use strict';

  /* ---------- booking ---------- */
  var BASE  = window.BOOKING_URL || 'https://calendly.com/balancebybecks/new-meeting';
  var STYLE = window.BOOKING_STYLE || { hide_gdpr_banner: 1 };

  function bookingUrl(extra) {
    var q = [], k;
    for (k in STYLE) { if (Object.prototype.hasOwnProperty.call(STYLE, k)) {
      q.push(encodeURIComponent(k) + '=' + encodeURIComponent(STYLE[k]));
    } }
    if (extra) { for (k in extra) { if (Object.prototype.hasOwnProperty.call(extra, k)) {
      q.push(encodeURIComponent(k) + '=' + encodeURIComponent(extra[k]));
    } } }
    return BASE + (BASE.indexOf('?') === -1 ? '?' : '&') + q.join('&');
  }
  window.bookingUrl = bookingUrl;

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-book]') : null;
    if (!t) return;
    if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function') {
      e.preventDefault();
      window.Calendly.initPopupWidget({ url: bookingUrl() });
    }
    /* widget blocked or still loading: the link falls through to #book,
       where the inline calendar lives, so the CTA is never a dead end. */
  });

  /* ---------- inline calendar ----------
     Give the widget its styled URL, then let Calendly's own script pick the
     element up. If the script never arrives, show the plain link instead. */
  var slot = document.getElementById('calendar');
  if (slot) {
    slot.setAttribute('data-url', bookingUrl({ hide_event_type_details: 0 }));

    var started = false;
    var check = function () {
      if (started) return;
      if (slot.querySelector('iframe')) { started = true; return; }
      if (window.Calendly && typeof window.Calendly.initInlineWidget === 'function') {
        window.Calendly.initInlineWidget({ url: slot.getAttribute('data-url'), parentElement: slot });
        started = true;
      }
    };
    var tries = 0;
    var poll = setInterval(function () {
      check();
      if (started || ++tries > 20) {
        clearInterval(poll);
        if (!started) {
          var a = slot.querySelector('.booking__fallback');
          if (a) a.hidden = false;
        }
      }
    }, 400);
    check();
  }

  /* ---------- reveal ---------- */
  var risers = document.querySelectorAll('.rise');
  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(risers, function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(risers, function (el) { io.observe(el); });
  }

  /* ---------- year ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = new Date().getFullYear();
  });

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
