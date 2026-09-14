import { registerSW } from 'virtual:pwa-register';

let registered = false;

export function registerLearnPwa(): void {
  if (registered || typeof window === 'undefined') {
    return;
  }
  registered = true;
  registerSW({ immediate: true });
}
