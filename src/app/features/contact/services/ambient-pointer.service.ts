import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AmbientPointerService {
  applyPointer(element: HTMLElement, event: PointerEvent, pointerRange = 24): void {
    const rect = element.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return;
    }

    const relativeX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const relativeY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    element.style.setProperty('--ambient-pointer-x', `${relativeX * pointerRange}px`);
    element.style.setProperty('--ambient-pointer-y', `${relativeY * pointerRange}px`);
    element.style.setProperty('--ambient-pointer-tilt', `${relativeX * 6}deg`);
  }

  resetPointer(element: HTMLElement): void {
    element.style.setProperty('--ambient-pointer-x', '0px');
    element.style.setProperty('--ambient-pointer-y', '0px');
    element.style.setProperty('--ambient-pointer-tilt', '0deg');
  }
}
