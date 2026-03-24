/**
 * contact.ts
 * Contact form enhancements:
 *  - Submit button loading state
 *  - Client-side validation messages
 *  - Character counter on message field
 */

export class Contact {
  constructor() {
    const form = document.getElementById('ContactForm') as HTMLFormElement | null;
    if (!form) return;

    this._initSubmitState(form);
    this._initCharCounter();
  }

  private _initSubmitState(form: HTMLFormElement): void {
    form.addEventListener('submit', () => {
      const btn = document.getElementById('ContactSubmit') as HTMLButtonElement;
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending…';
      }
    });
  }

  private _initCharCounter(): void {
    const textarea = document.getElementById('ContactMessage') as HTMLTextAreaElement;
    if (!textarea) return;

    const MAX = 2000;
    const counter = document.createElement('p');
    counter.className = 'char-counter';
    counter.style.cssText = 'font-size:var(--text-xs);color:var(--color-text-light);text-align:right;margin-top:4px';
    textarea.parentNode?.appendChild(counter);

    const update = () => {
      const remaining = MAX - textarea.value.length;
      counter.textContent = `${remaining} characters remaining`;
      counter.style.color = remaining < 50 ? 'var(--color-burgundy)' : 'var(--color-text-light)';
    };

    textarea.addEventListener('input', update);
    update();
  }
}
