/**
 * IT Future 2026 — калькулятор квитків та валідація форми
 * Для студентів: використовуємо const, let, if/else та прості арифметичні операції
 */

// Ціни та промокод (не змінюються під час роботи сторінки)
const PRICE_STANDARD = 400;
const PRICE_VIP = 800;
const PROMO_CODE = "EVENT50";
const PROMO_DISCOUNT = 50;

// Відсотки знижки залежно від кількості квитків
const DISCOUNT_NONE = 0;
const DISCOUNT_MEDIUM = 10; // 3–4 квитки
const DISCOUNT_HIGH = 20; // 5 і більше

// Елементи сторінки
const form = document.getElementById("registrationForm");
const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const standardQtyInput = document.getElementById("standardQty");
const vipQtyInput = document.getElementById("vipQty");
const promoCodeInput = document.getElementById("promoCode");
const totalParticipantsEl = document.getElementById("totalParticipants");
const calculationBox = document.getElementById("calculationBox");
const calculationDetails = document.getElementById("calculationDetails");
const finalTotalEl = document.getElementById("finalTotal");
const successMessage = document.getElementById("successMessage");
const successMessageDetails = document.getElementById("successMessageDetails");
const calcOnlyBtn = document.getElementById("calcOnlyBtn");
const nameErrorEl = document.getElementById("nameError");
const emailErrorEl = document.getElementById("emailError");
const standardErrorEl = document.getElementById("standardError");
const vipErrorEl = document.getElementById("vipError");
const ticketsErrorEl = document.getElementById("ticketsError");

/**
 * Перевірка імені: мінімум 2 символи, лише літери, пробіли, дефіс
 */
function validateName(name) {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { ok: false, message: "Ім'я має містити щонайменше 2 символи." };
  }
  const namePattern = /^[\p{L}\s'-]+$/u;
  if (!namePattern.test(trimmed)) {
    return { ok: false, message: "Використовуйте лише літери, пробіли або дефіс." };
  }
  return { ok: true, message: "" };
}

/**
 * Перевірка email за допомогою простого шаблону
 */
function validateEmail(email) {
  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return { ok: false, message: "Вкажіть email." };
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmed)) {
    return { ok: false, message: "Невірний формат email (приклад: name@mail.com)." };
  }
  return { ok: true, message: "" };
}

/**
 * Перевірка кількості квитків (ціле число від 0 до 99)
 */
function validateTicketQuantity(value, fieldLabel) {
  if (value === "" || value === null) {
    return { ok: false, message: `Вкажіть кількість для «${fieldLabel}».`, number: 0 };
  }

  const quantity = Number(value);

  if (Number.isNaN(quantity) || !Number.isInteger(quantity)) {
    return { ok: false, message: `${fieldLabel}: лише цілі числа.`, number: 0 };
  }

  if (quantity < 0) {
    return { ok: false, message: `${fieldLabel}: кількість не може бути від'ємною.`, number: 0 };
  }

  if (quantity > 99) {
    return { ok: false, message: `${fieldLabel}: максимум 99 квитків.`, number: 0 };
  }

  return { ok: true, message: "", number: quantity };
}

/**
 * Загальна перевірка: хоча б один квиток
 */
function validateParticipants(standardQty, vipQty) {
  const total = standardQty + vipQty;
  if (total < 1) {
    return { ok: false, message: "Оберіть хоча б один квиток (Standard або VIP)." };
  }
  return { ok: true, message: "", total: total };
}

/**
 * Визначення відсотка знижки за кількістю квитків
 */
function getDiscountPercent(totalTickets) {
  let discountPercent = DISCOUNT_NONE;

  if (totalTickets >= 5) {
    discountPercent = DISCOUNT_HIGH;
  } else if (totalTickets >= 3 && totalTickets <= 4) {
    discountPercent = DISCOUNT_MEDIUM;
  } else {
    discountPercent = DISCOUNT_NONE;
  }

  return discountPercent;
}

/**
 * Розрахунок вартості з детальним текстовим звітом
 */
