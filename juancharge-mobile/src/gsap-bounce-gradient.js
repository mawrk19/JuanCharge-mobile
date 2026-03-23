// src/gsap-bounce-gradient.js
import gsap from 'gsap';

/**
 * Animate a gradient background with a bounce effect.
 * @param {HTMLElement} el - The element to animate (should have a gradient background).
 */
export function bounceGradient(el) {
  if (!el) return;
  // Animate the background position for a "bounce" effect
  gsap.fromTo(
    el,
    { backgroundPosition: '50% 0%' },
    {
      backgroundPosition: '50% 100%',
      duration: 0.8,
      ease: 'bounce.out',
      onComplete: () => {
        gsap.to(el, {
          backgroundPosition: '50% 0%',
          duration: 0.6,
          ease: 'power2.inOut',
        });
      },
    }
  );
}
