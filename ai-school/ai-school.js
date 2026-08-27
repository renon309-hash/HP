(function () {
    'use strict';

    const navbar = document.getElementById('navbar');
    const form = document.getElementById('ai-school-form');
    const submitButton = document.getElementById('school-submit-btn');
    const successMessage = document.getElementById('school-form-success');
    const errorMessage = document.getElementById('form-error');
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

    window.addEventListener('scroll', function () {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (event) {
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
        form.addEventListener('input', function () {
            if (!hasStartedForm) {
                hasStartedForm = true;
                trackEvent('ai_school_form_start');
            }
            setError('');
        });

        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            if (isSubmitting || !form.reportValidity()) return;

            isSubmitting = true;
            setError('');
            submitButton.disabled = true;
            submitButton.textContent = '送信中…';

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { Accept: 'application/json' }
                });

                if (!response.ok) throw new Error('Form submission failed');

                trackEvent('ai_school_form_submit_complete');
                form.hidden = true;
                successMessage.hidden = false;
                successMessage.focus();
            } catch (error) {
                isSubmitting = false;
                submitButton.disabled = false;
                submitButton.textContent = '参加を申し込む';
                setError('送信できませんでした。時間をおいて再度お試しいただくか、info@office-kit.jp へご連絡ください。');
            }
        });
    }

    trackEvent('ai_school_lp_view', { page_path: '/ai-school/' });
})();

