//=============== Section Step Animations===============
$(function () {
  var $steps = $(".process-steps .step");
  if ($steps.length === 0) return;

  var total = $steps.length;
  var current = 1;
  var DELAY = 500;
  var LOGO_FADE_TIME = 550;
  var locked = false;
  var sectionLocked = false;
  var hasCompletedAnimation = false;
  var _lockScrollY = 0;
  function lockBody() {
    if (sectionLocked) return;
    sectionLocked = true;
    _lockScrollY = window.scrollY || window.pageYOffset;
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    $("body").css({
      position: "fixed",
      top: -_lockScrollY + "px",
      left: "0",
      right: "0",
      width: "100%",
      "padding-right": sbw ? sbw + "px" : "",
    });
  }
  function unlockBody() {
    if (!sectionLocked) return;
    sectionLocked = false;
    $("body").css({
      position: "",
      top: "",
      left: "",
      right: "",
      width: "",
      "padding-right": "",
    });
    window.scrollTo(0, _lockScrollY);
  }
  function $step(n) {
    return $steps.filter('[data-step="' + n + '"]');
  }
  function setCurrent($s) {
    $steps.removeClass("is-current");
    $s.addClass("is-current");
  }
  function showStep(n) {
    var $s = $step(n);
    var $logo = $s.find(".logo-svg");
    $s.addClass("is-visible");
    setCurrent($s);
    $logo.removeClass("hidden at-right").addClass("at-left").css({
      left: "0",
      transition: "none",
    });
    if ($logo[0]) {
      $logo[0].offsetHeight;
    }
    requestAnimationFrame(function () {
      $logo.css("transition", "");
    });
    setTimeout(function () {
      $s.addClass("active");
    }, DELAY);
  }
  function runLogo(n) {
    var $s = $step(n);
    var $logo = $s.find(".logo-svg");
    var $nextStep = $step(n + 1);
    var $nextLogo = $nextStep.find(".logo-svg");
    setCurrent($s);
    $logo.removeClass("hidden at-right").addClass("at-left").css({
      left: "0",
      transition: "none",
    });
    if (n + 1 <= total) {
      $nextLogo.removeClass("at-right").addClass("hidden at-left").css({
        left: "0",
        transition: "none",
      });
    }
    if ($logo[0]) {
      $logo[0].offsetHeight;
    }
    requestAnimationFrame(function () {
      $logo.css("transition", "").addClass("at-right").css("left", "100%");
    });
    setTimeout(function () {
      var next = n + 1;
      if (next <= total) {
        $nextLogo.removeClass("hidden").css("transition", "");
        showStep(next);
        setTimeout(function () {
          $logo.addClass("hidden");
        }, LOGO_FADE_TIME);
        current = next;
        locked = false;
      } else {
        $logo.addClass("hidden");
        locked = false;
        hasCompletedAnimation = true;
        unlockBody();
      }
    }, DELAY);
  }
  function init() {
    current = 1;
    locked = false;
    sectionLocked = false;
    hasCompletedAnimation = false;
    $steps.removeClass("is-visible active is-current");
    $steps.find(".logo-svg").removeClass("at-left at-right").addClass("hidden").css("left", "0");
    setTimeout(function () {
      showStep(1);
    }, 50);
  }
  function shouldLockSection() {
    var el = document.querySelector(".approach-section");
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.top <= 0 && r.bottom > 0;
  }
  function onWheel(e) {
    var dy = e.originalEvent ? e.originalEvent.deltaY : e.deltaY;
    if (!hasCompletedAnimation && shouldLockSection()) {
      lockBody();
      if (e.cancelable !== false) e.preventDefault();
      e.stopPropagation();
      if (dy > 0) {
        if (!locked && current < total) {
          locked = true;
          runLogo(current);
        } else if (!locked && current === total) {
          locked = true;
          setTimeout(function () {
            hasCompletedAnimation = true;
            locked = false;
            unlockBody();
          }, DELAY);
        }
      }
      return false;
    }
  }
  window.addEventListener("wheel", onWheel, { passive: false });
  init();
});

