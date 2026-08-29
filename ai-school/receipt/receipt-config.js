export const EVENT_NAME = '初心者向け ChatGPT仕事活用講座';
export const EVENT_DATE = '2026-10-03';
export const EVENT_PRICE = 2980;
export const TAX_RATE = 0.10;
export const INVOICE_REGISTRATION_NUMBER = '';
export const ISSUER_NAME = 'OfficeKit';

export const PAYMENT_METHODS = Object.freeze({
    credit_card: Object.freeze({ label: 'クレジットカード', note: 'クレジットカードにて支払済' }),
    bank_transfer: Object.freeze({ label: '銀行振込', note: '銀行振込にて支払済' }),
    cash: Object.freeze({ label: '現金', note: '現金にて領収' })
});

export function calculateIncludedTax(price = EVENT_PRICE, taxRate = TAX_RATE) {
    return Math.round(price * taxRate / (1 + taxRate));
}

export function formatJapaneseDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    if (!match) return value || '—';
    return `${Number(match[1])}年${Number(match[2])}月${Number(match[3])}日`;
}

export function isInvoiceRegistrationNumberValid(value = INVOICE_REGISTRATION_NUMBER) {
    return /^T\d{13}$/.test(value);
}

export function buildReceiptModel(input = {}) {
    const payment = PAYMENT_METHODS[input.paymentMethod] || PAYMENT_METHODS.credit_card;
    return {
        invoiceNumber: (input.invoiceNumber || '').trim() || '—',
        recipient: (input.recipient || '').trim() || '—',
        companyName: (input.companyName || '').trim(),
        paymentMethod: payment.label,
        paymentDate: formatJapaneseDate(input.paymentDate || EVENT_DATE),
        issueDate: formatJapaneseDate(input.issueDate || EVENT_DATE),
        notes: (input.notes || '').trim() || payment.note,
        eventName: EVENT_NAME,
        eventDate: formatJapaneseDate(EVENT_DATE),
        transactionDescription: `${EVENT_NAME} 参加費`,
        price: EVENT_PRICE,
        taxRate: TAX_RATE,
        taxAmount: calculateIncludedTax(),
        issuerName: ISSUER_NAME,
        registrationNumber: INVOICE_REGISTRATION_NUMBER
    };
}

