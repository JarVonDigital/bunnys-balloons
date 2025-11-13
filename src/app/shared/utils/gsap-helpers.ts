import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

let scrollTriggerRegistered = false;

export function ensureScrollTriggerRegistered(): void {
  if (!scrollTriggerRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
  }
}

export { gsap, ScrollTrigger };
