/**
 * auth.ts
 * Login / register / recover form enhancements:
 *  - Show/hide password toggle
 *  - Real-time password strength for register
 *  - Auto-focus & smooth error scrolling
 */

export class Auth {
  constructor() {
    this._initPasswordToggle();
    this._initPasswordStrength();
    this._scrollToErrors();
  }

  private _initPasswordToggle(): void {
    document.querySelectorAll<HTMLInputElement>('input[type="password"]').forEach(input => {
      const wrapper = document.createElement('div');
      wrapper.className = 'password-input-wrapper';
      input.parentNode?.insertBefore(wrapper, input);
      wrapper.appendChild(input);

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'password-toggle';
      toggle.setAttribute('aria-label', 'Show password');
      toggle.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
      wrapper.appendChild(toggle);

      toggle.addEventListener('click', () => {
        const isText = input.type === 'text';
        input.type = isText ? 'password' : 'text';
        toggle.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');
        toggle.style.opacity = isText ? '0.5' : '1';
      });
    });
  }

  private _initPasswordStrength(): void {
    const input = document.querySelector<HTMLInputElement>('#RegisterPassword');
    if (!input) return;

    const bar = document.createElement('div');
    bar.className = 'password-strength';
    bar.innerHTML = `<div class="password-strength__track"><div class="password-strength__fill" id="PasswordStrengthFill"></div></div><span class="password-strength__label" id="PasswordStrengthLabel"></span>`;
    input.closest('.form-group')?.appendChild(bar);

    const fill  = document.getElementById('PasswordStrengthFill')!;
    const label = document.getElementById('PasswordStrengthLabel')!;

    input.addEventListener('input', () => {
      const score = this._scorePassword(input.value);
      const configs = [
        { pct: 20, color: '#e74c3c', text: 'Very weak' },
        { pct: 40, color: '#e67e22', text: 'Weak'      },
        { pct: 60, color: '#f1c40f', text: 'Fair'      },
        { pct: 80, color: '#27ae60', text: 'Strong'    },
        { pct: 100, color: '#16a085', text: 'Very strong' },
      ];
      const cfg = configs[score] || configs[0];
      fill.style.width  = cfg.pct + '%';
      fill.style.background = cfg.color;
      label.textContent = input.value ? cfg.text : '';
    });
  }

  private _scorePassword(password: string): number {
    let score = 0;
    if (password.length >= 8)  score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score - 1, 4);
  }

  private _scrollToErrors(): void {
    const error = document.querySelector<HTMLElement>('.form-error');
    if (error) {
      setTimeout(() => error.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }
}
