import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
    EVENT_DATE,
    EVENT_NAME,
    EVENT_PRICE,
    INVOICE_REGISTRATION_NUMBER,
    ISSUER_NAME,
    TAX_RATE,
    buildReceiptModel,
    calculateIncludedTax,
    isInvoiceRegistrationNumberValid
} from '../ai-school/receipt/receipt-config.js';

const html = await readFile(new URL('../ai-school/receipt/index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../ai-school/receipt/receipt.css', import.meta.url), 'utf8');
const script = await readFile(new URL('../ai-school/receipt/receipt.js', import.meta.url), 'utf8');

assert.equal(EVENT_NAME, '初心者向け ChatGPT仕事活用講座');
assert.equal(EVENT_DATE, '2026-10-03');
assert.equal(EVENT_PRICE, 2980);
assert.equal(TAX_RATE, 0.10);
assert.equal(calculateIncludedTax(), 271);
assert.equal(ISSUER_NAME, 'OfficeKit');
assert.equal(INVOICE_REGISTRATION_NUMBER, '');
assert.equal(isInvoiceRegistrationNumberValid(), false);
assert.equal(isInvoiceRegistrationNumberValid('T1234567890123'), true);

const model = buildReceiptModel({
    invoiceNumber: 'AI-20261003-08',
    recipient: '株式会社○○ 御中',
    companyName: '株式会社○○',
    paymentMethod: 'bank_transfer',
    paymentDate: '2026-08-29',
    issueDate: '2026-10-03',
    notes: '銀行振込にて支払済'
});

assert.equal(model.recipient, '株式会社○○ 御中');
assert.equal(model.companyName, '株式会社○○');
assert.equal(model.paymentMethod, '銀行振込');
assert.equal(model.paymentDate, '2026年8月29日');
assert.equal(model.eventDate, '2026年10月3日');
assert.equal(model.price, 2980);
assert.equal(model.taxRate, 0.10);
assert.equal(model.taxAmount, 271);
assert.equal(model.transactionDescription, '初心者向け ChatGPT仕事活用講座 参加費');
assert.equal(model.issuerName, 'OfficeKit');
assert.equal(model.registrationNumber, '');

assert.match(html, /領収書兼適格請求書/);
assert.match(html, /AI仕事活用教室 参加費/);
assert.match(html, /id="recipient"[^>]*required/);
assert.match(html, /id="company-name"/);
assert.match(html, /id="payment-method"/);
assert.match(html, /id="payment-date"[^>]*value="2026-10-03"/);
assert.match(html, /id="issue-date"[^>]*value="2026-10-03"/);
assert.match(html, /officekit_soft_box_horizontal\.png/);
assert.match(html, /適格請求書発行事業者登録番号/);
assert.match(html, /適格請求書発行事業者登録番号が設定されていません。/);
assert.match(html, /id="receipt-print"[^>]*disabled/);
assert.match(html, /上記金額を確かに領収しました。/);
assert.match(html, /type="module" src="receipt\.js/);

assert.match(script, /window\.print\(\)/);
assert.match(script, /printButton\.disabled = !isConfigured/);
assert.doesNotMatch(script, /localStorage|sessionStorage|document\.cookie/);
assert.doesNotMatch(script, /sk_live_|rk_live_|whsec_/);

assert.match(css, /@page\s*{[\s\S]*size:\s*A4 portrait/);
assert.match(css, /@media print/);
assert.match(css, /\.no-print\s*{[\s\S]*display:\s*none !important/);
assert.match(css, /max-height:\s*277mm/);
assert.match(css, /page-break-inside:\s*avoid/);

console.log('AI school receipt tests passed.');

