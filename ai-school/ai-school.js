(function () {
    'use strict';

    const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/fZufZjb7Xcqe1vmcMtbfO00';
    const REGISTRATION_OPEN = true;
    const PAYMENT_METHOD_LABELS = {
        credit_card: 'クレジットカード',
        bank_transfer: '銀行振込',
        cash: '当日現金'
    };
    const navbar = document.getElementById('navbar');
    const form = document.getElementById('ai-school-form');
    const submitButton = document.getElementById('school-submit-btn');
    const successMessage = document.getElementById('school-form-success');
    const errorMessage = document.getElementById('form-error');
    const soldOutMessage = document.getElementById('school-sold-out');
    const stripePaymentButton = document.getElementById('stripe-payment-button');
    const paymentResults = {
        credit_card: document.getElementById('payment-result-card'),
        bank_transfer: document.getElementById('payment-result-bank'),
        cash: document.getElementById('payment-result-cash')
    };
    let isSubmitting = false;
    let hasStartedForm = false;

    function trackEvent(name, parameters) {
        if (typeof window.gtag === 'function') {
            window.gtag('event', name, parameters || {});
            return;
        }
        if (Array.isArray(window.dataLayer)) {
            window.dataLayer.push(Object.assign({ event: name }, parameters || {}));
        }
    }

    function setError(message) {
        errorMessage.textContent = message;
        errorMessage.hidden = !message;
    }

    function hidePaymentResults() {
        Object.values(paymentResults).forEach(function (result) {
            result.hidden = true;
        });
        stripePaymentButton.removeAttribute('href');
    }

    function showPaymentResult(paymentMethod) {
        hidePaymentResults();

        if (paymentMethod === 'credit_card') {
            stripePaymentButton.href = STRIPE_PAYMENT_LINK;
        }

        if (paymentResults[paymentMethod]) {
            paymentResults[paymentMethod].hidden = false;
        }
    }

    function applyRegistrationAvailability() {
        if (REGISTRATION_OPEN) return;

        form.hidden = true;
        soldOutMessage.hidden = false;
        document.querySelectorAll('.js-cta').forEach(function (cta) {
            cta.textContent = '満席のため受付終了';
            cta.classList.add('btn-disabled');
            cta.setAttribute('aria-disabled', 'true');
        });
    }

    window.addEventListener('scroll', function () {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (event) {
            if (anchor.classList.contains('js-cta') && !REGISTRATION_OPEN) {
                event.preventDefault();
                return;
            }
            const selector = anchor.getAttribute('href');
            if (!selector || selector === '#') return;
            const target = document.querySelector(selector);
            if (!target) return;

            event.preventDefault();
            if (anchor.classList.contains('js-cta')) {
                trackEvent('ai_school_apply_click', { link_location: anchor.closest('footer') ? 'footer' : 'page' });
            }
            const top = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight;
            window.scrollTo({ top: top, behavior: 'smooth' });
        });
    });

    if (form) {
        form.addEventListener('change', function (event) {
            if (event.target.name !== 'payment_method') return;
            trackEvent('ai_school_payment_method_select', {
                payment_method: event.target.value
            });
        });

        form.addEventListener('input', function () {
            if (!hasStartedForm) {
                hasStartedForm = true;
                trackEvent('ai_school_form_start');
            }
            setError('');
        });

        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            if (!REGISTRATION_OPEN || isSubmitting || !form.reportValidity()) return;

            const selectedPaymentMethod = form.querySelector('input[name="payment_method"]:checked')?.value;
            const submissionData = new FormData(form);
            submissionData.set(
                'payment_method',
                PAYMENT_METHOD_LABELS[selectedPaymentMethod] || selectedPaymentMethod
            );

            isSubmitting = true;
            setError('');
            hidePaymentResults();
            submitButton.disabled = true;
            submitButton.textContent = '送信中…';

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: submissionData,
                    headers: { Accept: 'application/json' }
                });

                if (!response.ok) throw new Error('Form submission failed');

                trackEvent('ai_school_form_submit_complete');
                form.hidden = true;
                successMessage.hidden = false;
                showPaymentResult(selectedPaymentMethod);
                successMessage.focus();
            } catch (error) {
                hidePaymentResults();
                isSubmitting = false;
                submitButton.disabled = false;
                submitButton.textContent = '参加を申し込む';
                setError('送信できませんでした。時間をおいて再度お試しいただくか、info@office-kit.jp へご連絡ください。');
            }
        });
    }

    stripePaymentButton.addEventListener('click', function () {
        trackEvent('ai_school_stripe_click', { amount: 2980, currency: 'JPY' });
    });

    applyRegistrationAvailability();
    trackEvent('ai_school_lp_view', { page_path: '/ai-school/' });
})();

