// src/utils/dom.ts — Type-safe DOM helpers

export const $ = <T extends Element>(sel: string, ctx: ParentNode = document): T | null =>
  ctx.querySelector<T>(sel);

export const $$ = <T extends Element>(sel: string, ctx: ParentNode = document): T[] =>
  [...ctx.querySelectorAll<T>(sel)];

export function debounce<T extends (...args: unknown[]) => void>(fn: T, wait = 200) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export function on<K extends keyof HTMLElementEventMap>(
  el: Element | Window | Document | null,
  event: K,
  handler: (e: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions
): void {
  el?.addEventListener(event as string, handler as EventListener, options);
}
