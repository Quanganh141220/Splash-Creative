(function () {
  'use strict';

  const mql = window.matchMedia('(max-width: 1024px)');

  let enabled = false;
  let geom = null;
  let raf = 0;

  let pinContainer, stage, splash, circleLeftEl, circleRightEl, point1, point2, point3;

  const CONFIG = {
    leftStartAngle: 200,
    rightEndAngle: 50,
    splitProgress: 0.5
  };

  function clamp01(v){ return Math.max(0, Math.min(1, v)); }
  function degToRad(deg){ return deg * Math.PI / 180; }
  function radToDeg(rad){ return rad * 180 / Math.PI; }

  function normalizeAngle(a){
    while (a < 0) a += 360;
    while (a >= 360) a -= 360;
    return a;
  }

  function calculateAngle(fromAngle, toAngle, t){
    let diff = toAngle - fromAngle;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return normalizeAngle(fromAngle + diff * t);
  }

  function angleFromPoint(cx, cy, px, py){
    return normalizeAngle(radToDeg(Math.atan2(cy - py, px - cx)));
  }

  function posOnCircle(cx, cy, r, angleDeg){
    const a = degToRad(angleDeg);
    return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
  }

  function getCircleGeom(el){
    const sr = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const radius = r.width / 2;
    return {
      x: r.left - sr.left + radius,
      y: r.top - sr.top + radius,
      radius
    };
  }

  function getPointCenter(el){
    const sr = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      x: r.left - sr.left + r.width / 2,
      y: r.top - sr.top + r.height / 2
    };
  }

  function circleIntersections(c0, c1){
    const dx = c1.x - c0.x;
    const dy = c1.y - c0.y;
    const d = Math.hypot(dx, dy);

    if (!d) return null;
    if (d > c0.radius + c1.radius) return null;
    if (d < Math.abs(c0.radius - c1.radius)) return null;

    const a = (c0.radius * c0.radius - c1.radius * c1.radius + d * d) / (2 * d);
    const h2 = c0.radius * c0.radius - a * a;
    const h = h2 <= 0 ? 0 : Math.sqrt(h2);

    const xm = c0.x + (a * dx) / d;
    const ym = c0.y + (a * dy) / d;

    const rx = (-dy / d) * h;
    const ry = ( dx / d) * h;

    return { p1: { x: xm + rx, y: ym + ry }, p2: { x: xm - rx, y: ym - ry } };
  }

  function measure(){
    const cL = getCircleGeom(circleLeftEl);
    const cR = getCircleGeom(circleRightEl);

    const target = point2 ? getPointCenter(point2) : { x: (cL.x + cR.x) / 2, y: (cL.y + cR.y) / 2 };
    const inter = circleIntersections(cL, cR);

    let ix = target.x;
    let iy = target.y;

    if (inter){
      const d1 = (inter.p1.x - target.x) ** 2 + (inter.p1.y - target.y) ** 2;
      const d2 = (inter.p2.x - target.x) ** 2 + (inter.p2.y - target.y) ** 2;
      const p = d1 <= d2 ? inter.p1 : inter.p2;
      ix = p.x;
      iy = p.y;
    }

    geom = {
      cL,
      cR,
      leftEndAngle: angleFromPoint(cL.x, cL.y, ix, iy),
      rightStartAngle: angleFromPoint(cR.x, cR.y, ix, iy)
    };
  }

  function getProgress(){
    const r = pinContainer.getBoundingClientRect();
    const vh = window.innerHeight;
    const h = r.height;

    let p = 0;
    if (r.top <= 0 && r.top > -(h - vh)) p = -r.top / (h - vh);
    else if (r.top <= -(h - vh)) p = 1;

    return clamp01(p);
  }

  function setPointOpacity(a, b, c){
    if (point1) point1.style.opacity = String(a);
    if (point2) point2.style.opacity = String(b);
    if (point3) point3.style.opacity = String(c);
  }

  function render(){
    if (!geom) measure();

    const p = getProgress();
    const split = CONFIG.splitProgress;

    let x, y, rotation;

    if (p < split){
      const t = p / split;
      const a = calculateAngle(CONFIG.leftStartAngle, geom.leftEndAngle, t);
      const pos = posOnCircle(geom.cL.x, geom.cL.y, geom.cL.radius, a);

      x = pos.x;
      y = pos.y;
      rotation = -a + 90;

      circleLeftEl.classList.add('active');
      circleRightEl.classList.remove('active');

      setPointOpacity(1, t > 0.7 ? 1 : 0.35, 0.35);
    } else {
      const t = (p - split) / (1 - split);
      const a = calculateAngle(geom.rightStartAngle, CONFIG.rightEndAngle, t);
      const pos = posOnCircle(geom.cR.x, geom.cR.y, geom.cR.radius, a);

      x = pos.x;
      y = pos.y;
      rotation = -a + 90;

      circleLeftEl.classList.remove('active');
      circleRightEl.classList.add('active');

      setPointOpacity(0.35, t < 0.3 ? 1 : 0.35, 1);
    }

    splash.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${rotation}deg)`;
  }

  function onScroll(){
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      render();
    });
  }

  function onResize(){
    geom = null;
    onScroll();
  }

  function setup(){
    if (enabled) return;

    pinContainer = document.getElementById('metricsPin');
    stage = document.getElementById('metricsStage');
    splash = document.getElementById('splash');
    circleLeftEl = document.getElementById('circleLeft');
    circleRightEl = document.getElementById('circleRight');
    point1 = document.getElementById('point1');
    point2 = document.getElementById('point2');
    point3 = document.getElementById('point3');

    if (!pinContainer || !stage || !splash || !circleLeftEl || !circleRightEl) return;

    stage.appendChild(splash);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('load', onResize);

    enabled = true;
    onResize();
  }

  function teardown(){
    if (!enabled) return;

    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('load', onResize);

    enabled = false;
    geom = null;

    if (raf){
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  function handleBreakpoint(){
    if (mql.matches) teardown();
    else setup();
  }

  if (mql.addEventListener) mql.addEventListener('change', handleBreakpoint);
  else mql.addListener(handleBreakpoint);

  handleBreakpoint();
})();






// Our Values OV Cards
const ovRoot = document.querySelector('.ov')
if (ovRoot) {
  const ovCards = Array.from(ovRoot.querySelectorAll('[data-ov-card]'))
  const canHover = window.matchMedia('(hover:hover)').matches

  const setPush = (card) => {
    const descBox = card.querySelector('.ov-descBox')
    const titleBox = card.querySelector('.ov-titleBox')
    if (!descBox || !titleBox) return

    const descH = descBox.getBoundingClientRect().height
    const gap = 20
    card.style.setProperty('--push', `${Math.ceil(descH + gap)}px`)
  }

  const refreshPushAll = () => {
    ovCards.forEach((card) => setPush(card))
  }

  const setActive = (target) => {
    setPush(target)
    ovCards.forEach((c) => c.classList.toggle('is-active', c === target))
  }

  ovCards.forEach((card) => {
    if (canHover) card.addEventListener('mouseenter', () => setActive(card))
    card.addEventListener('focusin', () => setActive(card))
    card.addEventListener('click', () => setActive(card))
  })

  refreshPushAll()

  window.addEventListener('resize', () => {
    refreshPushAll()
  })
}



jQuery(function ($) {
  const $ov = $('.ov')
  if (!$ov.length) return

  const $cards = $ov.find('[data-ov-card]')
  let ovSwiper = null

  const setPush = ($card, active) => {
    const $title = $card.find('.ov-titleBox')
    const $desc = $card.find('.ov-descBox')

    if (!active) {
      $title.css('transform', 'translateY(0)')
      return
    }

    const h = $desc.outerHeight()
    const gap = 20
    $title.css('transform', `translateY(-${h + gap}px)`)
  }

  const setActive = (index) => {
    $cards.each(function (i) {
      const $card = $(this)
      const isActive = i === index
      $card.toggleClass('is-active', isActive)
      setPush($card, isActive)
    })
  }

  const initSwiper = () => {
    if (ovSwiper) return

    ovSwiper = new Swiper('.ov-swiper', {
      slidesPerView: 1.3,
      spaceBetween: 18,
      speed: 600,
      threshold: 6,
      on: {
        init() {
          setActive(this.activeIndex)
        },
        slideChange() {
          setActive(this.activeIndex)
        }
      }
    })

    $('.ov-slide').on('click', function () {
      const idx = $(this).index()
      ovSwiper.slideTo(idx)
      setActive(idx)
    })
  }

  const destroySwiper = () => {
    if (!ovSwiper) return
    ovSwiper.destroy(true, true)
    ovSwiper = null
  }

  const handleResponsive = () => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      initSwiper()
    } else {
      destroySwiper()
    }
  }

  handleResponsive()
  $(window).on('resize', handleResponsive)
})
