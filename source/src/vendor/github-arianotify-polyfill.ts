// @ts-nocheck
/*
 * Vendored from github/arianotify-polyfill at commit
 * 15d720f075fbe12583e2cc0dab72956384e5c5ef and adapted only to guard
 * CSS.supports in non-browser test environments.
 *
 * MIT License
 * Copyright (c) 2024 GitHub
 * See THIRD_PARTY_NOTICES.md for the complete notice and source identity.
 */

const domAPIsAreAvailable =
  typeof globalThis.Element !== 'undefined' &&
  typeof globalThis.Document !== 'undefined';
const shouldBypassNativeAriaNotify =
  globalThis.__bypassNativeAriaNotify === true;

if (
  domAPIsAreAvailable &&
  (shouldBypassNativeAriaNotify ||
    !('ariaNotify' in Element.prototype) ||
    !('ariaNotify' in Document.prototype))
) {
  let uniqueId = `${Date.now()}`;
  try {
    uniqueId = crypto.randomUUID();
  } catch {
    // Date-based uniqueness is sufficient for the one-page fallback.
  }

  const passkey = Symbol();
  const politeLiveRegionCustomElementName = `polite-live-region-${uniqueId}`;
  const assertiveLiveRegionCustomElementName = `assertive-live-region-${uniqueId}`;

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  class Message {
    element;
    message;
    priority = 'normal';

    constructor({ element, message, priority = 'normal' }) {
      this.element = element;
      this.message = message;
      this.priority = priority;
    }

    #canAnnounce() {
      const supportsModalSelector =
        typeof globalThis.CSS !== 'undefined' &&
        typeof globalThis.CSS.supports === 'function' &&
        globalThis.CSS.supports('selector(:modal)');
      const modal = this.element.ownerDocument.querySelector(
        supportsModalSelector ? ':modal' : 'dialog[open]',
      );

      return (
        this.element.isConnected &&
        !this.element.closest('[inert]') &&
        (modal?.contains(this.element) ?? true)
      );
    }

    async announce() {
      if (!this.#canAnnounce()) return;

      let root =
        this.element.closest('dialog') ||
        this.element.closest("[role='dialog']") ||
        this.element.getRootNode();
      if (!root || root instanceof Document) root = document.body;

      const liveRegionCustomElementName =
        this.priority === 'high'
          ? assertiveLiveRegionCustomElementName
          : politeLiveRegionCustomElementName;
      let liveRegion = root.querySelector(liveRegionCustomElementName);

      if (!liveRegion) {
        liveRegion = document.createElement(liveRegionCustomElementName);
        root.append(liveRegion);
      }

      // The upstream production polyfill deliberately lets the accessibility
      // tree register the persistent region before mutating its message.
      await sleep(250);
      liveRegion.handleMessage(passkey, this.message);
    }
  }

  const queue = new (class MessageQueue {
    #queue = [];
    #currentMessage;

    enqueue(message) {
      if (message.priority === 'high') {
        const lastHighPriorityMessage = this.#queue.findLastIndex(
          (queuedMessage) => queuedMessage.priority === 'high',
        );
        this.#queue.splice(lastHighPriorityMessage + 1, 0, message);
      } else {
        this.#queue.push(message);
      }

      if (!this.#currentMessage) this.#processNext();
    }

    async #processNext() {
      this.#currentMessage = this.#queue.shift();
      if (!this.#currentMessage) return;
      await this.#currentMessage.announce();
      this.#currentMessage = null;
      this.#processNext();
    }
  })();

  class LiveRegionCustomElement extends HTMLElement {
    #shadowRoot = this.attachShadow({ mode: 'closed' });

    connectedCallback() {
      this.ariaAtomic = 'true';
      this.style.marginLeft = '-1px';
      this.style.marginTop = '-1px';
      this.style.position = 'absolute';
      this.style.width = '1px';
      this.style.height = '1px';
      this.style.overflow = 'hidden';
      this.style.clipPath = 'rect(0 0 0 0)';
      this.style.overflowWrap = 'normal';
    }

    handleMessage(key = null, message = '') {
      if (passkey !== key) return;
      // A repeated identical string may not produce a new live-region event.
      // A non-breaking space creates a DOM change without audible wording.
      if (this.#shadowRoot.textContent === message) message += '\u00A0';
      this.#shadowRoot.textContent = message;
    }
  }

  class PoliteLiveRegionCustomElement extends LiveRegionCustomElement {
    connectedCallback() {
      this.ariaLive = 'polite';
      super.connectedCallback();
    }
  }

  class AssertiveLiveRegionCustomElement extends LiveRegionCustomElement {
    connectedCallback() {
      this.ariaLive = 'assertive';
      super.connectedCallback();
    }
  }

  customElements.define(
    politeLiveRegionCustomElementName,
    PoliteLiveRegionCustomElement,
  );
  customElements.define(
    assertiveLiveRegionCustomElementName,
    AssertiveLiveRegionCustomElement,
  );

  const elementAriaNotify = function (
    message,
    { priority = 'normal' } = {},
  ) {
    queue.enqueue(new Message({ element: this, message, priority }));
  };

  if (shouldBypassNativeAriaNotify || !('ariaNotify' in Element.prototype)) {
    Object.defineProperty(Element.prototype, 'ariaNotify', {
      configurable: true,
      writable: true,
      value: elementAriaNotify,
    });
  }

  const documentAriaNotify = function (
    message,
    { priority = 'normal' } = {},
  ) {
    queue.enqueue(
      new Message({ element: this.documentElement, message, priority }),
    );
  };

  if (shouldBypassNativeAriaNotify || !('ariaNotify' in Document.prototype)) {
    Object.defineProperty(Document.prototype, 'ariaNotify', {
      configurable: true,
      writable: true,
      value: documentAriaNotify,
    });
  }
}

export {};