// ==========Service Card Sticky Effect===========//
$(function () {
  var $cards = $(".service-card");
  var $wrap = $(".service-cards-wrapper");

  if ($cards.length === 0 || $wrap.length === 0) {
    return;
  }

  var baseTop = 120;
  var offsetStep = 60;
  var coverRatio = 0.7;
  var wrapTop = 0;
  var cardHeight = 0;

  function measure() {
    var offset = $wrap.offset();
    if (!offset) return;

    wrapTop = offset.top;
    cardHeight = $cards.eq(0).outerHeight();
  }

  function applyStickyTops() {
    $cards.each(function (index) {
      $(this).css("top", baseTop + index * offsetStep + "px");
    });
  }

  function shouldCollapseNormal(i, scrollTop) {
    var totalCards = $cards.length;
    if (i >= totalCards - 1) return false;
    var nextStickyTop = baseTop + (i + 1) * offsetStep;
    var collapsePoint = wrapTop + cardHeight * (i + coverRatio) - nextStickyTop;
    return scrollTop >= collapsePoint;
  }

  function shouldCollapsePenultimate(i) {
    var totalCards = $cards.length;
    if (i !== totalCards - 2) return false;
    var prevStickyTop = baseTop + i * offsetStep;
    var thresholdTop = prevStickyTop + (1 - coverRatio) * cardHeight;
    var nextEl = $cards.get(i + 1);
    if (!nextEl) return false;
    var nextTop = nextEl.getBoundingClientRect().top;
    return nextTop <= thresholdTop;
  }

  function updateCollapsed() {
    var scrollTop = $(window).scrollTop();
    var totalCards = $cards.length;
    $cards.each(function (i) {
      var $card = $(this);
      if (i >= totalCards - 1) {
        $card.removeClass("collapsed");
        return;
      }
      var shouldCollapse = false;
      if (i === totalCards - 2) {
        shouldCollapse = shouldCollapsePenultimate(i);
      } else {
        shouldCollapse = shouldCollapseNormal(i, scrollTop);
      }
      if (shouldCollapse) {
        $card.addClass("collapsed");
      } else {
        $card.removeClass("collapsed");
      }
    });
  }

  function getStageStartByIndex(i) {
    return wrapTop + cardHeight * i - baseTop - 10;
  }

  measure();
  applyStickyTops();
  updateCollapsed();

  $(window).on("scroll", updateCollapsed);
  $(window).on("resize", function () {
    measure();
    applyStickyTops();
    updateCollapsed();
  });

  $(".service-mini").on("click", function () {
    var $card = $(this).closest(".service-card");
    var i = $card.index();
    var target = getStageStartByIndex(i);
    $cards.each(function (idx) {
      if (idx >= i) {
        $(this).removeClass("collapsed");
      }
    });
    $("html, body")
      .stop(true)
      .animate({ scrollTop: target }, 600, function () {
        updateCollapsed();
      });
  });
});

