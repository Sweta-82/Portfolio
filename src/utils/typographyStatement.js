import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initSplitTypography() {
  const sections = document.querySelectorAll('.split-reveal-section');
  if (!sections.length) return;

  const scroller = document.querySelector('[data-scroll-container]') || window;

  sections.forEach((section) => {
    if (section.dataset.splitInitialized) return;
    section.dataset.splitInitialized = 'true';

    const topHalf = section.querySelector('.split-top');
    const bottomHalf = section.querySelector('.split-bottom');
    const content = section.querySelector('.split-reveal-content');
    const lines = section.querySelectorAll('.split-line');

    if (!topHalf || !bottomHalf || !content) return;

    // Initial closed state: top & bottom meet at center with no gap
    gsap.set(topHalf, { yPercent: 0, willChange: 'transform' });
    gsap.set(bottomHalf, { yPercent: 0, willChange: 'transform' });
    gsap.set(content, { opacity: 0, scale: 0.94, willChange: 'transform, opacity' });
    if (lines.length) {
      gsap.set(lines, { scaleX: 0, willChange: 'transform, opacity' });
    }

    const isMobile = window.innerWidth < 768;
    const splitDistance = isMobile ? 42 : 52; // Vertical distance to move halves apart

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        scroller: scroller,
        start: 'top top',
        end: '+=140%',
        pin: true,
        pinSpacing: true,
        scrub: 0.7,
        anticipatePin: 1
      }
    });

    // Animate top half moving UP
    tl.to(
      topHalf,
      {
        yPercent: -splitDistance,
        ease: 'power2.inOut',
        duration: 1
      },
      0
    );

    // Animate bottom half moving DOWN
    tl.to(
      bottomHalf,
      {
        yPercent: splitDistance,
        ease: 'power2.inOut',
        duration: 1
      },
      0
    );

    // Reveal content inside the opening gap
    tl.fromTo(
      content,
      { opacity: 0, scale: 0.93 },
      {
        opacity: 1,
        scale: 1,
        ease: 'power1.out',
        duration: 0.85
      },
      0.15
    );

    // Subtle editorial dividing lines expanding inside the gap
    if (lines.length) {
      tl.fromTo(
        lines,
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 0.4,
          ease: 'power2.out',
          duration: 0.75
        },
        0.2
      );
    }

    // Brief hold when fully opened before unpinning
    tl.to({}, { duration: 0.2 });
  });

  ScrollTrigger.refresh();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initSplitTypography, 400);
  });
} else {
  setTimeout(initSplitTypography, 400);
}

export default initSplitTypography;
