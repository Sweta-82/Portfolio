import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import initScrollReveal from '../utils/scrollReveal.js';
import initFoldText from '../utils/foldText.js';
import initScrollStack from '../utils/scrollStack.js';

// locomation
const scroll = new LocomotiveScroll({
  el: document.querySelector('[data-scroll-container]'),
  smooth: true,
  lerp: 0.03
});
window.locomotiveScrollInstance = scroll;

gsap.registerPlugin(ScrollTrigger);

// Sync ScrollTrigger with Locomotive Scroll
scroll.on("scroll", ScrollTrigger.update);

ScrollTrigger.scrollerProxy("[data-scroll-container]", {
  scrollTop(value) {
    return arguments.length ? scroll.scrollTo(value, 0, 0) : scroll.scroll.instance.scroll.y;
  },
  getBoundingClientRect() {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  },
  pinType: document.querySelector("[data-scroll-container]").style.transform ? "transform" : "fixed"
});

ScrollTrigger.addEventListener("refresh", () => scroll.update());

// Initialize ScrollReveal for text elements
initScrollReveal('.scroll-reveal');

ScrollTrigger.refresh();

const tl = gsap.timeline({ defaults: { ease: "expo.inOut" } });

tl.from(".reveal span", {
  x: 100,
  opacity: 0,
  duration: 2,
  stagger: 0.2
});

tl.to(".reveal", {
  y: -40,
  opacity: 0,
  duration: 1
});

// 1. Grow the orange reveal strip (100% height to fill the gap)
tl.fromTo(".green-div", {
  height: 0,
  yPercent: 0
},
  {
    height: "100vh",
    duration: 0.4,
    ease: "power2.inOut"
  }
);

// 2. Hide the black loader
tl.set(".black", { display: "none" });

// 3. Reveal the main scroll container and its content
tl.fromTo("[data-scroll-container]",
  { opacity: 0, visibility: "hidden" },
  { opacity: 1, visibility: "visible", duration: 1 },
  "-=0.2"
);

tl.from("h1", {
  y: 40,
  opacity: 0,
  duration: 1
}, "-=0.8");

tl.from('.section-lorem', {
  y: -40,
  opacity: 0,
  duration: 1
}, "-=0.8");

tl.to(".green-div", {
  yPercent: -100, // Move it off screen (matching 100vh height)
  duration: 0.8,
  ease: "power4.inOut"
}, "-=1");

tl.set(".green-div", { display: "none" });

// Trigger animations after loader completes
tl.call(() => {
  initFoldText('[data-fold-text]');
  initScrollStack('.scroll-stack-container');
});


const text = document.querySelector(".animatedText");

if (text) {
  // Step 1: Get the word and split into letters
  const letters = text.textContent.split(""); // ['b', 'a', 't']

  // Step 2: Clear the original text
  text.textContent = "";

  // Step 3: Loop through each letter and wrap in <span>
  for (let i = 0; i < letters.length; i++) {
    let span = document.createElement("span"); // create a new <span>
    span.classList.add("letter"); // add class "letter"
    span.textContent = letters[i]; // set text as the letter
    text.appendChild(span); // add <span> inside the h1
  }

  tl.from(".letter", {
    opacity: 0,
    y: -30,
    duration: 2,
    stagger: 0.2,
  });
}

// About Section - Image "Subtle Slow Blend" Effect
const aboutImagesTl = gsap.timeline({
  scrollTrigger: {
    trigger: ".main-div",
    scroller: "[data-scroll-container]",
    start: "top 95%",
    end: "center top",
    scrub: 2,
    markers: false
  }
});

// Animate positions and rotations (Subtle: -10 to 10)
aboutImagesTl.to(".main-div1", {
  rotate: -10,
  x: -40,
  y: -10,
  duration: 1,
  ease: "power2.inOut"
}, 0);

aboutImagesTl.to(".main-div2", {
  rotate: 0,
  y: -30,
  duration: 1,
  ease: "power2.inOut"
}, 0);

aboutImagesTl.to(".main-div3", {
  rotate: 10,
  x: 40,
  y: -10,
  duration: 1,
  ease: "power2.inOut"
}, 0);

// Animate filters (Grayscale to Color Blend)
aboutImagesTl.to(".img-reveal", {
  filter: "grayscale(0%)",
  opacity: 1,
  stagger: 0.1,
  duration: 1,
  ease: "power4.inOut"
}, 0);
// gsap.from(".text-div .text-div1",{
//     y:40,
//     duration:1,
//     stagger: 0.2,
//     opacity:0,
//     scrollTrigger:".text-div .text-div1"

// })



// var img1 = document.querySelector(".img1");
// var cursor = document.querySelector(".cursor");

// img1.addEventListener("mousemove", function (val) {
//     console.log(val);
//     gsap.to(cursor, {
//         x:val.x,
//         y:val.y,
//         scale: 2,
//         duration: 0.3,

//     });
// });



const main = document.querySelectorAll(".main");
const cursor = document.querySelector(".cursor");
const hero = document.querySelector(".sub-hero")

if (cursor) {
  gsap.set(cursor, { opacity: 0, scale: 0.6, pointerEvents: "none" });

  main.forEach(e => {
    e.addEventListener("mouseenter", function () {
      if (hero) {
        gsap.to(hero, {
          backgroundColor: "#201a2e",
          duration: 2
        });
      }
      gsap.to(cursor, {
        opacity: 1,
        scale: 1,
        duration: 0.3
      });
    });

    e.addEventListener("mouseleave", function () {
      if (hero) {
        gsap.to(hero, {
          backgroundColor: "#010101ff",
          duration: 2
        });
      }
      gsap.to(cursor, {
        opacity: 0,
        scale: 0.6,
        duration: 0.3
      });
    });
  });

  document.addEventListener("mousemove", function (e) {
    gsap.to(cursor, {
      x: e.clientX,
      y: e.clientY,
      duration: 2,
      ease: "power2.out"
    })
  });
}

// Timeline Animations
const timelineLines = document.querySelectorAll('.timeline-line');
const timelineCards = document.querySelectorAll('.timeline-card');
const timelineDots = document.querySelectorAll('.timeline-dot');

timelineLines.forEach((line) => {
  gsap.from(line, {
    scaleY: 0,
    transformOrigin: "top",
    duration: 2,
    ease: "power2.out",
    scrollTrigger: {
      trigger: line,
      scroller: "[data-scroll-container]",
      start: "top 80%",
      end: "bottom 20%",
      scrub: 1
    }
  });
});

timelineCards.forEach((card, index) => {
  const dot = timelineDots[index];

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: card,
      scroller: "[data-scroll-container]",
      start: "top 85%",
      toggleActions: "play none none reverse"
    }
  });

  timeline.from(card, {
    x: 50,
    opacity: 0,
    duration: 1,
    ease: "power3.out"
  }, 0);

  timeline.from(dot, {
    scale: 0,
    opacity: 0,
    duration: 0.5,
    ease: "back.out(1.7)"
  }, 0.2);
});