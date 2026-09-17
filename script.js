(() => {
      "use strict";

      const body = document.body;
      const header = document.getElementById("site-header");
      const menuToggle = document.querySelector(".menu-toggle");
      const mobileMenu = document.getElementById("mobile-menu");
      const mobilePanel = mobileMenu.querySelector(".mobile-menu-panel");
      const mobileLinks = mobileMenu.querySelectorAll("a[href^='#']");
      const navLinks = document.querySelectorAll(".nav-link");
      const backToTop = document.getElementById("back-to-top");
      const currentYear = document.getElementById("current-year");

      currentYear.textContent = new Date().getFullYear();

      const syncMobileMenuTop = () => {
        const headerBottom = Math.max(0, Math.round(header.getBoundingClientRect().bottom));
        mobileMenu.style.setProperty("--mobile-menu-top", `${headerBottom}px`);
      };

      const setMenuState = (open) => {
        if (open) syncMobileMenuTop();
        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
        mobileMenu.setAttribute("aria-hidden", String(!open));
        mobileMenu.classList.toggle("is-open", open);
        body.classList.toggle("menu-open", open);
        if (open) {
          window.setTimeout(() => mobileMenu.querySelector(".mobile-menu-link")?.focus(), 220);
        }
      };

      menuToggle.addEventListener("click", () => {
        setMenuState(menuToggle.getAttribute("aria-expanded") !== "true");
      });

      mobileMenu.addEventListener("click", (event) => {
        if (!mobilePanel.contains(event.target)) setMenuState(false);
      });

      mobileLinks.forEach((link) => link.addEventListener("click", () => setMenuState(false)));

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
          setMenuState(false);
          menuToggle.focus();
        }
      });

      const handleScroll = () => {
        const y = window.scrollY;
        header.classList.toggle("is-scrolled", y > 18);
        if (backToTop) backToTop.classList.toggle("is-visible", y > 620);
      };

      window.addEventListener("scroll", () => {
        handleScroll();
        if (menuToggle.getAttribute("aria-expanded") === "true") syncMobileMenuTop();
      }, { passive: true });
      window.addEventListener("resize", syncMobileMenuTop, { passive: true });
      handleScroll();

      if (backToTop) backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

      const observedSections = [...document.querySelectorAll("main section[id]")].filter((section) =>
        ["home", "services", "gallery", "why-us", "contact"].includes(section.id)
      );

      const sectionObserver = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`));
      }, { rootMargin: "-25% 0px -60% 0px", threshold: [0.05, 0.2, 0.5] });

      observedSections.forEach((section) => sectionObserver.observe(section));

      // The skip link is left to the browser, which moves focus to #main-content (tabindex="-1").
      document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
          const selector = anchor.getAttribute("href");
          if (!selector || selector === "#") return;
          const target = document.querySelector(selector);
          if (!target) return;
          event.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          if (history.pushState) history.pushState(null, "", selector);
        });
      });

      const filterButtons = document.querySelectorAll(".filter-btn");
      const galleryItems = document.querySelectorAll(".gallery-item");

      filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const filter = button.dataset.filter;
          filterButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
          galleryItems.forEach((item) => {
            const categories = item.dataset.category.split(" ");
            const show = filter === "all" || categories.includes(filter);
            item.classList.toggle("is-hidden", !show);
          });
        });
      });

      const lightbox = document.getElementById("lightbox");
      if (lightbox) {
        const BLANK_PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        const lightboxDialog = lightbox.querySelector(".lightbox-dialog");
        const lightboxClose = lightbox.querySelector(".lightbox-close");
        const lightboxImage = document.getElementById("lightbox-image");
        const lightboxTitle = document.getElementById("lightbox-title");
        const lightboxLabel = document.getElementById("lightbox-label");
        let lastFocusedGalleryItem = null;

        const closeLightbox = () => {
          lightbox.classList.remove("is-open");
          lightbox.setAttribute("aria-hidden", "true");
          body.classList.remove("lightbox-open");
          lightboxImage.src = BLANK_PIXEL;
          lastFocusedGalleryItem?.focus();
        };

        galleryItems.forEach((item) => {
          item.addEventListener("click", () => {
            const image = item.querySelector("img");
            lastFocusedGalleryItem = item;
            // Tiles pick a small srcset candidate; the lightbox always wants the full file.
            lightboxImage.src = image.dataset.full || image.currentSrc || image.src;
            lightboxImage.alt = image.alt;
            lightboxTitle.textContent = item.dataset.title;
            lightboxLabel.textContent = item.dataset.label;
            lightbox.classList.add("is-open");
            lightbox.setAttribute("aria-hidden", "false");
            body.classList.add("lightbox-open");
            window.setTimeout(() => lightboxClose.focus(), 120);
          });
        });

        lightboxClose.addEventListener("click", closeLightbox);
        lightbox.addEventListener("click", (event) => {
          if (!lightboxDialog.contains(event.target)) closeLightbox();
        });

        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
        });
      }

      document.querySelectorAll(".faq-question").forEach((question) => {
        question.addEventListener("click", () => {
          const item = question.closest(".faq-item");
          const isOpen = item.classList.contains("is-open");
          document.querySelectorAll(".faq-item").forEach((faq) => {
            faq.classList.remove("is-open");
            faq.querySelector(".faq-question").setAttribute("aria-expanded", "false");
          });
          if (!isOpen) {
            item.classList.add("is-open");
            question.setAttribute("aria-expanded", "true");
          }
        });
      });

      const serviceSelect = document.getElementById("service");
      const projectMessage = document.getElementById("message");
      document.querySelectorAll(".service-quote").forEach((button) => {
        button.addEventListener("click", () => {
          serviceSelect.value = button.dataset.service;
          document.getElementById("contact").scrollIntoView({ behavior: "smooth", block: "start" });
          window.setTimeout(() => projectMessage.focus({ preventScroll: true }), 620);
        });
      });
    })();

/* ---- article and privacy viewer ---- */

(function () {
  "use strict";
  const files = {"privacy-policy":"privacy-policy.html","terms-of-use":"terms-of-use.html"};
  const viewer = document.getElementById("navo-inline-viewer");
  const frame = document.getElementById("navo-inline-viewer-frame");
  const closeButton = document.getElementById("navo-inline-viewer-close");
  if (!viewer || !frame || !closeButton) return;

  let previousHash = "";
  let lastFocus = null;

  function findSlugFromHref(href) {
    const cleanHref = (href || "").split("?")[0].split("#")[0];
    return Object.keys(files).find(function (slug) {
      const filename = files[slug];
      return cleanHref === filename || cleanHref.endsWith("/" + filename);
    }) || "";
  }

  function goToLandingSection(hash) {
    closeViewer(false);
    window.setTimeout(function () {
      const target = document.querySelector(hash);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", hash);
    }, 40);
  }

  function prepareFrame() {
    const doc = frame.contentDocument;
    if (!doc || !doc.body) return;

    if (!doc.getElementById("navo-return-to-landing")) {
      const floatingBack = doc.createElement("button");
      floatingBack.id = "navo-return-to-landing";
      floatingBack.type = "button";
      floatingBack.textContent = "← Back to Landing Page";
      floatingBack.setAttribute("aria-label", "Return to the Navo Builders landing page");
      floatingBack.style.cssText = [
        "position:fixed", "z-index:2147483000", "right:14px", "bottom:14px",
        "min-height:46px", "padding:12px 17px", "border:0", "border-radius:999px",
        "color:#fff", "background:#ef3e42", "box-shadow:0 14px 34px rgba(0,31,55,.30)",
        "font:800 12px/1 Montserrat,Arial,sans-serif", "cursor:pointer"
      ].join(";");
      floatingBack.addEventListener("click", function () { closeViewer(); });
      doc.body.appendChild(floatingBack);
    }

    doc.addEventListener("click", function (event) {
      const link = event.target.closest("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") || "";

      if (href.startsWith("#")) {
        event.preventDefault();
        const targetId = decodeURIComponent(href.slice(1));
        const target = targetId ? doc.getElementById(targetId) : doc.documentElement;
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      const relatedSlug = findSlugFromHref(href);
      if (relatedSlug) {
        event.preventDefault();
        openViewer(relatedSlug, false);
        return;
      }

      const landingMatch = href.match(/^(?:\.\.\/)?index\.html(#[A-Za-z0-9_-]+)$/i);
      if (landingMatch) {
        event.preventDefault();
        goToLandingSection(landingMatch[1]);
      }
    }, true);
  }

  function openViewer(slug, pushHistory) {
    if (!files[slug]) return false;
    lastFocus = document.activeElement;
    if (!viewer.classList.contains("is-open")) previousHash = window.location.hash;

    frame.onload = prepareFrame;
    frame.src = "pages/" + files[slug];
    viewer.classList.add("is-open");
    viewer.setAttribute("aria-hidden", "false");
    document.body.classList.add("navo-inline-viewer-open");

    const nextHash = "#article/" + slug;
    if (pushHistory !== false) window.history.pushState({ navoInlinePage: slug }, "", nextHash);
    else window.history.replaceState({ navoInlinePage: slug }, "", nextHash);

    closeButton.focus();
    return false;
  }

  function closeViewer(updateHistory) {
    if (!viewer.classList.contains("is-open")) return;
    viewer.classList.remove("is-open");
    viewer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("navo-inline-viewer-open");
    frame.src = "about:blank";
    if (updateHistory !== false) window.history.replaceState(null, "", previousHash || "#blog");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  document.addEventListener("click", function (event) {
    const trigger = event.target.closest("[data-embedded-blog]");
    if (!trigger) return;
    const slug = trigger.getAttribute("data-embedded-blog");
    if (!files[slug]) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openViewer(slug, true);
  }, true);

  document.addEventListener("keydown", function (event) {
    const trigger = event.target.closest("[data-embedded-blog]");
    if (trigger && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      openViewer(trigger.getAttribute("data-embedded-blog"), true);
      return;
    }
    if (event.key === "Escape" && viewer.classList.contains("is-open")) closeViewer();
  }, true);

  closeButton.addEventListener("click", function () { closeViewer(); });
  window.addEventListener("popstate", function () {
    if (viewer.classList.contains("is-open") && !window.location.hash.startsWith("#article/")) closeViewer(false);
  });

  const initialMatch = window.location.hash.match(/^#article\/(.+)$/);
  if (initialMatch && files[initialMatch[1]]) window.setTimeout(function () { openViewer(initialMatch[1], false); }, 0);

  window.NavoInlineViewer = { open: function (slug) { return openViewer(slug, true); }, close: closeViewer };
})();

/* ---- service detail modal ---- */

(function () {
  "use strict";

  const modal = document.getElementById("service-detail-modal");
  const content = document.getElementById("service-modal-content");
  const closeControls = modal
    ? modal.querySelectorAll("[data-close-service-modal]")
    : [];

  let lastFocusedElement = null;
  let currentService = "";

  if (!modal || !content) return;

  function getFocusableElements() {
    return Array.from(
      modal.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (element) {
      return !element.hasAttribute("hidden");
    });
  }

  function openService(serviceId) {
    const template = document.getElementById("template-" + serviceId);

    if (!template) return;

    lastFocusedElement = document.activeElement;
    currentService = serviceId;
    content.replaceChildren(template.content.cloneNode(true));

    const title = content.querySelector(".service-detail__header h3");
    if (title) {
      title.id = "service-modal-title";
      modal.setAttribute("aria-labelledby", "service-modal-title");
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("service-modal-open");

    window.history.replaceState(
      null,
      "",
      "#details-" + serviceId.replace("service-", "")
    );

    const closeButton = modal.querySelector(".service-modal__close");
    if (closeButton) closeButton.focus();
  }

  function closeService(options) {
    const settings = options || {};

    if (!modal.classList.contains("is-open")) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("service-modal-open");
    content.replaceChildren();

    if (!settings.keepHash) {
      window.history.replaceState(null, "", "#services");
    }

    if (
      !settings.skipFocus &&
      lastFocusedElement &&
      typeof lastFocusedElement.focus === "function"
    ) {
      lastFocusedElement.focus();
    }

    currentService = "";
  }

  document.addEventListener("click", function (event) {
    const trigger = event.target.closest("[data-open-service]");

    if (trigger) {
      event.preventDefault();
      event.stopPropagation();
      openService(trigger.getAttribute("data-open-service"));
      return;
    }

    const contactLink = event.target.closest(
      "#service-detail-modal a[href='#contact']"
    );

    if (contactLink) {
      event.preventDefault();
      closeService({ keepHash: true, skipFocus: true });

      window.setTimeout(function () {
        const contact = document.getElementById("contact");

        if (contact) {
          contact.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
          window.history.replaceState(null, "", "#contact");
        }
      }, 60);
    }
  }, true);

  document.addEventListener("keydown", function (event) {
    const card = event.target.closest(
      ".service-preview-card[data-open-service]"
    );

    if (
      card &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      openService(card.getAttribute("data-open-service"));
      return;
    }

    if (
      event.key === "Escape" &&
      modal.classList.contains("is-open")
    ) {
      closeService();
      return;
    }

    if (
      event.key === "Tab" &&
      modal.classList.contains("is-open")
    ) {
      const focusable = getFocusableElements();

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }
  }, true);

  closeControls.forEach(function (control) {
    control.addEventListener("click", function () {
      closeService();
    });
  });

  window.addEventListener("popstate", function () {
    if (
      modal.classList.contains("is-open") &&
      !window.location.hash.startsWith("#details-")
    ) {
      closeService({ keepHash: true });
    }
  });

  window.NavoServiceModal = {
    open: openService,
    close: closeService
  };
})();



/* ---- customer reviews carousel ---- */

(function () {
  "use strict";

  const root = document.querySelector(".review-carousel");
  if (!root) return;

  const viewport = root.querySelector(".review-carousel__viewport");
  const track = root.querySelector(".review-carousel__track");
  const slides = track ? Array.prototype.slice.call(track.querySelectorAll(".review-carousel__slide")) : [];
  if (!viewport || !track || !slides.length) return;

  const prevBtn = root.querySelector(".review-carousel__nav--prev");
  const nextBtn = root.querySelector(".review-carousel__nav--next");
  const dotsWrap = root.querySelector(".review-carousel__dots");
  const pauseBtn = root.querySelector(".review-carousel__pause");
  const counter = root.querySelector(".review-carousel__counter");
  const counterNow = root.querySelector(".review-carousel__counter-current");
  const counterTotal = root.querySelector(".review-carousel__counter-total");
  const section = root.closest("section");

  const AUTOPLAY_MS = 5000;
  const RESUME_MS = 5000;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  let timer = null;
  let resumeTimer = null;
  let programmaticUntil = 0;
  let pageCount = 1;
  let visible = 1;

  const blockers = { hover: false, focus: false, interact: false, hidden: false, offscreen: false };
  let userPaused = motionQuery.matches;

  /* ---- geometry ---- */

  function gapPx() {
    const cs = getComputedStyle(track);
    return parseFloat(cs.columnGap || cs.gap) || 0;
  }

  function stepPx() {
    return slides[0].getBoundingClientRect().width + gapPx();
  }

  function maxScroll() {
    return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  }

  function visibleCount() {
    const step = stepPx();
    if (!step) return 1;
    return Math.max(1, Math.min(slides.length, Math.round((viewport.clientWidth + gapPx()) / step)));
  }

  function scrollToLeft(left) {
    programmaticUntil = Date.now() + 900;
    viewport.scrollTo({ left: Math.max(0, Math.min(left, maxScroll())) });
  }

  function currentIndex() {
    const step = stepPx();
    return step ? Math.round(viewport.scrollLeft / step) : 0;
  }

  function atStart() { return viewport.scrollLeft <= 2; }

  function atEnd() { return viewport.scrollLeft >= maxScroll() - 2; }

  function goNext() {
    if (atEnd()) scrollToLeft(0);
    else scrollToLeft((currentIndex() + 1) * stepPx());
  }

  function goPrev() {
    if (atStart()) scrollToLeft(maxScroll());
    else scrollToLeft((currentIndex() - 1) * stepPx());
  }

  /* ---- dots ---- */

  function currentPage() {
    if (atEnd()) return pageCount - 1;
    const per = stepPx() * visible;
    return per ? Math.max(0, Math.min(pageCount - 1, Math.round(viewport.scrollLeft / per))) : 0;
  }

  function syncCounter() {
    if (!counterNow) return;
    const card = Math.max(1, Math.min(slides.length, currentIndex() + 1));
    const text = String(card);
    if (counterNow.textContent !== text) counterNow.textContent = text;
  }

  function syncDots() {
    syncCounter();
    if (!dotsWrap) return;
    const active = currentPage();
    Array.prototype.forEach.call(dotsWrap.children, function (dot, i) {
      const on = i === active;
      dot.classList.toggle("is-active", on);
      if (on) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  }

  function makeDotHandler(page) {
    return function () { scrollToLeft(page * visible * stepPx()); };
  }

  function buildDots() {
    if (!dotsWrap) return;
    visible = visibleCount();
    const next = Math.max(1, Math.ceil(slides.length / visible));
    if (next !== pageCount || dotsWrap.children.length !== next) {
      pageCount = next;
      dotsWrap.textContent = "";
      for (let i = 0; i < pageCount; i += 1) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "review-carousel__dot";
        dot.setAttribute("aria-label", "Go to reviews page " + (i + 1));
        dot.addEventListener("click", makeDotHandler(i));
        dotsWrap.appendChild(dot);
      }
    }
    syncDots();
  }

  /* ---- autoplay ---- */

  function isPaused() {
    return userPaused || blockers.hover || blockers.focus || blockers.interact ||
      blockers.hidden || blockers.offscreen;
  }

  function syncPauseButton() {
    if (!pauseBtn) return;
    pauseBtn.setAttribute("aria-pressed", String(userPaused));
    pauseBtn.setAttribute("aria-label", userPaused ? "Play review autoplay" : "Pause review autoplay");
  }

  function sync() {
    const running = !isPaused();
    if (timer) { window.clearInterval(timer); timer = null; }
    if (running) timer = window.setInterval(goNext, AUTOPLAY_MS);
    track.setAttribute("aria-live", running ? "off" : "polite");
    if (counter) counter.setAttribute("aria-live", running ? "off" : "polite");
    syncPauseButton();
  }

  function block(name, on) {
    if (blockers[name] === on) return;
    blockers[name] = on;
    sync();
  }

  function interacted() {
    block("interact", true);
    if (resumeTimer) window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(function () { block("interact", false); }, RESUME_MS);
  }

  /* ---- long reviews ---- */

  function updateFade(quote) {
    quote.classList.toggle("is-at-bottom", quote.scrollTop + quote.clientHeight >= quote.scrollHeight - 2);
  }

  function syncQuotes() {
    slides.forEach(function (slide) {
      const quote = slide.querySelector("blockquote");
      if (!quote) return;
      if (quote.scrollHeight > quote.clientHeight + 1) {
        const cite = slide.querySelector("cite");
        const name = cite && cite.firstChild ? cite.firstChild.textContent.trim() : "this customer";
        quote.setAttribute("tabindex", "0");
        quote.setAttribute("aria-label", "Review from " + name + ", scrollable");
        quote.classList.add("has-overflow");
        updateFade(quote);
      } else {
        quote.removeAttribute("tabindex");
        quote.removeAttribute("aria-label");
        quote.classList.remove("has-overflow", "is-at-bottom");
      }
    });
  }

  slides.forEach(function (slide) {
    const quote = slide.querySelector("blockquote");
    if (!quote) return;
    quote.addEventListener("scroll", function () {
      updateFade(quote);
      interacted();
    }, { passive: true });
  });

  /* ---- wiring ---- */

  if (prevBtn) prevBtn.addEventListener("click", function () { goPrev(); interacted(); });
  if (nextBtn) nextBtn.addEventListener("click", function () { goNext(); interacted(); });

  if (pauseBtn) {
    pauseBtn.addEventListener("click", function () {
      userPaused = !userPaused;
      sync();
    });
  }

  viewport.addEventListener("scroll", function () {
    syncDots();
    if (Date.now() > programmaticUntil) interacted();
  }, { passive: true });

  viewport.addEventListener("touchstart", interacted, { passive: true });

  viewport.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
      interacted();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
      interacted();
    }
  });

  root.addEventListener("mouseenter", function () { block("hover", true); });
  root.addEventListener("mouseleave", function () { block("hover", false); });
  root.addEventListener("focusin", function () { block("focus", true); });
  root.addEventListener("focusout", function (event) {
    if (!root.contains(event.relatedTarget)) block("focus", false);
  });

  document.addEventListener("visibilitychange", function () { block("hidden", document.hidden); });

  if (section && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { block("offscreen", !entry.isIntersecting); });
    }, { threshold: 0.2 }).observe(section);
  }

  function onMotionChange() {
    userPaused = motionQuery.matches;
    sync();
  }
  if (typeof motionQuery.addEventListener === "function") motionQuery.addEventListener("change", onMotionChange);
  else if (typeof motionQuery.addListener === "function") motionQuery.addListener(onMotionChange);

  let resizeTimer = null;
  window.addEventListener("resize", function () {
    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      buildDots();
      syncQuotes();
    }, 150);
  }, { passive: true });

  if (counterTotal) counterTotal.textContent = String(slides.length);
  buildDots();
  syncQuotes();
  sync();
})();
