import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollStack(containerSelector = '.scroll-stack-container') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const cards = container.querySelectorAll('.scroll-stack-card');
  if (!cards.length) return;

  const scroller = document.querySelector('[data-scroll-container]') ? '[data-scroll-container]' : window;
  const isMobile = window.innerWidth < 768;

  // Header animation for the Education & Certifications section
  const sectionHeader = document.querySelector('#education .text-center');
  if (sectionHeader && !sectionHeader.dataset.animated) {
    sectionHeader.dataset.animated = 'true';
    gsap.from(sectionHeader.children, {
      scrollTrigger: {
        trigger: sectionHeader,
        scroller: scroller,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      y: 40,
      opacity: 0,
      duration: 0.9,
      stagger: 0.15,
      ease: 'power3.out'
    });
  }

  // Clean up any previous ScrollTriggers on these cards
  ScrollTrigger.getAll().forEach(st => {
    if (st.trigger && (st.trigger.classList?.contains('scroll-stack-card') || st.trigger === container)) {
      st.kill();
    }
  });

  cards.forEach((card, index) => {
    const isLast = index === cards.length - 1;

    // Set stacking order so each succeeding card scrolls and overlaps ON TOP of the previous card
    card.style.zIndex = index + 1;
    card.style.position = 'relative';
    card.style.willChange = 'transform, filter, opacity';

    // Pinned Overlapping Stack Effect:
    // When the card reaches the sticky threshold, it stays pinned (pin: true, pinSpacing: false)
    // As the user continues scrolling, the NEXT card scrolls up and overlaps directly on top of it.
    // While being overlapped, the pinned card scales down, dims, and blurs slightly.
    ScrollTrigger.create({
      trigger: card,
      scroller: scroller,
      start: isMobile ? 'top 12%' : 'top 16%',
      endTrigger: container,
      end: 'bottom 85%',
      pin: !isLast,
      pinSpacing: false,
      scrub: 0.5,
      onUpdate: (self) => {
        if (isLast) return;
        const progress = self.progress;
        const targetScale = Math.max(0.88, 1 - progress * 0.12);
        const opacity = Math.max(0.4, 1 - progress * 0.6);
        const blur = isMobile ? 0 : progress * 5;

        gsap.set(card, {
          scale: targetScale,
          opacity: opacity,
          filter: blur > 0 ? `blur(${blur}px)` : 'none',
          transformOrigin: 'top center'
        });
      }
    });

    // 3D subtle mouse tilt interaction on desktop
    if (!isMobile) {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -3;
        const rotateY = ((x - centerX) / centerX) * 3;

        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          duration: 0.25,
          ease: 'power1.out',
          transformPerspective: 1000
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.4,
          ease: 'power2.out'
        });
      });
    }
  });

  ScrollTrigger.refresh();
}

function triggerInit() {
  initScrollStack();
  setTimeout(() => {
    ScrollTrigger.refresh();
    if (window.locomotiveScrollInstance) {
      window.locomotiveScrollInstance.update();
    }
  }, 300);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(triggerInit, 400);
  });
} else {
  setTimeout(triggerInit, 400);
}

window.addEventListener('load', () => {
  setTimeout(triggerInit, 200);
});

export default initScrollStack;
