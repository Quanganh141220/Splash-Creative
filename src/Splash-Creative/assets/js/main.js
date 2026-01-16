jQuery(document).ready(function ($) {
  $(".menu-toggle").on("click", function () {
    $(this).toggleClass("is-open");
    $(".header-menu").toggleClass("active");
  });
  $(document).on("click", function (e) {
    if (
      !$(e.target).closest(".menu-toggle").length &&
      !$(e.target).closest(".header-menu").length
    ) {
      $(".menu-toggle").removeClass("is-open");
      $(".header-menu").removeClass("active");
    }
  });
  const statBlocks = document.querySelectorAll(".about-stats");

  statBlocks.forEach((block) => {
    let hasRun = false;
    const counters = block.querySelectorAll(".number");

    const runCounter = () => {
      counters.forEach((counter) => {
        const target = +counter.dataset.target;
        const suffix = counter.dataset.suffix || "";
        let current = 0;
        const step = target / 80;

        const update = () => {
          current += step;
          if (current < target) {
            counter.textContent = Math.floor(current) + suffix;
            requestAnimationFrame(update);
          } else {
            counter.textContent = target + suffix;
          }
        };

        update();
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasRun) {
            hasRun = true;
            runCounter();
          }
        });
      },
      {
        threshold: 0,
      }
    );

    observer.observe(block);
  });

  const $workList = $(".fw-list");
  const $workItems = $workList.find(".item");
  const $workImage = $(".fw-img");

  const defaultImageSrc = $workItems.first().data("image");

  $workItems.on("mouseenter", function () {
    const imageSrc = $(this).data("image");

    $workItems.removeClass("active");
    $(this).addClass("active");

    $workImage.stop(true, true).fadeOut(300, function () {
      $(this).attr("src", imageSrc).fadeIn(400);
    });
  });

  $workList.on("mouseleave", function () {
    $workItems.removeClass("active").first().addClass("active");

    $workImage.stop(true, true).fadeOut(300, function () {
      $(this).attr("src", defaultImageSrc).fadeIn(400);
    });
  });

  const featuredWorkSlider = new Swiper(".featured-work-slider", {
    slidesPerView: 1.1,
    spaceBetween: 0,
  });

  const $serviceAccordions = $(".home-sevices .accordion-item");
  const $servicePreviews = $(".home-sevices .content-item");

  $serviceAccordions.eq(0).addClass("active");
  $servicePreviews.eq(0).addClass("active");

  $serviceAccordions.on("click", function (e) {
    e.preventDefault();

    const serviceIndex = $(this).index();

    $serviceAccordions.removeClass("active");
    $servicePreviews.removeClass("active");

    $(this).addClass("active");
    $servicePreviews.eq(serviceIndex).addClass("active");
  });

  const reviewsSwiper = new Swiper(".reviews-swiper", {
    slidesPerView: 1.12,
    spaceBetween: 10,
    breakpoints: {
      768: {
        spaceBetween: 15,
        slidesPerView: 2.08,
      },
      1024: {
        spaceBetween: 20,
        slidesPerView: 2.08,
      },
    },
    speed: 800,
    navigation: {
      nextEl: ".reviews-next",
      prevEl: ".reviews-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      type: "progressbar",
    },
  });

  // Client Logo Start
  function createInfiniteSlider(
    containerSelector,
    trackSelector,
    speed = 2,
    direction = "left"
  ) {
    const container = document.querySelector(containerSelector);
    const track = document.querySelector(trackSelector);
    if (!container || !track) return;

    let isPaused = false;

    container.addEventListener("mouseenter", () => (isPaused = true));
    container.addEventListener("mouseleave", () => (isPaused = false));

    function getSlideFullWidth(slide) {
      const style = window.getComputedStyle(slide);
      return (
        slide.offsetWidth +
        parseFloat(style.marginLeft) +
        parseFloat(style.marginRight)
      );
    }

    let position = 0;

    if (direction === "right") {
      const slides = track.children;
      if (slides.length > 0) {
        const lastSlideWidth = getSlideFullWidth(slides[slides.length - 1]);
        position = -lastSlideWidth;
        track.style.transform = `translateX(${position}px)`;
      }
    }

    function animate() {
      const slides = track.children;
      if (!isPaused && slides.length > 0) {
        if (direction === "left") {
          const firstSlide = slides[0];
          const w = getSlideFullWidth(firstSlide);

          position -= speed;

          if (position <= -w) {
            position += w;
            track.appendChild(firstSlide);
          }
        } else {
          const lastSlide = slides[slides.length - 1];
          const w = getSlideFullWidth(lastSlide);

          position += speed;

          if (position >= 0) {
            position -= w;
            track.prepend(lastSlide);
          }
        }

        track.style.transform = `translateX(${position}px)`;
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  createInfiniteSlider("#clientSliderContainer", "#clientSliderTrack", 2);
  createInfiniteSlider(
    "#clientSliderContainerTopMb",
    "#clientSliderTrackTopMb",
    1.5
  );
  createInfiniteSlider(
    "#clientSliderContainerBottomMb",
    "#clientSliderTrackBottomMb",
    1.5,
    "right"
  );

  $(".our-work-list-pc .our-work-item").on({
    mouseenter: function () {
      const $wrap = $(this).find(".our-work-item-images");
      const $inner = $wrap.find(".inner-images");

      $wrap.css("height", "auto");
      const h = $inner.outerHeight(true);
      $wrap.css("height", 0);

      $wrap.stop(true).animate({ height: h }, 700);
    },

    mouseleave: function () {
      $(this)
        .find(".our-work-item-images")
        .stop(true)
        .animate({ height: 0 }, 400);
    },
  });
});
document.addEventListener("DOMContentLoaded", function () {
  const elements = document.querySelectorAll(".typing-fade");
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        if (el.dataset.played) return;

        el.dataset.played = "true";

        const text = el.textContent.replace(/\s+/g, " ").trim();
        el.textContent = "";

        [...text].forEach((char) => {
          const span = document.createElement("span");
          span.textContent = char;
          span.style.color = "#878787";
          el.appendChild(span);
        });

        const letters = el.querySelectorAll("span");
        let index = 0;

        function type() {
          if (index >= letters.length) return;

          letters[index].style.color = "#fff";
          index++;
          setTimeout(type, 30);
        }

        type();

        observer.unobserve(el);
      });
    },
    {
      threshold: 0.3,
    }
  );

  elements.forEach((el) => observer.observe(el));
});
