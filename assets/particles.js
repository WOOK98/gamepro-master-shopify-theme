/**
 * GamePro Master - Canvas Particle Background
 * Renders an animated particle network on a <canvas> element.
 * Usage: Create a <canvas id="particle-canvas"> inside the hero section.
 */
(function () {
  'use strict';

  function initParticleBackground() {
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var particleCount = 80;
    var connectDistance = 150;
    var animationId;

    // Colors
    var primaryColor = { r: 8, g: 217, b: 214 }; // accent-cyan
    var secondaryColor = { r: 255, g: 46, b: 99 }; // accent-red
    var lineColor = 'rgba(8, 217, 214, 0.08)';

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.7 ? secondaryColor : primaryColor
      };
    }

    function initParticles() {
      particles.length = 0;
      var count = Math.floor((canvas.width * canvas.height) / 8000);
      count = Math.max(40, Math.min(count, 120));
      for (var i = 0; i < count; i++) {
        particles.push(createParticle());
      }
    }

    function drawParticle(p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ',0.6)';
      ctx.fill();

      // Glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ',0.08)';
      ctx.fill();
    }

    function drawLines(p1, p2) {
      var dx = p1.x - p2.x;
      var dy = p1.y - p2.y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < connectDistance) {
        var opacity = 1 - dist / connectDistance;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = 'rgba(8, 217, 214,' + (opacity * 0.12) + ')';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update & draw particles
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges with margin
        var margin = 30;
        if (p.x < margin || p.x > canvas.width - margin) p.vx *= -1;
        if (p.y < margin || p.y > canvas.height - margin) p.vy *= -1;

        // Clamp
        p.x = Math.max(margin, Math.min(canvas.width - margin, p.x));
        p.y = Math.max(margin, Math.min(canvas.height - margin, p.y));

        drawParticle(p);
      }

      // Draw connections
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          drawLines(particles[i], particles[j]);
        }
      }

      animationId = requestAnimationFrame(animate);
    }

    // Start
    resize();
    initParticles();
    animate();

    // Handle resize
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        initParticles();
      }, 200);
    });

    // Cleanup
    canvas.addEventListener('destroy', function () {
      if (animationId) cancelAnimationFrame(animationId);
    });
  }

  // Init when DOM ready or on section load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParticleBackground);
  } else {
    initParticleBackground();
  }

  document.addEventListener('shopify:section:load', initParticleBackground);

})();