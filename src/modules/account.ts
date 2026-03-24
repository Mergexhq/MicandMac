/**
 * account.ts
 * Account dashboard interactive features:
 *  - Inline address form toggle (show/hide without page reload)
 *  - Delete address confirmation prompt
 *  - Set default address — optimistic UI
 */

export class Account {
  constructor() {
    this._initAddressDelete();
  }

  private _initAddressDelete(): void {
    document.querySelectorAll<HTMLFormElement>('[id^="DeleteAddressForm-"]').forEach(form => {
      form.addEventListener('submit', (e: Event) => {
        if (!confirm('Remove this address?')) {
          e.preventDefault();
        }
      });
    });
  }
}