function calculateTickets(standardQty, vipQty, promoRaw) {
  const promoText = typeof promoRaw === "string" ? promoRaw : "";

  const standardSum = standardQty * PRICE_STANDARD;
  const vipSum = vipQty * PRICE_VIP;
  let subtotalBeforeDiscount = standardSum + vipSum;
  let subtotal = subtotalBeforeDiscount;
  const totalTickets = standardQty + vipQty;

  let lines = [];
  lines.push(`Квитки Standard: ${standardQty} × ${PRICE_STANDARD} грн = ${standardSum} грн`);
  lines.push(`Квитки VIP: ${vipQty} × ${PRICE_VIP} грн = ${vipSum} грн`);
  lines.push("────────────────────────────");
  lines.push(`Проміжна сума: ${subtotalBeforeDiscount} грн`);
  lines.push(`Усього квитків: ${totalTickets}`);

  const discountPercent = getDiscountPercent(totalTickets);
  let discountAmount = 0;

  if (discountPercent > 0) {
    discountAmount = (subtotalBeforeDiscount * discountPercent) / 100;
    subtotal = subtotalBeforeDiscount - discountAmount;
    lines.push(`Знижка ${discountPercent}%: −${Math.round(discountAmount)} грн`);
    lines.push(`Після відсоткової знижки: ${Math.round(subtotal)} грн`);
  } else {
    lines.push("Знижка: 0% (для 3–4 квитків — 10%, для 5+ — 20%)");
  }

  const promoTrimmed = promoText.trim().toUpperCase();
  let promoApplied = false;

  if (promoTrimmed === PROMO_CODE) {
    promoApplied = true;
    subtotal = subtotal - PROMO_DISCOUNT;
    lines.push(`Промокод ${PROMO_CODE}: −${PROMO_DISCOUNT} грн (після % знижки)`);
  } else if (promoTrimmed.length > 0) {
    lines.push(`Промокод «${promoText.trim()}» не знайдено — знижка не застосована`);
  }

  let wasClamped = false;
  if (subtotal < 0) {
    wasClamped = true;
    subtotal = 0;
  }

  const finalTotal = Math.round(subtotal);
  if (wasClamped) {
    lines.push("Увага: підсумок скориговано до 0 грн (не може бути від'ємним).");
  }
  lines.push("────────────────────────────");
  lines.push(`ДО СПЛАТИ: ${finalTotal} грн`);

  return {
    details: lines.join("\n"),
    finalTotal: finalTotal,
    promoApplied: promoApplied,
    totalTickets: totalTickets,
  };
}

function setFieldError(input, errorEl, message, isError) {
  if (isError) {
    input.classList.add("is-invalid");
    errorEl.textContent = message;
  } else {
    input.classList.remove("is-invalid");
    errorEl.textContent = "";
  }
}

function setTicketsError(message) {
  if (message) {
    ticketsErrorEl.textContent = message;
    ticketsErrorEl.classList.remove("d-none");
  } else {
    ticketsErrorEl.textContent = "";
    ticketsErrorEl.classList.add("d-none");
  }
}

function updateParticipantsHint(standardQty, vipQty) {
  const total = standardQty + vipQty;
  totalParticipantsEl.textContent = String(total);
}

function hideRegistrationSuccess() {
  successMessage.classList.add("d-none");
  successMessageDetails.textContent = "";
}

function showCalculation(result) {
  calculationDetails.textContent = result.details;
  finalTotalEl.textContent = String(result.finalTotal);
  calculationBox.classList.remove("d-none");
}

/**
 * Повідомлення після успішної відправки форми
 */