// ========== Slide Out Service Sections ==========
$(function () {
  var DESKTOP_BREAKPOINT = 1024;
  var $serviceSection = $(".service-section");
  var $cards = $serviceSection.find(".service-card");
  var $lastCard = $cards.last();
  var $whyPartner = $(".why-partner");

  if ($serviceSection.length === 0 || $cards.length === 0 || $whyPartner.length === 0) {
    return;
  }

  var slideDistance = 420;
  var easeFactor = 0.65;
  function isDesktop() {
    return window.innerWidth >= DESKTOP_BREAKPOINT;
  }
  function updateTransition() {
    var scrollTop = $(window).scrollTop();
    if (!isDesktop()) {
      $serviceSection.css("transform", "");
      $whyPartner.addClass("is-visible");
      return;
    }
    if (!$lastCard[0]) return;

    var lastRect = $lastCard[0].getBoundingClientRect();
    var lastTopInDoc = scrollTop + lastRect.top;
    var triggerPoint = lastTopInDoc + $lastCard.outerHeight() * 0.6;
    if (scrollTop > triggerPoint) {
      var rawProgress = (scrollTop - triggerPoint) / slideDistance;
      var progress = Math.min(rawProgress * easeFactor, 1);
      $serviceSection.addClass("is-sliding").css("transform", "translateY(" + -progress * slideDistance + "px)");
      if (progress > 0.2) {
        $whyPartner.addClass("is-visible");
      } else {
        $whyPartner.removeClass("is-visible");
      }
    } else {
      $serviceSection.removeClass("is-sliding").css("transform", "translateY(0)");
      $whyPartner.removeClass("is-visible");
    }
  }
  function updateWhyFadeMobile() {
    if (isDesktop()) return;
    if (!$whyPartner[0]) return;

    var winH = window.innerHeight;
    var rect = $whyPartner[0].getBoundingClientRect();
    if (rect.top < winH * 0.85) {
      $whyPartner.addClass("is-visible");
    }
  }
  $(window).on("scroll resize", function () {
    updateTransition();
    updateWhyFadeMobile();
  });
  updateTransition();
  updateWhyFadeMobile();
});
// Swiper Initialization
$(function () {
  var swiperInstances = [];
  function initMobileSwiper() {
    if (window.innerWidth < 1024) {
      $(".service-swiper").each(function (index, el) {
        if (!el.swiper) {
          swiperInstances[index] = new Swiper(el, {
            slidesPerView: 1.66,
            spaceBetween: 14,
            speed: 500,
          });
        }
      });
    } else {
      swiperInstances.forEach(function (swiper) {
        if (swiper && swiper.destroy) {
          swiper.destroy(true, true);
        }
      });
      swiperInstances = [];
    }
  }
  initMobileSwiper();
  $(window).on("resize", initMobileSwiper);
});

// ===================FAQ Accordion===============
$(function () {
  var $items = $(".faq-grid .faq-item");
  var SPEED = 260;
  $items.each(function () {
    var $item = $(this);
    var $answer = $item.find(".faq-answer");
    if ($item.hasClass("is-open")) {
      $answer.show();
    } else {
      $answer.hide();
    }
  });
  $(".faq-grid").on("click", ".faq-question", function () {
    var $item = $(this).closest(".faq-item");
    var $answer = $item.find(".faq-answer");
    if ($item.hasClass("is-open")) {
      $item.removeClass("is-open");
      $answer.stop(true, true).slideUp(SPEED);
      return;
    }
    $items.not($item).removeClass("is-open").find(".faq-answer").stop(true, true).slideUp(SPEED);
    $item.addClass("is-open");
    $answer.stop(true, true).slideDown(SPEED);
  });
});

