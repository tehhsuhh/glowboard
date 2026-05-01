(function () {
  'use strict';

  var ANIMATION_CONFIG = {
    INITIAL_DURATION: 1200,
    INITIAL_X_OFFSET: 70,
    INITIAL_Y_OFFSET: 60,
    DEVICE_BETA_OFFSET: 20,
    ENTER_TRANSITION_MS: 180
  };

  function clamp(v, min, max) {
    min = min === undefined ? 0 : min;
    max = max === undefined ? 100 : max;
    return Math.min(Math.max(v, min), max);
  }

  function round(v, precision) {
    precision = precision === undefined ? 3 : precision;
    return parseFloat(v.toFixed(precision));
  }

  function adjust(v, fMin, fMax, tMin, tMax) {
    return round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));
  }

  function createTiltEngine(wrapEl, shellEl) {
    var rafId = null;
    var running = false;
    var lastTs = 0;
    var currentX = 0, currentY = 0, targetX = 0, targetY = 0;
    var DEFAULT_TAU = 0.14;
    var INITIAL_TAU = 0.6;
    var initialUntil = 0;

    function setVarsFromXY(x, y) {
      var width = shellEl.clientWidth || 1;
      var height = shellEl.clientHeight || 1;
      var percentX = clamp((100 / width) * x);
      var percentY = clamp((100 / height) * y);
      var centerX = percentX - 50;
      var centerY = percentY - 50;

      wrapEl.style.setProperty('--pc-pointer-x', percentX + '%');
      wrapEl.style.setProperty('--pc-pointer-y', percentY + '%');
      wrapEl.style.setProperty('--pc-background-x', adjust(percentX, 0, 100, 35, 65) + '%');
      wrapEl.style.setProperty('--pc-background-y', adjust(percentY, 0, 100, 35, 65) + '%');
      wrapEl.style.setProperty('--pc-pointer-from-center', clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1));
      wrapEl.style.setProperty('--pc-pointer-from-top', percentY / 100);
      wrapEl.style.setProperty('--pc-pointer-from-left', percentX / 100);
      wrapEl.style.setProperty('--pc-rotate-x', round(-(centerX / 5)) + 'deg');
      wrapEl.style.setProperty('--pc-rotate-y', round(centerY / 4) + 'deg');
    }

    function step(ts) {
      if (!running) return;
      if (lastTs === 0) lastTs = ts;
      var dt = (ts - lastTs) / 1000;
      lastTs = ts;

      var tau = ts < initialUntil ? INITIAL_TAU : DEFAULT_TAU;
      var k = 1 - Math.exp(-dt / tau);
      currentX += (targetX - currentX) * k;
      currentY += (targetY - currentY) * k;
      setVarsFromXY(currentX, currentY);

      var stillFar = Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05;
      if (stillFar || document.hasFocus()) {
        rafId = requestAnimationFrame(step);
      } else {
        running = false;
        lastTs = 0;
        rafId = null;
      }
    }

    function start() {
      if (running) return;
      running = true;
      lastTs = 0;
      rafId = requestAnimationFrame(step);
    }

    return {
      setImmediate: function (x, y) {
        currentX = x; currentY = y;
        setVarsFromXY(x, y);
      },
      setTarget: function (x, y) {
        targetX = x; targetY = y;
        start();
      },
      toCenter: function () {
        this.setTarget(shellEl.clientWidth / 2, shellEl.clientHeight / 2);
      },
      beginInitial: function (ms) {
        initialUntil = performance.now() + ms;
        start();
      },
      getCurrent: function () {
        return { x: currentX, y: currentY, tx: targetX, ty: targetY };
      },
      cancel: function () {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null; running = false; lastTs = 0;
      }
    };
  }

  function initCard(wrap) {
    var shell = wrap.querySelector('.pc-card-shell');
    if (!shell) return;

    var engine = createTiltEngine(wrap, shell);
    var enterTimer = null;
    var leaveRaf = null;

    function getOffsets(evt) {
      var rect = shell.getBoundingClientRect();
      return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
    }

    shell.addEventListener('pointerenter', function (e) {
      shell.classList.add('active');
      shell.classList.add('entering');
      if (enterTimer) clearTimeout(enterTimer);
      enterTimer = setTimeout(function () {
        shell.classList.remove('entering');
      }, ANIMATION_CONFIG.ENTER_TRANSITION_MS);
      var pos = getOffsets(e);
      engine.setTarget(pos.x, pos.y);
    });

    shell.addEventListener('pointermove', function (e) {
      var pos = getOffsets(e);
      engine.setTarget(pos.x, pos.y);
    });

    shell.addEventListener('pointerleave', function () {
      engine.toCenter();
      function checkSettle() {
        var cur = engine.getCurrent();
        if (Math.hypot(cur.tx - cur.x, cur.ty - cur.y) < 0.6) {
          shell.classList.remove('active');
          leaveRaf = null;
        } else {
          leaveRaf = requestAnimationFrame(checkSettle);
        }
      }
      if (leaveRaf) cancelAnimationFrame(leaveRaf);
      leaveRaf = requestAnimationFrame(checkSettle);
    });

    var initialX = (shell.clientWidth || 0) - ANIMATION_CONFIG.INITIAL_X_OFFSET;
    var initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;
    engine.setImmediate(initialX, initialY);
    engine.toCenter();
    engine.beginInitial(ANIMATION_CONFIG.INITIAL_DURATION);
  }

  function init() {
    var cards = document.querySelectorAll('.pc-card-wrapper[data-pc-tilt="true"]');
    for (var i = 0; i < cards.length; i++) {
      initCard(cards[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
