import { gsap } from 'gsap';

const lerp = (a, b, n) => (1 - n) * a + n * b;

export function initCrosshair(options = {}) {
  const color = options.color || 'rgba(150, 150, 150, 0.4)';
  const container = options.container || document.body;

  let wrapper = document.getElementById('crosshair-wrapper');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = 'crosshair-wrapper';
    wrapper.className = 'fixed top-0 left-0 w-full h-full pointer-events-none z-[99999]';
    wrapper.style.display = 'none'; // Hidden until loader finishes
    wrapper.innerHTML = `
      <svg class="absolute top-0 left-0 w-full h-full pointer-events-none">
        <defs>
          <filter id="filter-noise-x">
            <feTurbulence id="filter-x-turb" type="fractalNoise" baseFrequency="0.000001" numOctaves="1" />
            <feDisplacementMap in="SourceGraphic" scale="40" />
          </filter>
          <filter id="filter-noise-y">
            <feTurbulence id="filter-y-turb" type="fractalNoise" baseFrequency="0.000001" numOctaves="1" />
            <feDisplacementMap in="SourceGraphic" scale="40" />
          </filter>
        </defs>
      </svg>
      <div id="crosshair-h" class="absolute w-full h-px pointer-events-none opacity-0" style="background: ${color}; transform: translateY(-50%);"></div>
      <div id="crosshair-v" class="absolute h-full w-px pointer-events-none opacity-0" style="background: ${color}; transform: translateX(-50%);"></div>
    `;
    container.appendChild(wrapper);
  }

  const lineHorizontal = document.getElementById('crosshair-h');
  const lineVertical = document.getElementById('crosshair-v');
  const filterXTurb = document.getElementById('filter-x-turb');
  const filterYTurb = document.getElementById('filter-y-turb');

  if (!lineHorizontal || !lineVertical) return;

  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let initialized = false;
  let rafId;

  const renderedStyles = {
    tx: { previous: mouse.x, current: mouse.x, amt: 0.15 },
    ty: { previous: mouse.y, current: mouse.y, amt: 0.15 }
  };

  gsap.set([lineHorizontal, lineVertical], { opacity: 0 });

  const handleMouseMove = (ev) => {
    mouse.x = ev.clientX;
    mouse.y = ev.clientY;

    if (!initialized) {
      // Don't show crosshair while the loader is still visible
      const loader = document.querySelector('.black');
      if (loader) {
        const style = window.getComputedStyle(loader);
        if (style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0) {
          return;
        }
      }

      // Loader is gone — show the crosshair wrapper
      wrapper.style.display = '';

      initialized = true;
      renderedStyles.tx.previous = renderedStyles.tx.current = mouse.x;
      renderedStyles.ty.previous = renderedStyles.ty.current = mouse.y;

      gsap.to([lineHorizontal, lineVertical], {
        duration: 0.9,
        ease: 'Power3.easeOut',
        opacity: 1
      });

      render();
    }
  };

  window.addEventListener('mousemove', handleMouseMove);

  // Noise glitch distortion on hovering links / interactive elements
  const primitiveValues = { turbulence: 0 };
  const tl = gsap
    .timeline({
      paused: true,
      onStart: () => {
        lineHorizontal.style.filter = `url(#filter-noise-x)`;
        lineVertical.style.filter = `url(#filter-noise-y)`;
      },
      onUpdate: () => {
        if (filterXTurb) filterXTurb.setAttribute('baseFrequency', primitiveValues.turbulence);
        if (filterYTurb) filterYTurb.setAttribute('baseFrequency', primitiveValues.turbulence);
      },
      onComplete: () => {
        lineHorizontal.style.filter = 'none';
        lineVertical.style.filter = 'none';
      }
    })
    .to(primitiveValues, {
      duration: 0.5,
      ease: 'power1',
      startAt: { turbulence: 0.8 },
      turbulence: 0
    });

  const enter = () => tl.restart();
  const leave = () => tl.progress(1).kill();

  const bindLinkEvents = () => {
    const interactiveElements = document.querySelectorAll('a, button, input, .skill-tag, [role="button"]');
    interactiveElements.forEach((el) => {
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mouseleave', leave);
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
    });
  };

  bindLinkEvents();

  const observer = new MutationObserver(bindLinkEvents);
  observer.observe(document.body, { childList: true, subtree: true });

  const render = () => {
    renderedStyles.tx.current = mouse.x;
    renderedStyles.ty.current = mouse.y;

    for (const key in renderedStyles) {
      renderedStyles[key].previous = lerp(
        renderedStyles[key].previous,
        renderedStyles[key].current,
        renderedStyles[key].amt
      );
    }

    gsap.set(lineVertical, { x: renderedStyles.tx.previous });
    gsap.set(lineHorizontal, { y: renderedStyles.ty.previous });

    rafId = requestAnimationFrame(render);
  };

  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    if (rafId) cancelAnimationFrame(rafId);
    observer.disconnect();
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initCrosshair());
} else {
  initCrosshair();
}

export default initCrosshair;