function showRegistrationSuccess(data, result) {
  const lines = [
    `Учасник: ${data.name}`,
    `Email: ${data.email}`,
    `Квитки — Standard: ${data.standardQty}, VIP: ${data.vipQty} (усього ${result.totalTickets})`,
    `До сплати: ${result.finalTotal} грн`,
  ];

  successMessageDetails.textContent = lines.join("\n");
  successMessage.classList.remove("d-none");
  successMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/**
 * Валідація лише квитків (кнопка «Лише розрахунок»)
 */
function validateTicketsSection() {
  let isValid = true;

  const standardCheck = validateTicketQuantity(standardQtyInput.value, "Standard");
  setFieldError(standardQtyInput, standardErrorEl, standardCheck.message, !standardCheck.ok);
  if (!standardCheck.ok) {
    isValid = false;
  }

  const vipCheck = validateTicketQuantity(vipQtyInput.value, "VIP");
  setFieldError(vipQtyInput, vipErrorEl, vipCheck.message, !vipCheck.ok);
  if (!vipCheck.ok) {
    isValid = false;
  }

  setTicketsError("");

  const standardQty = standardCheck.number;
  const vipQty = vipCheck.number;

  if (standardCheck.ok && vipCheck.ok) {
    const partCheck = validateParticipants(standardQty, vipQty);
    if (!partCheck.ok) {
      isValid = false;
      setTicketsError(partCheck.message);
      standardQtyInput.classList.add("is-invalid");
      vipQtyInput.classList.add("is-invalid");
    } else {
      updateParticipantsHint(standardQty, vipQty);
    }
  }

  if (!isValid) {
    hideRegistrationSuccess();
    return null;
  }

  return {
    standardQty: standardQty,
    vipQty: vipQty,
    promo: promoCodeInput.value,
  };
}

/**
 * Повна валідація форми реєстрації
 */
function validateForm() {
  let isValid = true;

  const nameCheck = validateName(fullNameInput.value);
  setFieldError(fullNameInput, nameErrorEl, nameCheck.message, !nameCheck.ok);
  if (!nameCheck.ok) {
    isValid = false;
  }

  const emailCheck = validateEmail(emailInput.value);
  setFieldError(emailInput, emailErrorEl, emailCheck.message, !emailCheck.ok);
  if (!emailCheck.ok) {
    isValid = false;
  }

  const ticketData = validateTicketsSection();
  if (ticketData === null) {
    isValid = false;
  }

  if (!isValid) {
    form.classList.add("was-validated");
    hideRegistrationSuccess();
    return null;
  }

  return {
    name: fullNameInput.value.trim(),
    email: emailInput.value.trim(),
    standardQty: ticketData.standardQty,
    vipQty: ticketData.vipQty,
    promo: ticketData.promo,
  };
}

function runCalculation(isFullRegistration) {
  let data = null;

  if (isFullRegistration) {
    data = validateForm();
  } else {
    setFieldError(fullNameInput, nameErrorEl, "", false);
    setFieldError(emailInput, emailErrorEl, "", false);
    data = validateTicketsSection();
  }

  if (data === null) {
    if (!isFullRegistration) {
      form.classList.remove("was-validated");
    }
    return;
  }

  const result = calculateTickets(data.standardQty, data.vipQty, data.promo);
  showCalculation(result);

  if (isFullRegistration) {
    showRegistrationSuccess(data, result);
  } else {
    hideRegistrationSuccess();
  }
}

function scrollToFirstInvalid() {
  const firstInvalid = form.querySelector(".is-invalid");
  if (firstInvalid) {
    firstInvalid.focus();
    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  runCalculation(true);
  if (form.querySelector(".is-invalid")) {
    scrollToFirstInvalid();
  }
});

calcOnlyBtn.addEventListener("click", function () {
  runCalculation(false);
  scrollToFirstInvalid();
});

function onQuantityChange() {
  let standardQty = Number(standardQtyInput.value);
  let vipQty = Number(vipQtyInput.value);

  if (Number.isNaN(standardQty) || standardQty < 0) {
    standardQty = 0;
  }
  if (Number.isNaN(vipQty) || vipQty < 0) {
    vipQty = 0;
  }

  updateParticipantsHint(standardQty, vipQty);

  if (standardQty + vipQty >= 1) {
    setTicketsError("");
    standardQtyInput.classList.remove("is-invalid");
    vipQtyInput.classList.remove("is-invalid");
  }
}

fullNameInput.addEventListener("input", function () {
  setFieldError(fullNameInput, nameErrorEl, "", false);
});

emailInput.addEventListener("input", function () {
  setFieldError(emailInput, emailErrorEl, "", false);
});

standardQtyInput.addEventListener("input", onQuantityChange);
vipQtyInput.addEventListener("input", onQuantityChange);

onQuantityChange();
