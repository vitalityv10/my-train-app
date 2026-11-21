const MONTHS_GENITIVE = [
  "січня",
  "лютого",
  "березня",
  "квітня",
  "травня",
  "червня",
  "липня",
  "серпня",
  "вересня",
  "жовтня",
  "листопада",
  "грудня",
];

const MONTHS_SHORT = [
  "січ.",
  "лют.",
  "бер.",
  "квіт.",
  "трав.",
  "черв.",
  "лип.",
  "серп.",
  "вер.",
  "жовт.",
  "лист.",
  "груд.",
];

export function parseDateSafe(input) {
  if (!input) return null;
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input;
  }
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.trim())) {
    const [y, m, d] = input.trim().split("-").map(Number);
    const localDate = new Date(y, m - 1, d);
    return Number.isNaN(localDate.getTime()) ? null : localDate;
  }
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateUk(input, { short = false, includeYear = true } = {}) {
  const date = parseDateSafe(input);
  if (!date) return "";
  const day = date.getDate();
  const monthIdx = date.getMonth();
  const year = date.getFullYear();
  const monthName = short ? MONTHS_SHORT[monthIdx] : MONTHS_GENITIVE[monthIdx];
  return includeYear ? `${day} ${monthName} ${year}` : `${day} ${monthName}`;
}

export function formatTimeUk(input) {
  const date = parseDateSafe(input);
  if (!date) return "";
  return date.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function localizeTrainType(type) {
  if (!type) return "Пасажирський";
  const normalized = String(type).toLowerCase();
  if (normalized === "day") return "Денний";
  if (normalized === "night") return "Нічний";
  return type;
}
