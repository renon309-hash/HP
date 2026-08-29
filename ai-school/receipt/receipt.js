import {
    EVENT_DATE,
    EVENT_PRICE,
    INVOICE_REGISTRATION_NUMBER,
    PAYMENT_METHODS,
    buildReceiptModel,
    isInvoiceRegistrationNumberValid
} from './receipt-config.js';

const form = document.getElementById('receipt-form');
const updateButton = document.getElementById('receipt-update');
const printButton = document.getElementById('receipt-print');
const registrationWarning = document.getElementById('registration-warning');
const paymentMethod = document.getElementById('payment-method');
const notes = document.getElementById('notes');

const preview = {
    invoiceNumber: document.getElementById('preview-invoice-number'),
    recipient: document.getElementById('preview-recipient'),
    companyRow: document.getElementById('preview-company-row'),
    companyName: document.getElementById('preview-company-name'),
    paymentDate: document.getElementById('preview-payment-date'),
    issueDate: document.getElementById('preview-issue-date'),
    paymentMethod: document.getElementById('preview-payment-method'),
    notes: document.getElementById('preview-notes'),
    eventDate: document.getElementById('preview-event-date'),
    transaction: document.getElementById('preview-transaction'),
    price: document.getElementById('preview-price'),
    taxRate: document.getElementById('preview-tax-rate'),
    taxableAmount: document.getElementById('preview-taxable-amount'),
    taxAmount: document.getElementById('preview-tax-amount'),
    issuer: document.getElementById('preview-issuer'),
    registrationNumber: document.getElementById('preview-registration-number')
};

function formatYen(value) {
    return `${new Intl.NumberFormat('ja-JP').format(value)}円`;
}

function readFormValues() {
    return {
        invoiceNumber: document.getElementById('invoice-number').value,
        recipient: document.getElementById('recipient').value,
        companyName: document.getElementById('company-name').value,
        paymentMethod: paymentMethod.value,
        paymentDate: document.getElementById('payment-date').value,
        issueDate: document.getElementById('issue-date').value,
        notes: notes.value
    };
}

function renderReceipt() {
    const model = buildReceiptModel(readFormValues());
    preview.invoiceNumber.textContent = model.invoiceNumber;
    preview.recipient.textContent = model.recipient;
    preview.companyName.textContent = model.companyName;
    preview.companyRow.hidden = !model.companyName;
    preview.paymentDate.textContent = model.paymentDate;
    preview.issueDate.textContent = model.issueDate;
    preview.paymentMethod.textContent = model.paymentMethod;
    preview.notes.textContent = model.notes;
    preview.eventDate.textContent = model.eventDate;
    preview.transaction.textContent = model.transactionDescription;
    preview.price.textContent = `¥${new Intl.NumberFormat('ja-JP').format(model.price)}`;
    preview.taxRate.textContent = `${Math.round(model.taxRate * 100)}%`;
    preview.taxableAmount.textContent = formatYen(model.price);
    preview.taxAmount.textContent = formatYen(model.taxAmount);
    preview.issuer.textContent = model.issuerName;
    preview.registrationNumber.textContent = model.registrationNumber || '未設定（印刷不可）';
}

function applyRegistrationState() {
    const isConfigured = isInvoiceRegistrationNumberValid(INVOICE_REGISTRATION_NUMBER);
    printButton.disabled = !isConfigured;
    registrationWarning.hidden = isConfigured;
}

paymentMethod.addEventListener('change', function () {
    notes.value = PAYMENT_METHODS[paymentMethod.value].note;
    renderReceipt();
});

form.addEventListener('input', renderReceipt);
form.addEventListener('submit', function (event) {
    event.preventDefault();
    renderReceipt();
});

updateButton.addEventListener('click', renderReceipt);
printButton.addEventListener('click', function () {
    if (!isInvoiceRegistrationNumberValid(INVOICE_REGISTRATION_NUMBER)) {
        registrationWarning.hidden = false;
        registrationWarning.focus();
        return;
    }
    renderReceipt();
    window.print();
});

document.getElementById('payment-date').value = EVENT_DATE;
document.getElementById('issue-date').value = EVENT_DATE;
document.getElementById('preview-price').textContent = `¥${new Intl.NumberFormat('ja-JP').format(EVENT_PRICE)}`;
notes.value = PAYMENT_METHODS[paymentMethod.value].note;
applyRegistrationState();
renderReceipt();

