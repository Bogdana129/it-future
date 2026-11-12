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
const calcOnlyBtn = document.getElementById("calcOnlyBtn");

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
  const standardSum = standardQty * PRICE_STANDARD;
  const vipSum = vipQty * PRICE_VIP;
  let subtotal = standardSum + vipSum;
  const totalTickets = standardQty + vipQty;

  let lines = [];
  lines.push(`Квитки Standard: ${standardQty} × ${PRICE_STANDARD} грн = ${standardSum} грн`);
  lines.push(`Квитки VIP: ${vipQty} × ${PRICE_VIP} грн = ${vipSum} грн`);
  lines.push(`────────────────────────────`);
  lines.push(`Проміжна сума: ${subtotal} грн`);
  lines.push(`Усього квитків: ${totalTickets}`);

  const discountPercent = getDiscountPercent(totalTickets);
  let discountAmount = 0;

  if (discountPercent > 0) {
    discountAmount = (subtotal * discountPercent) / 100;
    subtotal = subtotal - discountAmount;
    lines.push(`Знижка ${discountPercent}%: −${Math.round(discountAmount)} грн`);
    lines.push(`Після знижки: ${Math.round(subtotal)} грн`);
  } else {
    lines.push(`Знижка: 0% (потрібно 3+ квитки для знижки)`);
  }

  let promoApplied = false;
  const promoTrimmed = promoRaw.trim().toUpperCase();

  if (promoTrimmed === PROMO_CODE) {
    promoApplied = true;
    subtotal = subtotal - PROMO_DISCOUNT;
    lines.push(`Промокод ${PROMO_CODE}: −${PROMO_DISCOUNT} грн`);
  } else if (promoTrimmed.length > 0) {
    lines.push(`Промокод «${promoRaw.trim()}» не знайдено (знижка не застосована)`);
  }

  if (subtotal < 0) {
    subtotal = 0;
    lines.push(`Підсумок скориговано: сума не може бути від'ємною → 0 грн`);
  }

  const finalTotal = Math.round(subtotal);
  lines.push(`────────────────────────────`);
  lines.push(`ДО СПЛАТИ: ${finalTotal} грн`);

  return {
    details: lines.join("\n"),
    finalTotal: finalTotal,
    promoApplied: promoApplied,
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

function updateParticipantsHint(standardQty, vipQty) {
  const total = standardQty + vipQty;
  totalParticipantsEl.textContent = String(total);
}

function showCalculation(result) {
  calculationDetails.textContent = result.details;
  finalTotalEl.textContent = String(result.finalTotal);
  calculationBox.classList.remove("d-none");
  successMessage.classList.add("d-none");
}

/**
 * Повна валідація форми; повертає об'єкт з даними або null
 */
function validateForm() {
  let isValid = true;

  const nameCheck = validateName(fullNameInput.value);
  setFieldError(fullNameInput, document.getElementById("nameError"), nameCheck.message, !nameCheck.ok);
  if (!nameCheck.ok) {
    isValid = false;
  }

  const emailCheck = validateEmail(emailInput.value);
  setFieldError(emailInput, document.getElementById("emailError"), emailCheck.message, !emailCheck.ok);
  if (!emailCheck.ok) {
    isValid = false;
  }

  const standardCheck = validateTicketQuantity(standardQtyInput.value, "Standard");
  setFieldError(
    standardQtyInput,
    document.getElementById("standardError"),
    standardCheck.message,
    !standardCheck.ok
  );
  if (!standardCheck.ok) {
    isValid = false;
  }

  const vipCheck = validateTicketQuantity(vipQtyInput.value, "VIP");
  setFieldError(vipQtyInput, document.getElementById("vipError"), vipCheck.message, !vipCheck.ok);
  if (!vipCheck.ok) {
    isValid = false;
  }

  let standardQty = standardCheck.number;
  let vipQty = vipCheck.number;

  if (standardCheck.ok && vipCheck.ok) {
    const partCheck = validateParticipants(standardQty, vipQty);
    if (!partCheck.ok) {
      isValid = false;
      setFieldError(standardQtyInput, document.getElementById("standardError"), partCheck.message, true);
      setFieldError(vipQtyInput, document.getElementById("vipError"), partCheck.message, true);
    } else {
      updateParticipantsHint(standardQty, vipQty);
    }
  }

  if (!isValid) {
    return null;
  }

  return {
    name: fullNameInput.value.trim(),
    email: emailInput.value.trim(),
    standardQty: standardQty,
    vipQty: vipQty,
    promo: promoCodeInput.value,
  };
}

function runCalculation(showSuccess) {
  const data = validateForm();
  if (data === null) {
    form.classList.add("was-validated");
    return;
  }

  const result = calculateTickets(data.standardQty, data.vipQty, data.promo);
  showCalculation(result);

  if (showSuccess) {
    successMessage.classList.remove("d-none");
  }
}

// Події
form.addEventListener("submit", function (event) {
  event.preventDefault();
  runCalculation(true);
});

calcOnlyBtn.addEventListener("click", function () {
  runCalculation(false);
});

function onQuantityChange() {
  let standardQty = Number(standardQtyInput.value) || 0;
  let vipQty = Number(vipQtyInput.value) || 0;
  updateParticipantsHint(standardQty, vipQty);
}

standardQtyInput.addEventListener("input", onQuantityChange);
vipQtyInput.addEventListener("input", onQuantityChange);

// Початкове значення лічильника
onQuantityChange();
