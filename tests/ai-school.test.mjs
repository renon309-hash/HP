import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html = await readFile(new URL('../ai-school/index.html', import.meta.url), 'utf8');
const script = await readFile(new URL('../ai-school/ai-school.js', import.meta.url), 'utf8');
const home = await readFile(new URL('../index.html', import.meta.url), 'utf8');

assert.match(html, /<title>浅草・蔵前 AI仕事活用教室｜OfficeKit<\/title>/);
assert.match(html, /<link rel="canonical" href="https:\/\/office-kit\.jp\/ai-school\/">/);
assert.match(html, /name="description"/);
assert.match(html, /id="registration"/);
assert.equal((html.match(/class="[^"]*js-cta/g) || []).length >= 3, true);
assert.match(html, /2026年10月3日（土）10:00〜12:00/);
assert.match(html, /受付開始 9:45/);
assert.match(html, /<strong>8名<\/strong>/);
assert.match(html, /<del>4,980円（税込）<\/del>/);
assert.match(html, /<strong>2,980円（税込）<\/strong>/);
assert.match(html, /ルーク会議室/);
assert.match(html, /東京都台東区柳橋2-1-11/);
assert.doesNotMatch(html, /次回開催日は現在調整中|事前登録/);
assert.match(html, /"@type": "Event"/);
assert.match(html, /"startDate": "2026-10-03T10:00:00\+09:00"/);
assert.match(html, /"maximumAttendeeCapacity": 8/);
assert.match(html, /【OfficeKit】10\/3 AI仕事活用教室 参加申込/);
assert.match(html, /name="name"[^>]*required/);
assert.match(html, /name="company_name"/);
assert.doesNotMatch(html, /name="company_name"[^>]*required/);
assert.match(html, /name="email"[^>]*required/);
assert.match(html, /name="industry"[^>]*required/);
assert.match(html, /name="ai_experience"[^>]*required/);
assert.match(html, /name="problem"[^>]*required/);
assert.match(html, /name="payment_method" value="credit_card"[^>]*required/);
assert.match(html, /name="payment_method" value="bank_transfer"/);
assert.match(html, /name="payment_method" value="cash"/);
assert.doesNotMatch(html, /name="interested_in_consultation"[^>]*required/);
assert.ok(html.indexOf('name="name"') < html.indexOf('name="company_name"'));
assert.ok(html.indexOf('name="company_name"') < html.indexOf('name="email"'));
assert.ok(html.indexOf('name="interested_in_consultation"') < html.indexOf('name="payment_method"'));
assert.match(html, /id="payment-result-card"[^>]*hidden/);
assert.match(html, /id="payment-result-bank"[^>]*hidden/);
assert.match(html, /id="payment-result-cash"[^>]*hidden/);
assert.match(html, /id="stripe-payment-button"/);
assert.doesNotMatch(html, /buy\.stripe\.com/);
assert.match(script, /if \(!REGISTRATION_OPEN \|\| isSubmitting \|\| !form\.reportValidity\(\)\) return/);
assert.match(script, /submitButton\.disabled = true/);
assert.match(script, /ai_school_form_submit_complete/);
assert.match(script, /ai_school_apply_click/);
assert.match(script, /const STRIPE_PAYMENT_LINK = 'https:\/\/buy\.stripe\.com\/fZufZjb7Xcqe1vmcMtbfO00'/);
assert.match(script, /const REGISTRATION_OPEN = true/);
assert.match(script, /ai_school_payment_method_select/);
assert.match(script, /ai_school_stripe_click/);
assert.match(script, /if \(paymentMethod === 'credit_card'\)/);
assert.match(script, /stripePaymentButton\.href = STRIPE_PAYMENT_LINK/);
assert.match(script, /showPaymentResult\(selectedPaymentMethod\)/);
assert.doesNotMatch(script, /sk_live_|rk_live_|whsec_/);
assert.match(home, /href="ai-school\/"/);

