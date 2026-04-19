/* ============================================
   MIC & MAC — AUTH MODAL JS
   Controls modal open/close, step switching,
   email pre-fill, and link interception
   ============================================ */
(function () {
  'use strict';

  const MODAL_ID     = 'AuthModal';
  const BACKDROP_ID  = 'AuthModalBackdrop';
  const CLOSE_ID     = 'AuthModalClose';
  const TOGGLE_CLASS = '[data-auth-toggle]';
  const EMAIL_KEY    = 'mm_last_email';
  const EMAIL_INPUT  = 'AuthEmailInput';

  const modal       = document.getElementById(MODAL_ID);
  const backdrop    = document.getElementById(BACKDROP_ID);
  const closeBtn    = document.getElementById(CLOSE_ID);
  const stepLogin   = document.getElementById('AuthStepLogin');
  const stepReg     = document.getElementById('AuthStepRegister');
  const toRegBtn    = document.getElementById('SwitchToRegister');
  const toLoginBtn  = document.getElementById('SwitchToLogin');

  if (!modal) return;

  /* ── Open / Close ── */
  function openModal(step) {
    showStep(step || 'login');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (step !== 'register') {
      const emailInput = document.getElementById(EMAIL_INPUT);
      if (emailInput) {
        const lastEmail = localStorage.getItem(EMAIL_KEY) || '';
        if (lastEmail) emailInput.value = lastEmail;
        setTimeout(() => emailInput.focus(), 80);
      }
    } else {
      const firstInput = document.getElementById('AuthRegFirstName');
      if (firstInput) setTimeout(() => firstInput.focus(), 80);
    }
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Reset to login step on close
    setTimeout(() => showStep('login'), 350);
  }

  /* ── Step Switching ── */
  function showStep(step) {
    if (!stepLogin || !stepReg) return;
    if (step === 'register') {
      stepLogin.style.display = 'none';
      stepReg.style.display   = 'block';
    } else {
      stepLogin.style.display = 'block';
      stepReg.style.display   = 'none';
    }
  }

  toRegBtn   && toRegBtn.addEventListener('click',  () => showStep('register'));
  toLoginBtn && toLoginBtn.addEventListener('click', () => showStep('login'));

  /* ── Save email on submit ── */
  const loginForm = document.getElementById('AuthLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', () => {
      const emailInput = document.getElementById(EMAIL_INPUT);
      if (emailInput && emailInput.value) {
        localStorage.setItem(EMAIL_KEY, emailInput.value);
      }
    });
  }

  /* ── Intercept account/login & account/register links ── */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href') || '';
    // Match /account/login and /account/register (but not already anchored inside modal)
    const isLoginLink    = href.includes('/account/login')    || href.includes('/account/sign_in');
    const isRegisterLink = href.includes('/account/register') || href.includes('/account/sign_up');

    if (isLoginLink || isRegisterLink) {
      // Don't intercept links inside the modal itself
      if (link.closest('#AuthModal')) return;
      e.preventDefault();
      openModal(isRegisterLink ? 'register' : 'login');
    }
  });

  /* ── Trigger buttons (data-auth-toggle) ── */
  document.querySelectorAll(TOGGLE_CLASS).forEach((btn) => {
    btn.addEventListener('click', () => openModal('login'));
  });

  /* ── Password Visibility Toggle ── */
  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('[data-password-toggle]');
    if (!toggle) return;

    const wrapper = toggle.closest('.auth-modal__input-wrapper, .auth-page__input-wrapper, .minimal-auth-input-wrapper');
    if (!wrapper) return;

    const input    = wrapper.querySelector('input');
    const eyeOpen   = toggle.querySelector('.eye-open');
    const eyeClosed = toggle.querySelector('.eye-closed');

    if (input.type === 'password') {
      input.type = 'text';
      eyeOpen.style.display   = 'none';
      eyeClosed.style.display = 'block';
      toggle.setAttribute('aria-label', 'Hide password');
    } else {
      input.type = 'password';
      eyeOpen.style.display   = 'block';
      eyeClosed.style.display = 'none';
      toggle.setAttribute('aria-label', 'Show password');
    }
  });

  /* ── Close actions ── */
  closeBtn && closeBtn.addEventListener('click', closeModal);
  backdrop && backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  /* ── Auto-open on Shopify login/register errors ── */
  const hasError = modal.querySelector('.auth-modal__error');
  if (hasError) {
    // Detect which step had the error
    const regError = stepReg && stepReg.querySelector('.auth-modal__error');
    requestAnimationFrame(() => openModal(regError ? 'register' : 'login'));
  }
})();