// ===============================
// MOBILE STEP ANIMATION
// ===============================
(function () {
  if (!window.matchMedia("(max-width: 768px)").matches) return;
  const $section = $(".approach-mobile");
  const $steps = $section.find(".m-step");
  const total = $steps.length;
  const ARC_W = 57;
  const ARC_H = 207;
  const DURATION = 500;
  let current = 1;
  let running = false;
  let triggeredStep = 1;
  function $step(n) {
    return $steps.eq(n - 1);
  }
  function isFullyInView($el) {
    const r = $el[0].getBoundingClientRect();
    return r.top >= 0 && r.bottom <= window.innerHeight;
  }
  function resetLogo($logo) {
    $logo.removeClass("hidden").css("transform", "translate(-50%, -50%)");
  }
  function runArc($logo) {
    const start = performance.now();
    function animate(t) {
      const p = Math.min((t - start) / DURATION, 1);
      const x = Math.sin(p * Math.PI) * ARC_W;
      const y = p * ARC_H;
      $logo.css("transform", `translate(${x - 18}px, ${y - 18}px)`);
      if (p < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }
  function showStep(n) {
    const $s = $step(n);
    const $logo = $s.find(".logo-svg");
    $steps.removeClass("is-active is-current");
    $s.addClass("is-visible is-active is-current");
    resetLogo($logo);
  }
  function runStep(n) {
    if (running) return;
    if (n >= total) return;
    running = true;
    const $logo = $step(n).find(".logo-svg");
    resetLogo($logo);
    runArc($logo);
    setTimeout(() => {
      $logo.addClass("hidden");
      const next = n + 1;
      showStep(next);
      current = next;
      triggeredStep = next;
      running = false;
    }, DURATION);
  }
  function onScroll() {
    const next = current + 1;
    if (next > total) return;
    if (next !== triggeredStep + 1) return;
    if (!isFullyInView($step(next))) return;
    runStep(current);
  }
  function init() {
    $steps.removeClass("is-visible is-current");
    $steps.find(".logo-svg").addClass("hidden").css("transform", "translate(-50%, -50%)");
    showStep(1);
    current = 1;
    triggeredStep = 1;
  }
  $(window).on("scroll", onScroll);
  init();
})();

// Typing Text Effect
jQuery(function ($) {
  const speed = 30;
  $(".typing-quote").each(function () {
    const $el = $(this);
    const text = $el.text().trim();
    let index = 0;
    let started = false;
    $el.text(text);
    function type() {
      if (index < text.length) {
        const html =
          text.substring(0, index + 1).replace(/./g, (c) => `<span class="char">${c}</span>`) +
          text.substring(index + 1);
        $el.html(html);
        index++;
        setTimeout(type, speed);
      } else {
        $el.addClass("is-done");
      }
    }
    function checkScroll() {
      if (started) return;
      const winBottom = $(window).scrollTop() + $(window).height();
      const triggerPoint = $el.offset().top + $el.outerHeight() * 0.4;
      if (winBottom >= triggerPoint) {
        started = true;
        type();
        $(window).off("scroll", checkScroll);
      }
    }
    $(window).on("scroll", checkScroll);
    checkScroll();
  });
});

// ========== About Believe Section Animation ==========
(function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  var section = document.querySelector(".about-believe");
  if (!section) return;

  var video = section.querySelector(".believe-preview");
  var videoWrap = section.querySelector(".believe-video");
  var videoInner = section.querySelector(".believe-video-inner");
  var playBtn = section.querySelector(".believe-play");

  var hasPlayed = false;
  var playPromise = null;

  function playVideo() {
    if (!video || hasPlayed) return;
    hasPlayed = true;

    if (video.readyState < 2) video.load();

    playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise
        .then(function () {
          videoWrap.classList.add("is-playing");
        })
        .catch(function (err) {
          hasPlayed = false;
          if (err && err.name === "NotAllowedError") {
            video.muted = true;
            video.play().then(function () {
              videoWrap.classList.add("is-playing");
            });
          }
        });
    } else {
      videoWrap.classList.add("is-playing");
    }
  }

  function pauseVideo() {
    if (!video) return;

    var doPause = function () {
      video.pause();
      video.currentTime = 0;
      videoWrap.classList.remove("is-playing");
      hasPlayed = false;
    };

    if (playPromise !== undefined) {
      playPromise.then(doPause).catch(function () {
        hasPlayed = false;
      });
    } else {
      doPause();
    }
  }

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=300%",
      scrub: 2,
      pin: true,
      anticipatePin: 1,

      onUpdate: function (self) {
        if (self.progress > 0.65 && !hasPlayed) playVideo();
      },

      onLeave: function () {
        pauseVideo();
      },
      onLeaveBack: function () {
        pauseVideo();
      },

      onKill: function () {
        pauseVideo();
      },
    },
  });

  tl.to(
    ".believe-top-left",
    { xPercent: -120, yPercent: -80, scale: 1.4, opacity: 0, ease: "none" },
    0
  );
  tl.to(
    ".believe-bottom-left",
    { xPercent: -120, yPercent: 80, scale: 1.4, opacity: 0, ease: "none" },
    0
  );
  tl.to(
    ".believe-right",
    { xPercent: 120, yPercent: -20, scale: 1.4, opacity: 0, ease: "none" },
    0
  );
  tl.fromTo(videoInner, { scale: 1 }, { scale: 1.6, ease: "none" }, 0);
  tl.fromTo(
    videoInner,
    { width: 760 },
    { width: "100vw", scale: 1, ease: "none" },
    0.45
  );
  tl.to({}, { duration: 0.35 });

  playBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    playVideo();
  });

  video.addEventListener("click", function () {
    if (video.paused) playVideo();
    else pauseVideo();
  });

  video.addEventListener("ended", function () {
    pauseVideo();
  });
})();


