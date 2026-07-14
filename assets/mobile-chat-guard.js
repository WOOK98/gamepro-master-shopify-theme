(() => {
  const MOBILE_QUERY = '(max-width: 749px)';
  const CHAT_SELECTORS = [
    '#ShopifyChat',
    'iframe#ShopifyChat',
    'iframe#dummy-chat-button-iframe',
    'iframe[name="dummy-chat-button-iframe"]',
    'iframe[name*="chat" i]',
    'iframe[name*="inbox" i]',
    'iframe[title*="Shopify Inbox" i]',
    'iframe[title*="chat" i]',
    'iframe[title*="inbox" i]',
    'iframe[src*="shopifychat" i]',
    'iframe[src*="shopify-chat" i]',
    'iframe[src*="shopifyinbox" i]',
    'iframe[src*="inbox" i]',
    '[id*="ShopifyChat" i]',
    '[id*="shopify-chat" i]',
    '[class*="shopify-chat" i]',
    '[class*="shopify-inbox" i]',
  ];

  const media = window.matchMedia(MOBILE_QUERY);
  let closeButton;
  let refreshTimer;

  const safeQuery = (selector) => {
    try {
      return Array.from(document.querySelectorAll(selector));
    } catch (_error) {
      return [];
    }
  };

  const unique = (items) => Array.from(new Set(items));

  const textValue = (value) => (typeof value === 'string' ? value : '');

  const getDescriptor = (element) =>
    [
      element.id,
      element.className,
      element.getAttribute('title'),
      element.getAttribute('name'),
      element.getAttribute('src'),
      element.getAttribute('aria-label'),
    ]
      .map(textValue)
      .join(' ')
      .toLowerCase();

  const getAllCandidates = () => unique(CHAT_SELECTORS.flatMap(safeQuery)).filter((element) => element !== closeButton);

  const getCandidates = () =>
    getAllCandidates().filter(
      (element) =>
        !element.hasAttribute('data-mig-chat-hidden') &&
        !element.hasAttribute('data-mig-mobile-chat-disabled')
    );

  const isVisible = (element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  };

  const isLauncher = (element) => {
    const rect = element.getBoundingClientRect();
    const descriptor = getDescriptor(element);
    const looksLikeButton =
      descriptor.includes('button') || descriptor.includes('launcher') || descriptor.includes('dummy-chat-button');

    return (
      rect.width <= 190 &&
      rect.height <= 190 &&
      (looksLikeButton || rect.height <= 120 || Math.abs(rect.width - rect.height) <= 18)
    );
  };

  const isOpenPanel = (element) => {
    if (!isVisible(element) || isLauncher(element)) return false;

    const rect = element.getBoundingClientRect();
    const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    const descriptor = getDescriptor(element);
    const inboxLike = descriptor.includes('chat') || descriptor.includes('inbox') || descriptor.includes('shopify');
    const tallPanel =
      rect.height >= Math.min(360, viewportHeight * 0.55) && rect.width >= Math.min(280, viewportWidth * 0.55);
    const widePanel = rect.width >= viewportWidth * 0.66 && rect.height >= 260;
    const sideDrawer = rect.right >= viewportWidth - 24 && rect.height >= viewportHeight * 0.5;

    return inboxLike && (tallPanel || widePanel || sideDrawer);
  };

  const ensureButton = () => {
    if (closeButton) return closeButton;

    closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'mig-mobile-chat-close';
    closeButton.setAttribute('aria-label', 'Close chat');
    closeButton.setAttribute('title', 'Close chat');
    closeButton.hidden = true;
    closeButton.textContent = '×';
    closeButton.addEventListener('click', closeChat);
    document.body.appendChild(closeButton);

    return closeButton;
  };

  const positionCloseButton = (panel) => {
    const button = ensureButton();

    if (!panel) {
      button.style.removeProperty('--mig-chat-close-top');
      button.style.removeProperty('--mig-chat-close-right');
      return;
    }

    const rect = panel.getBoundingClientRect();
    const top = Math.max(8, Math.min(rect.top + 10, window.innerHeight - 58));
    const right = Math.max(8, window.innerWidth - rect.right + 10);

    button.style.setProperty('--mig-chat-close-top', `${top}px`);
    button.style.setProperty('--mig-chat-close-right', `${right}px`);
  };

  const restorePageScroll = () => {
    if (!document.body) return;

    document.documentElement.classList.remove('mig-mobile-chat-open');
    document.body.classList.remove('mig-mobile-chat-open');

    ['overflow', 'position', 'height', 'width', 'top', 'touch-action'].forEach((property) => {
      document.documentElement.style.removeProperty(property);
      document.body.style.removeProperty(property);
    });
  };

  const setOpenState = (open, panel) => {
    const button = ensureButton();
    button.hidden = !open;
    button.classList.toggle('mig-mobile-chat-close--visible', open);
    positionCloseButton(open ? panel : null);

    if (open) {
      document.documentElement.classList.add('mig-mobile-chat-open');
      document.body.classList.add('mig-mobile-chat-open');
    } else {
      restorePageScroll();
    }
  };

  const shouldPositionLauncher = () =>
    media.matches || (document.documentElement.clientWidth || window.innerWidth) <= 749;

  const positionLauncher = (element) => {
    if (!isVisible(element) || !isLauncher(element)) return;

    const hasDirectoryFooter = Boolean(document.querySelector('.mig-directory__footer'));
    const bottom = hasDirectoryFooter
      ? 'calc(12rem + env(safe-area-inset-bottom))'
      : 'calc(5.5rem + env(safe-area-inset-bottom))';

    element.style.setProperty('right', '1rem', 'important');
    element.style.setProperty('bottom', bottom, 'important');
    element.style.setProperty('z-index', '42', 'important');
  };

  function refresh() {
    if (!document.body) return;

    ensureButton();

    if (shouldPositionLauncher()) {
      hideMobileChat();
      return;
    }

    restoreDesktopChat();

    const candidates = getCandidates();
    const openPanels = candidates.filter(isOpenPanel);
    setOpenState(openPanels.length > 0, openPanels[0]);
  }

  const callIfFunction = (object, method) => {
    if (object && typeof object[method] === 'function') {
      object[method]();
    }
  };

  const requestNativeClose = () => {
    try {
      callIfFunction(window.ShopifyChat, 'close');
    } catch (_error) {
      // Shopify Inbox is optional and may not expose a public close API.
    }

    try {
      callIfFunction(window.ShopifyInbox, 'close');
    } catch (_error) {
      // Some storefronts expose a different Inbox namespace.
    }

    try {
      if (window.Shopify && window.Shopify.Inbox) {
        callIfFunction(window.Shopify.Inbox, 'close');
      }
    } catch (_error) {
      // Keep the fallback path active if the namespace is unavailable.
    }

    safeQuery('iframe').forEach((iframe) => {
      try {
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'shopify-chat:close' }, '*');
          iframe.contentWindow.postMessage({ type: 'shopify-inbox:close' }, '*');
        }
      } catch (_error) {
        // Cross-origin iframe messaging can fail in some preview contexts.
      }
    });
  };

  function hideElement(element) {
    element.setAttribute('data-mig-mobile-chat-disabled', 'true');
    element.style.setProperty('display', 'none', 'important');
    element.style.setProperty('visibility', 'hidden', 'important');
    element.style.setProperty('pointer-events', 'none', 'important');
    element.style.setProperty('opacity', '0', 'important');
  }

  function showElement(element) {
    if (!element.hasAttribute('data-mig-mobile-chat-disabled')) return;

    element.removeAttribute('data-mig-mobile-chat-disabled');
    element.style.removeProperty('display');
    element.style.removeProperty('visibility');
    element.style.removeProperty('pointer-events');
    element.style.removeProperty('opacity');
  }

  function hideMobileChat() {
    const targets = getAllCandidates();

    if (targets.length > 0) {
      requestNativeClose();
    }

    targets.forEach(hideElement);

    if (closeButton) {
      closeButton.hidden = true;
      closeButton.classList.remove('mig-mobile-chat-close--visible');
    }

    restorePageScroll();
  }

  function restoreDesktopChat() {
    safeQuery('[data-mig-mobile-chat-disabled="true"]').forEach(showElement);
  }

  function closeChat() {
    requestNativeClose();

    window.setTimeout(() => {
      const candidates = getCandidates();
      const openPanels = candidates.filter(isOpenPanel);
      const targets = openPanels.length ? openPanels : candidates.filter((element) => !isLauncher(element));

      targets.forEach((element) => {
        element.setAttribute('data-mig-chat-hidden', 'true');
        element.style.setProperty('display', 'none', 'important');
        element.style.setProperty('visibility', 'hidden', 'important');
        element.style.setProperty('pointer-events', 'none', 'important');
        element.style.setProperty('opacity', '0', 'important');
      });

      setOpenState(false);
      window.setTimeout(refresh, 250);
    }, 120);
  }

  const scheduleRefresh = () => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(refresh, 80);
  };

  const init = () => {
    if (!document.body) return;

    ensureButton();
    refresh();

    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['aria-hidden', 'class', 'id', 'style'],
      childList: true,
      subtree: true,
    });

    if (media.addEventListener) {
      media.addEventListener('change', refresh);
    } else {
      media.addListener(refresh);
    }

    window.addEventListener('resize', scheduleRefresh, { passive: true });
    window.addEventListener('orientationchange', scheduleRefresh, { passive: true });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && closeButton && !closeButton.hidden) {
        closeChat();
      }
    });

    window.setInterval(refresh, 1200);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
