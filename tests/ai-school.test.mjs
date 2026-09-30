import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html = await readFile(new URL('../ai-school/index.html', import.meta.url), 'utf8');
const script = await readFile(new URL('../ai-school/ai-school.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../ai-school/ai-school.css', import.meta.url), 'utf8');
const home = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const publicSource = `${html}\n${script}`;

assert.match(html, /<title>浅草・蔵前 AI仕事活用教室｜OfficeKit<\/title>/);
assert.match(html, /<link rel="canonical" href="https:\/\/office-kit\.jp\/ai-school\/">/);
assert.match(html, /<meta name="description" content="[^"]*次回開催/);
assert.match(html, /<meta property="og:description" content="[^"]*次回開催/);
assert.match(html, /次回開催準備中/);
assert.match(html, /初心者向け ChatGPT仕事活用講座/);
assert.match(html, /現在、次回開催に向けて[\s\S]*内容・日程を準備しています。/);

assert.match(html, /難しい「プロンプト」は覚えません。/);
assert.match(html, /画面を見せる。/);
assert.match(html, /話しかける。/);
assert.match(html, /資料を渡す。/);
assert.equal((html.match(/class="skill-card"/g) || []).length, 3);
assert.equal((html.match(/<article><h3>/g) || []).length, 6);
assert.match(html, /id="recommended-title"/);
assert.match(html, /<h2 id="program-title"[^>]*>講座内容（予定）<\/h2>/);
assert.equal((html.match(/<li><strong>/g) || []).length, 8);
assert.match(html, /次回開催時には内容が変更になる場合があります/);

assert.match(html, /<h2 id="operator-title"[^>]*>講師紹介<\/h2>/);
assert.match(html, /<h3>長谷川<\/h3>/);
assert.match(html, /普段は税理士法人で/);
assert.match(html, /少人数での開催を予定/);
assert.match(html, /個人情報・顧客情報・パスワード・機密情報/);

assert.match(html, /<h2 id="overview-title"[^>]*>次回開催 準備中<\/h2>/);
assert.match(html, /<dt>開催日<\/dt><dd>未定<\/dd>/);
assert.match(html, /浅草・蔵前・浅草橋周辺を予定/);
assert.match(html, /小規模事業者・個人事業主・会社員など/);
assert.match(html, /次回開催時にご案内します/);
assert.match(html, /id="next-session"/);
assert.match(html, /次回開催を準備しています/);

assert.equal((html.match(/<details>/g) || []).length, 4);
assert.match(html, /ChatGPT初心者でも参加できますか？/);
assert.match(html, /パソコンが得意でなくても参加できますか？/);
assert.match(html, /ChatGPTの有料プランは必要ですか？/);
assert.match(html, /どのような内容を学びますか？/);

assert.doesNotMatch(html, /<form\b|id="registration"|formsubmit\.co|stripe-payment-button|参加を申し込む|講座に申し込む/);
assert.doesNotMatch(html, /"@type"\s*:\s*"Event"|startDate|endDate|maximumAttendeeCapacity/);
assert.doesNotMatch(publicSource, /2026年10月3日|2026-10-03|10\/3|2,980円|2980|4,980円|4980|ルーク会議室|10:00|9:45/);
assert.doesNotMatch(html, /満席|受付終了|予約が入らなかった|参加者が集まらなかった/);
assert.doesNotMatch(html, /事前登録|メルマガ|LINE登録/);

assert.match(script, /const REGISTRATION_OPEN = false/);
assert.match(script, /if \(!REGISTRATION_OPEN \|\| isSubmitting \|\| !form\.reportValidity\(\)\) return/);
assert.match(script, /if \(stripePaymentButton\)/);
assert.match(script, /event\.preventDefault\(\);[\s\S]*stripePaymentButton\.removeAttribute\('href'\)/);
assert.doesNotMatch(script, /sk_live_|rk_live_|whsec_/);

assert.match(css, /\.three-skills-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,/);
assert.match(css, /@media \(max-width: 768px\)[\s\S]*\.three-skills-grid,[\s\S]*grid-template-columns:\s*1fr/);
assert.match(css, /\.program-list/);
assert.match(css, /\.next-session-card/);
assert.match(home, /href="ai-school\/"/);

assert.ok(html.indexOf('id="three-skills-title"') < html.indexOf('id="use-cases-title"'));
assert.ok(html.indexOf('id="use-cases-title"') < html.indexOf('id="recommended-title"'));
assert.ok(html.indexOf('id="recommended-title"') < html.indexOf('id="program-title"'));
assert.ok(html.indexOf('id="program-title"') < html.indexOf('id="operator-title"'));
assert.ok(html.indexOf('id="operator-title"') < html.indexOf('id="reassurance-title"'));
assert.ok(html.indexOf('id="reassurance-title"') < html.indexOf('id="course-overview"'));
assert.ok(html.indexOf('id="course-overview"') < html.indexOf('id="faq-title"'));
assert.ok(html.indexOf('id="faq-title"') < html.indexOf('id="next-session"'));

function createElement() {
    const listeners = {};
    return {
        hidden: false,
        href: '',
        listeners,
        classList: { add() {}, toggle() {} },
        addEventListener(type, listener) { listeners[type] = listener; },
        removeAttribute(name) { if (name === 'href') this.href = ''; },
        setAttribute() {}
    };
}

function runClosedRegistrationScenario() {
    const navbar = createElement();
    const form = createElement();
    const stripeButton = createElement();
    stripeButton.href = 'https://example.invalid/payment';
    let fetchCalls = 0;
    let stripeNavigationPrevented = false;

    const elements = {
        navbar,
        'ai-school-form': form,
        'stripe-payment-button': stripeButton
    };
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
    const fetch = async () => {
        fetchCalls += 1;
        return { ok: true };
    };

    vm.runInNewContext(script, { document, window, FormData, fetch, console });
    form.listeners.submit({ preventDefault() {} });
    stripeButton.listeners.click({ preventDefault() { stripeNavigationPrevented = true; } });

    return { form, stripeButton, fetchCalls, stripeNavigationPrevented, events: window.dataLayer };
}

const closed = runClosedRegistrationScenario();
assert.equal(closed.form.hidden, true);
assert.equal(closed.fetchCalls, 0);
assert.equal(closed.stripeNavigationPrevented, true);
assert.equal(closed.stripeButton.href, '');
assert.equal(closed.events.some(item => item.event === 'ai_school_lp_view'), true);

function runPageWithoutRegistrationMarkup() {
    const navbar = createElement();
    const document = {
        getElementById(id) { return id === 'navbar' ? navbar : null; },
        querySelectorAll() { return []; },
        querySelector() { return null; }
    };
    const window = { addEventListener() {}, dataLayer: [], scrollY: 0, scrollTo() {} };
    assert.doesNotThrow(() => vm.runInNewContext(script, { document, window, FormData, fetch: async () => ({ ok: true }), console }));
}

runPageWithoutRegistrationMarkup();

console.log('AI school evergreen-page tests passed.');