// ========== About Team Section Adjustments ==========//
$(function () {
  var $grid = $(".team-grid");
  if (!$grid.length) return;
  var iso = null;
  function initLayout() {
    var isMobile = window.innerWidth < 768;
    if (isMobile) {
      if (iso) {
        $grid.isotope("destroy");
        iso = null;
      }
    } else {
      if (!iso) {
        $grid.imagesLoaded(function () {
          iso = $grid.isotope({
            itemSelector: ".team-card",
            percentPosition: true,
            masonry: {
              columnWidth: ".team-card",
              gutter: 24,
            },
          });
        });
      }
    }
  }
  initLayout();
  $(window).on("resize", initLayout);
});

// ========== Values Section Scroll Animation ==========//
(function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  var section = document.querySelector(".values-section");
  if (!section) return;
  var rows = Array.prototype.slice.call(section.querySelectorAll(".values-row"));
  if (!rows.length) return;
  var active = 0;
  var steps = Math.max(1, rows.length - 1);
  var snapStep = 1 / steps;
  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }
  function setActiveClass() {
    rows.forEach(function (el, i) {
      el.classList.toggle("is-active", i === active);
    });
  }
  function layoutTo(index, immediate) {
    var dur = immediate ? 0 : 0.6;
    var ease = "power3.out";
    var w = window.innerWidth || document.documentElement.clientWidth;
    var isTablet = w <= 1024 && w > 767;
    var isMobile = w <= 767;
    rows.forEach(function (row, i) {
      var offset = i - index;
      var y = 0;
      var s = 1;
      var o = 1;
      if (offset === 0) {
        y = 0;
        s = 1;
        o = 1;
      } else if (offset === 1) {
        y = isTablet ? 240 : 100;
        s = 1;
        o = isMobile ? 0 : 1;
      } else if (offset > 1) {
        y = isTablet ? 420 : 180;
        s = 1;
        o = 0;
      } else {
        y = isTablet ? -420 : -180;
        s = 1;
        o = 0;
      }
      gsap.to(row, {
        y: y,
        scale: s,
        autoAlpha: o,
        duration: dur,
        ease: ease,
        overwrite: true,
        transformOrigin: "left center",
      });
      var descText = row.querySelector(".values-desc-text");
      if (descText) {
        gsap.to(descText, {
          autoAlpha: offset === 0 ? 0.9 : 0,
          duration: dur,
          ease: ease,
          overwrite: true,
        });
      }
    });
  }
  function setIndex(idx, immediate) {
    idx = clamp(idx, 0, rows.length - 1);
    if (idx === active && !immediate) return;
    active = idx;
    setActiveClass();
    layoutTo(active, immediate);
  }
  setIndex(0, true);
  var endPx = rows.length * 500;
  var lastSnapped = 0;
  gsap
    .timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=" + endPx,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 1,
        snap: {
          snapTo: function (value) {
            var snapped = Math.round(value / snapStep) * snapStep;
            return clamp(snapped, 0, 1);
          },
          duration: 0.25,
          ease: "power2.out",
          inertia: false,
        },
        onEnter: function () {
          setIndex(0, true);
        },
        onEnterBack: function () {
          setIndex(rows.length - 1, true);
        },
        onUpdate: function (self) {
          var idx = Math.round(self.progress * steps);
          idx = clamp(idx, 0, rows.length - 1);
          var snapped = Math.round(self.progress / snapStep) * snapStep;
          snapped = clamp(snapped, 0, 1);
          if (snapped !== lastSnapped) {
            lastSnapped = snapped;
            setIndex(idx, false);
          }
        },
      },
    })
    .to({}, { duration: 1 });
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      layoutTo(active, true);
      ScrollTrigger.refresh();
    }, 150);
  });
})();

// About Video Section On Mobile
if (window.matchMedia("(max-width: 767px)").matches) {
  (function () {
    var section = document.querySelector(".about-believe-mobile");
    if (!section) return;
    var video = section.querySelector(".believe-mobile-preview");
    var wrap = section.querySelector(".believe-mobile-video");
    var playBtn = section.querySelector(".believe-mobile-play");
    if (!video || !wrap || !playBtn) return;
    function playVideo() {
      video.play().catch(function () {});
      wrap.classList.add("is-playing");
    }
    function pauseVideo() {
      video.pause();
      video.currentTime = 0;
      wrap.classList.remove("is-playing");
    }
    playBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      playVideo();
    });
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        pauseVideo();
      }
    });
    video.addEventListener("ended", function () {
      pauseVideo();
    });
  })();
}

