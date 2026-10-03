import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initSkillsVelocityMarquee() {
  const section = document.querySelector('.skills-velocity-stream');
  if (!section || section.dataset.skillsInitialized) return;
  section.dataset.skillsInitialized = 'true';

  const scroller = document.querySelector('[data-scroll-container]') || window;
  const stickyMarquee = section.querySelector('.skills-sticky-marquee');
  const tapeHeading = section.querySelector('.skills-marquee-tape-heading');
  const cards = section.querySelectorAll('.stream-card');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -------------------------------------------------------------
  // 1. PIN BACKGROUND MARQUEE FOR THE ENTIRE SECTION DURATION
  // -------------------------------------------------------------
  if (stickyMarquee) {
    ScrollTrigger.create({
      trigger: section,
      scroller: scroller,
      start: 'top top',
      end: 'bottom bottom',
      pin: stickyMarquee,
      pinSpacing: false,
      anticipatePin: 1,
      invalidateOnRefresh: true
    });
  }

  // -------------------------------------------------------------
  // 2. HUGE "WHAT I WORK WITH" VELOCITY-REACTIVE MARQUEE ENGINE
  // -------------------------------------------------------------
  if (!prefersReducedMotion && tapeHeading) {
    // Duplicate spans to ensure seamless infinite looping width
    const html = tapeHeading.innerHTML;
    tapeHeading.innerHTML = html + html;

    let tapeX = 0;
    let singleWidth = 0;

    const measureTape = () => {
      singleWidth = tapeHeading.scrollWidth / 2;
    };

    measureTape();
    window.addEventListener('resize', measureTape);

    const getScrollY = () => {
      if (window.locomotiveScrollInstance && window.locomotiveScrollInstance.scroll && window.locomotiveScrollInstance.scroll.instance) {
        return window.locomotiveScrollInstance.scroll.instance.scroll.y;
      }
      const scrollContainer = document.querySelector('[data-scroll-container]');
      if (scrollContainer && typeof scrollContainer.scrollTop === 'number' && scrollContainer.scrollTop > 0) {
        return scrollContainer.scrollTop;
      }
      return window.scrollY || document.documentElement.scrollTop || 0;
    };

    let lastScrollY = getScrollY();
    let currentVelocity = 0;
    let targetVelocity = 0;
    let rafId = null;

    const updateMarquee = () => {
      const currentScrollY = getScrollY();
      const deltaY = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      // Map scroll delta to target velocity
      targetVelocity = deltaY * 0.7;

      // Smooth lerp: decelerates gradually when scrolling stops, accelerates on scroll
      currentVelocity += (targetVelocity - currentVelocity) * 0.085;

      // Direction multiplier
      const dir = currentVelocity >= 0 ? 1 : -1;

      // Base readable drift speed + user scroll velocity
      const speed = (dir * 0.85) + (currentVelocity * 1.25);
      tapeX -= speed;

      if (singleWidth > 0) {
        if (tapeX <= -singleWidth) {
          tapeX += singleWidth;
        } else if (tapeX >= 0) {
          tapeX -= singleWidth;
        }
      }

      tapeHeading.style.transform = `translate3d(${tapeX.toFixed(2)}px, 0, 0)`;

      rafId = requestAnimationFrame(updateMarquee);
    };

    rafId = requestAnimationFrame(updateMarquee);
  }

  // -------------------------------------------------------------
  // 3. CONTINUOUS STREAM CARD ENTRANCES (Straight, High Visibility)
  // -------------------------------------------------------------
  if (cards.length) {
    const isMobile = window.innerWidth < 768;

    cards.forEach((card, index) => {
      if (!prefersReducedMotion && !isMobile) {
        // Straight placement with 100% visibility
        gsap.set(card, {
          opacity: 1,
          y: 0,
          scale: 1,
          rotation: 0,
          transformOrigin: 'center center'
        });

        // Subtle organic parallax float on scroll
        gsap.to(card, {
          y: (index % 2 === 0 ? -25 : -45),
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            scroller: scroller,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
            invalidateOnRefresh: true
          }
        });
      } else {
        gsap.set(card, { opacity: 1, y: 0, scale: 1, rotation: 0 });
      }

      // -------------------------------------------------------------
      // 4. INTERACTIVE SPOTLIGHT ON HOVER (Straight Cards)
      // -------------------------------------------------------------
      if (!isMobile) {
        let bounds = null;
        const floatLayers = card.querySelectorAll('.card-depth-float');

        card.addEventListener('mouseenter', () => {
          bounds = card.getBoundingClientRect();
          gsap.to(card, {
            scale: 1.025,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        });

        card.addEventListener('mousemove', (e) => {
          if (!bounds) bounds = card.getBoundingClientRect();
          const mouseX = e.clientX - bounds.left;
          const mouseY = e.clientY - bounds.top;

          card.style.setProperty('--mouse-x', `${mouseX}px`);
          card.style.setProperty('--mouse-y', `${mouseY}px`);

          const normX = (mouseX / bounds.width) - 0.5;
          const normY = (mouseY / bounds.height) - 0.5;

          if (floatLayers.length) {
            gsap.to(floatLayers, {
              x: normX * 6,
              y: normY * 6,
              duration: 0.25,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          }
        });

        card.addEventListener('mouseleave', () => {
          bounds = null;

          gsap.to(card, {
            scale: 1.0,
            rotation: 0,
            duration: 0.4,
            ease: 'power3.out',
            overwrite: 'auto'
          });

          if (floatLayers.length) {
            gsap.to(floatLayers, { x: 0, y: 0, duration: 0.4, ease: 'power3.out' });
          }
        });
      }
    });
  }

  ScrollTrigger.refresh();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(initSkillsVelocityMarquee, 450));
} else {
  setTimeout(initSkillsVelocityMarquee, 450);
}

export default initSkillsVelocityMarquee;