function createElement(initialHidden = false) {
    const listeners = {};
    const attributes = {};
    return {
        hidden: initialHidden,
        disabled: false,
        textContent: '',
        href: '',
        listeners,
        classList: { add() {}, toggle() {} },
        addEventListener(type, listener) { listeners[type] = listener; },
        removeAttribute(name) {
            delete attributes[name];
            if (name === 'href') this.href = '';
        },
        setAttribute(name, value) { attributes[name] = value; },
        focus() { this.focused = true; }
    };
}

async function runPaymentScenario(selectedPaymentMethod, responseOk) {
    const elements = {
        navbar: createElement(),
        'school-submit-btn': createElement(),
        'school-form-success': createElement(true),
        'form-error': createElement(true),
        'school-sold-out': createElement(true),
        'stripe-payment-button': createElement(),
        'payment-result-card': createElement(true),
        'payment-result-bank': createElement(true),
        'payment-result-cash': createElement(true)
    };
    const form = createElement();
    form.action = 'https://formsubmit.co/example';
    form.reportValidity = () => true;
    form.querySelector = (selector) => selector.includes(':checked')
        ? { value: selectedPaymentMethod }
        : null;
    elements['ai-school-form'] = form;

    let submittedData;
    class FakeFormData {
        constructor() {
            this.values = new Map([
                ['company_name', '株式会社テスト'],
                ['payment_method', selectedPaymentMethod]
            ]);
        }
        get(name) { return this.values.get(name); }
        set(name, value) { this.values.set(name, value); }
    }

    const document = {
        getElementById(id) { return elements[id] || null; },
        querySelectorAll() { return []; },
        querySelector() { return null; }
    };
    const window = {
        addEventListener() {},
        dataLayer: [],
        scrollY: 0,
        scrollTo() {}
    };
    const fetch = async (_url, options) => {
        submittedData = options.body;
        return { ok: responseOk };
    };

    vm.runInNewContext(script, { document, window, FormData: FakeFormData, fetch, console });
    await form.listeners.submit({ preventDefault() {} });

    return {
        cardHidden: elements['payment-result-card'].hidden,
        bankHidden: elements['payment-result-bank'].hidden,
        cashHidden: elements['payment-result-cash'].hidden,
        stripeHref: elements['stripe-payment-button'].href,
        formHidden: form.hidden,
        successHidden: elements['school-form-success'].hidden,
        errorHidden: elements['form-error'].hidden,
        submittedCompanyName: submittedData.get('company_name'),
        submittedPaymentMethod: submittedData.get('payment_method')
    };
}

const creditResult = await runPaymentScenario('credit_card', true);
assert.equal(creditResult.cardHidden, false);
assert.equal(creditResult.bankHidden, true);
assert.equal(creditResult.cashHidden, true);
assert.equal(creditResult.stripeHref, 'https://buy.stripe.com/fZufZjb7Xcqe1vmcMtbfO00');
assert.equal(creditResult.submittedCompanyName, '株式会社テスト');
assert.equal(creditResult.submittedPaymentMethod, 'クレジットカード');

const bankResult = await runPaymentScenario('bank_transfer', true);
assert.equal(bankResult.cardHidden, true);
assert.equal(bankResult.bankHidden, false);
assert.equal(bankResult.cashHidden, true);
assert.equal(bankResult.stripeHref, '');
assert.equal(bankResult.submittedPaymentMethod, '銀行振込');

const cashResult = await runPaymentScenario('cash', true);
assert.equal(cashResult.cardHidden, true);
assert.equal(cashResult.bankHidden, true);
assert.equal(cashResult.cashHidden, false);
assert.equal(cashResult.stripeHref, '');
assert.equal(cashResult.submittedPaymentMethod, '当日現金');

const failedResult = await runPaymentScenario('credit_card', false);
assert.equal(failedResult.cardHidden, true);
assert.equal(failedResult.bankHidden, true);
assert.equal(failedResult.cashHidden, true);
assert.equal(failedResult.stripeHref, '');
assert.equal(failedResult.formHidden, false);
assert.equal(failedResult.successHidden, true);
assert.equal(failedResult.errorHidden, false);

console.log('AI school tests passed.');