// Single Project Slider Image
(function ($) {
  $(function () {
    if (typeof Swiper === "undefined") return;
    $(".project-challenge").each(function () {
      var $section = $(this);
      var el = $section.find(".project-challenge-swiper")[0];
      var paginationEl = $section.find(".project-challenge-pagination")[0];
      if (!el || !paginationEl) return;
      new Swiper(el, {
        slidesPerView: 3.21,
        spaceBetween: 20,
        speed: 800,
        loopAdditionalSlides: 6,
        grabCursor: true,
        pagination: {
          el: paginationEl,
          type: "progressbar",
        },
        breakpoints: {
          0: { slidesPerView: 1.2, spaceBetween: 10 },
          768: { slidesPerView: 2.08, spaceBetween: 15 },
          1024: { slidesPerView: 3.21, spaceBetween: 20 },
        },
      });
    });
  });
})(jQuery);

// Discover Section Single Project
(function ($) {
  $(function () {
    var $rows = $(".project-more .project-more-row");
    if (!$rows.length) return;
    var mq = window.matchMedia("(max-width: 767px)");
    if (mq.matches) return;
    function setActive(el) {
      $rows.removeClass("is-active");
      $(el).addClass("is-active");
    }
    $rows.on("mouseenter focusin", function () {
      setActive(this);
    });
    $rows.on("click", function () {
      setActive(this);
    });
    $rows.on("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setActive(this);
      }
    });
  });
})(jQuery);

// Case Study Hero Section
(function ($) {
  $(function () {
    $(".case-hero-video").each(function () {
      var $section = $(this);
      var $frame = $section.find(".case-hero-media-frame").first();
      var $videosDesktop = $section.find(".case-hero-video--desktop");
      var $videosMobile = $section.find(".case-hero-video--mobile");
      var $btn = $section.find(".case-hero-play").first();

      if (!$frame.length || (!$videosDesktop.length && !$videosMobile.length) || !$btn.length) return;

      var isPlaying = false;
      var playPromise = null;

      function getCurrentVideo() {
        if ($videosMobile.length && $videosMobile.is(":visible")) {
          return $videosMobile.get(0);
        }
        if ($videosDesktop.length && $videosDesktop.is(":visible")) {
          return $videosDesktop.get(0);
        }
        return null;
      }

      function play() {
        if (isPlaying) return;

        var video = getCurrentVideo();
        if (video) {
          isPlaying = true;
          playPromise = video.play();

          if (playPromise !== undefined) {
            playPromise
              .then(function () {
                $frame.addClass("is-playing");
              })
              .catch(function (err) {
                console.log("Play error:", err);
                isPlaying = false;
              });
          } else {
            $frame.addClass("is-playing");
          }
        }
      }

      function pause() {
        var video = getCurrentVideo();
        if (video && playPromise !== undefined) {
          playPromise
            .then(function () {
              video.pause();
              $frame.removeClass("is-playing");
              isPlaying = false;
            })
            .catch(function () {
              isPlaying = false;
            });
        } else if (video) {
          video.pause();
          $frame.removeClass("is-playing");
          isPlaying = false;
        }
      }

      function reset() {
        var video = getCurrentVideo();
        if (video && playPromise !== undefined) {
          playPromise
            .then(function () {
              video.pause();
              video.currentTime = 0;
              $frame.removeClass("is-playing");
              isPlaying = false;
            })
            .catch(function () {
              isPlaying = false;
            });
        } else if (video) {
          video.pause();
          video.currentTime = 0;
          $frame.removeClass("is-playing");
          isPlaying = false;
        }
      }

      $btn.on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        play();
      });

      $videosDesktop.add($videosMobile).on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        var video = getCurrentVideo();
        if (video) {
          if (video.paused && !isPlaying) {
            play();
          } else if (!video.paused) {
            pause();
          }
        }
      });

      $videosDesktop.add($videosMobile).on("ended", function () {
        isPlaying = false;
        reset();
      });
    });
  });
})(jQuery);
