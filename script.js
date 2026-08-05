// Salong Solstråle — delad script.js

document.addEventListener('DOMContentLoaded', function () {
  initNav();
  initFadeIn();
  initBookingAvailability();
  initBookingForm();
});

/* ---------- Booking availability picker ---------- */
function initBookingAvailability() {
  var dayPicker = document.getElementById('day-picker');
  var timeGrid = document.getElementById('time-grid');
  if (!dayPicker || !timeGrid) return;

  var datumInput = document.getElementById('datum');
  var tidInput = document.getElementById('tid');
  var summary = document.getElementById('selected-summary');
  var errorEl = document.getElementById('error-tid');

  var weekdays = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
  var months = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
  var slots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  function hash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) >>> 0; }
    return h;
  }

  function toKey(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function isBooked(dateKey, time) {
    var h = hash(dateKey + time);
    return h % 5 === 0 || h % 7 === 0;
  }

  var days = [];
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  for (var i = 0; i < 10; i++) {
    var d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 0) days.push(d);
  }

  var selectedDateKey = null;

  function renderDays() {
    dayPicker.innerHTML = '';
    days.forEach(function (d, idx) {
      var key = toKey(d);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'day-chip';
      btn.innerHTML = '<span class="day-name">' + weekdays[d.getDay()] + '</span><span class="day-num">' + d.getDate() + '</span>';
      if (key === selectedDateKey) btn.classList.add('active');
      btn.addEventListener('click', function () {
        selectedDateKey = key;
        datumInput.value = key;
        tidInput.value = '';
        renderDays();
        renderSlots(d);
        updateSummary();
      });
      dayPicker.appendChild(btn);
    });
  }

  function renderSlots(d) {
    timeGrid.innerHTML = '';
    var key = toKey(d);
    var isToday = key === toKey(today);
    var nowHour = new Date().getHours();
    slots.forEach(function (time) {
      var hour = parseInt(time.split(':')[0], 10);
      var booked = isBooked(key, time) || (isToday && hour <= nowHour);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-slot' + (booked ? ' booked' : '');
      btn.textContent = booked ? time + ' · Bokad' : time;
      btn.disabled = booked;
      if (!booked && tidInput.value === time && selectedDateKey === key) btn.classList.add('active');
      if (!booked) {
        btn.addEventListener('click', function () {
          tidInput.value = time;
          timeGrid.classList.remove('error');
          if (errorEl) errorEl.textContent = '';
          timeGrid.querySelectorAll('.time-slot').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          updateSummary();
        });
      }
      timeGrid.appendChild(btn);
    });
  }

  function updateSummary() {
    if (!summary) return;
    if (selectedDateKey && tidInput.value) {
      var d = new Date(selectedDateKey + 'T00:00:00');
      summary.textContent = 'Vald tid: ' + weekdays[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ', ' + tidInput.value + '.';
      summary.classList.add('has-selection');
    } else {
      summary.textContent = 'Ingen tid vald ännu.';
      summary.classList.remove('has-selection');
    }
  }

  tidInput.value = '';
  renderDays();
  selectedDateKey = toKey(days[0]);
  datumInput.value = selectedDateKey;
  renderDays();
  renderSlots(days[0]);
  updateSummary();
}

/* ---------- Navigation ---------- */
function initNav() {
  var navbar = document.querySelector('.navbar');
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.classList.remove('open');
        links.classList.remove('open');
      });
    });
  }

  if (navbar) {
    var onScroll = function () {
      if (window.scrollY > 12) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
  }
}

/* ---------- Fade-in on scroll ---------- */
function initFadeIn() {
  var items = document.querySelectorAll('.fade-in');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(function (el) { observer.observe(el); });
}

/* ---------- Booking form validation ---------- */
function initBookingForm() {
  var form = document.getElementById('booking-form');
  if (!form) return;

  var fields = {
    namn: { el: form.querySelector('#namn'), validate: function (v) { return v.trim().length >= 2; }, msg: 'Ange ditt fullständiga namn.' },
    epost: { el: form.querySelector('#epost'), validate: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }, msg: 'Ange en giltig e-postadress.' },
    telefon: { el: form.querySelector('#telefon'), validate: function (v) { return /^[0-9+\s-]{7,15}$/.test(v.trim()); }, msg: 'Ange ett giltigt telefonnummer.' },
    tjanst: { el: form.querySelector('#tjanst'), validate: function (v) { return v !== ''; }, msg: 'Välj en tjänst.' },
    tid: { el: form.querySelector('#tid'), validate: function (v) { return v !== ''; }, msg: 'Välj en ledig tid i kalendern ovan.' }
  };

  Object.keys(fields).forEach(function (key) {
    var f = fields[key];
    if (!f.el) return;
    f.el.addEventListener('blur', function () { validateField(key); });
    f.el.addEventListener('input', function () { clearError(key); });
  });

  function validateField(key) {
    var f = fields[key];
    var value = f.el.value || '';
    var valid = f.validate(value);
    var errorEl = document.getElementById('error-' + key);
    if (!valid) {
      f.el.classList.add('error');
      if (key === 'tid') { var tg = document.getElementById('time-grid'); if (tg) tg.classList.add('error'); }
      if (errorEl) errorEl.textContent = f.msg;
    } else {
      clearError(key);
    }
    return valid;
  }

  function clearError(key) {
    var f = fields[key];
    f.el.classList.remove('error');
    if (key === 'tid') { var tg = document.getElementById('time-grid'); if (tg) tg.classList.remove('error'); }
    var errorEl = document.getElementById('error-' + key);
    if (errorEl) errorEl.textContent = '';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var allValid = true;
    Object.keys(fields).forEach(function (key) {
      if (!fields[key].el) return;
      if (!validateField(key)) allValid = false;
    });

    var successEl = document.getElementById('form-success');

    if (allValid) {
      var namn = fields.namn.el.value.trim();
      if (successEl) {
        successEl.textContent = 'Tack ' + namn + '! Din bokningsförfrågan är mottagen — vi bekräftar via e-post eller telefon inom kort.';
        successEl.classList.add('show');
      }
      form.reset();
      Object.keys(fields).forEach(function (key) { clearError(key); });
      initBookingAvailability();
      if (successEl) {
        var rect = successEl.getBoundingClientRect();
        var targetY = window.scrollY + rect.top - (window.innerHeight / 2) + (rect.height / 2);
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    } else if (successEl) {
      successEl.classList.remove('show');
    }
  });
}
