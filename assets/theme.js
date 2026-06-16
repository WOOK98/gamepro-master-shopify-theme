/**
 * GamePro Master - Theme JavaScript
 * Handles animations, interactions, and shopify section events.
 */

(function () {
  'use strict';

  // ============================================================
  // 1. Scroll-triggered reveal animations
  // ============================================================
  function initRevealAnimations() {
    var reveals = document.querySelectorAll('.reveal:not(.observed)');
    if (!reveals.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.classList.add('observed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    reveals.forEach(function (el) { observer.observe(el); });
  }

  // ============================================================
  // 2. Navbar scroll behavior
  // ============================================================
  function initNavbarScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var lastScroll = 0;
    var scrollThreshold = 80;

    window.addEventListener('scroll', function () {
      var currentScroll = window.pageYOffset;

      if (currentScroll > scrollThreshold) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }

      lastScroll = currentScroll;
    });
  }

  // ============================================================
  // 3. Mobile menu toggle
  // ============================================================
  function initMobileMenu() {
    var toggleBtn = document.querySelector('.mobile-menu-toggle');
    var menu = document.querySelector('.mobile-menu');
    var body = document.body;

    if (!toggleBtn || !menu) return;

    toggleBtn.addEventListener('click', function () {
      var isOpen = menu.classList.contains('active');
      if (isOpen) {
        menu.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
        body.classList.remove('menu-open');
      } else {
        menu.classList.add('active');
        toggleBtn.setAttribute('aria-expanded', 'true');
        body.classList.add('menu-open');
      }
    });

    // Close menu on link click
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
        body.classList.remove('menu-open');
      });
    });
  }

  // ============================================================
  // 4. Color variant selector (featured product)
  // ============================================================
  function initColorSelector() {
    var colorOptions = document.querySelectorAll('.color-option');
    var previewImage = document.querySelector('.variant-preview-image');

    colorOptions.forEach(function (option) {
      option.addEventListener('click', function () {
        // Update active state
        colorOptions.forEach(function (opt) { opt.classList.remove('active'); });
        option.classList.add('active');

        // Update preview image if available
        var variantImage = option.getAttribute('data-variant-image');
        if (variantImage && previewImage) {
          previewImage.src = variantImage;
        }

        // Update hidden variant select
        var variantId = option.getAttribute('data-variant-id');
        var variantInput = document.querySelector('input[name="id"]');
        if (variantInput && variantId) {
          variantInput.value = variantId;
        }
      });
    });
  }

  // ============================================================
  // 5. Quick add to cart (product cards)
  // ============================================================
  function initQuickAdd() {
    if (document.documentElement.dataset.quickAddReady) return;
    document.documentElement.dataset.quickAddReady = 'true';

    document.addEventListener('click', function (event) {
      var btn = event.target.closest('.quick-add-btn');
      if (!btn) return;

      event.preventDefault();
      var variantId = btn.getAttribute('data-variant-id');
      if (!variantId) return;

      btn.classList.add('loading');

      fetch((window.Shopify?.routes?.root || '/') + 'cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: 1 })
      })
        .then(function (res) { return res.json(); })
        .then(function () {
          btn.classList.remove('loading');
          btn.classList.add('added');
          setTimeout(function () { btn.classList.remove('added'); }, 1500);
          // Dispatch cart update event
          document.dispatchEvent(new CustomEvent('cart:updated'));
        })
        .catch(function (err) {
          console.error('Add to cart failed:', err);
          btn.classList.remove('loading');
        });
    });
  }

  // ============================================================
  // 6. Cart drawer
  // ============================================================
  function initCartDrawer() {
    var drawer = document.querySelector('.cart-drawer');
    var overlay = document.querySelector('.cart-drawer-overlay');
    var openBtns = document.querySelectorAll('.cart-toggle');
    var closeBtn = document.querySelector('.cart-drawer-close');
    var body = document.body;

    if (!drawer || !overlay) return;

    function openDrawer() {
      drawer.classList.add('active');
      overlay.classList.add('active');
      body.classList.add('drawer-open');
    }

    function closeDrawer() {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      body.classList.remove('drawer-open');
    }

    openBtns.forEach(function (btn) { btn.addEventListener('click', openDrawer); });
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    // Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('active')) closeDrawer();
    });
  }

  // ============================================================
  // 7. Platform grid hover effects
  // ============================================================
  function initPlatformGrid() {
    var cards = document.querySelectorAll('.platform-card');
    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        cards.forEach(function (c) {
          if (c !== card) c.style.opacity = '0.5';
        });
      });
      card.addEventListener('mouseleave', function () {
        cards.forEach(function (c) { c.style.opacity = '1'; });
      });
    });
  }

  // ============================================================
  // 8. Collection sort/filter (client-side quick actions)
  // ============================================================
  function initCollectionFilters() {
    var sortSelect = document.querySelector('.collection-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        var url = new URL(window.location.href);
        url.searchParams.set('sort_by', sortSelect.value);
        window.location.href = url.toString();
      });
    }
  }

  // ============================================================
  // 9. Smooth scroll for anchor links
  // ============================================================
  function initSmoothScroll() {
    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[href^="#"]');
      if (!link) return;
      var targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;
      var target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();
      var headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  }

  // ============================================================
  // 10. Discount popup
  // ============================================================
  function initDiscountPopup() {
    if (document.documentElement.dataset.discountPopupReady) return;
    document.documentElement.dataset.discountPopupReady = 'true';

    var modal = document.querySelector('[data-discount-modal]');
    if (!modal) return;

    var copyButton = modal.querySelector('[data-discount-copy]');
    var emailInput = modal.querySelector('.concept-discount-input');

    function openModal() {
      modal.hidden = false;
      document.body.classList.add('discount-modal-open');
      if (copyButton) {
        copyButton.focus();
      } else if (emailInput) {
        emailInput.focus();
      }
    }

    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove('discount-modal-open');
    }

    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-discount-trigger]');
      if (trigger) {
        event.preventDefault();
        openModal();
        return;
      }

      if (event.target.closest('[data-discount-close]')) {
        event.preventDefault();
        closeModal();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });

    if (copyButton) {
      copyButton.addEventListener('click', function () {
        var code = copyButton.getAttribute('data-code');
        if (!code) return;

        function markCopied() {
          copyButton.classList.add('is-copied');
          var label = copyButton.querySelector('small');
          if (label) label.textContent = 'Copied';
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(markCopied).catch(markCopied);
        } else {
          markCopied();
        }
      });
    }

    if (window.location.hash === '#discount-code') openModal();
  }

  // ============================================================
  // 11. Hide floating rail near footer
  // ============================================================
  function initSocialRailVisibility() {
    if (document.documentElement.dataset.socialRailVisibilityReady) return;
    document.documentElement.dataset.socialRailVisibilityReady = 'true';

    var rail = document.querySelector('.concept-social-rail');
    var footer = document.querySelector('[data-hide-social-rail]');
    if (!rail || !footer || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        rail.classList.toggle('is-hidden-near-footer', entry.isIntersecting);
      });
    }, { rootMargin: '0px 0px -20% 0px' });

    observer.observe(footer);
  }

  // ============================================================
  // 12. Shopify section load/unload
  // ============================================================
  document.addEventListener('shopify:section:load', function () {
    initAll();
  });

  document.addEventListener('shopify:section:unload', function () {
    // Cleanup if needed
  });

  document.addEventListener('shopify:section:select', function () {
    // Highlight selected section in editor
  });

  document.addEventListener('shopify:section:deselect', function () {
    // Remove highlight
  });

  // ============================================================
  // Init all
  // ============================================================
  function initAll() {
    initRevealAnimations();
    initNavbarScroll();
    initMobileMenu();
    initColorSelector();
    initQuickAdd();
    initCartDrawer();
    initPlatformGrid();
    initCollectionFilters();
    initSmoothScroll();
    initDiscountPopup();
    initSocialRailVisibility();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Re-check reveals on lazy image loads
  window.addEventListener('load', initRevealAnimations);

})();
