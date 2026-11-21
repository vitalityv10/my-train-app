import { apiFetch } from "./apiClient";

const SESSION_STORAGE_KEY = "ai_chat_session_id";

export const generateSessionId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getOrCreateSessionId = () => {
  try {
    let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return generateSessionId();
  }
};

export const resetStoredSessionId = () => {
  const nextId = generateSessionId();
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, nextId);
  } catch {
    // ignore storage errors
  }
  return nextId;
};

export const setStoredSessionId = (sessionId) => {
  if (!sessionId) return;
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  } catch {
    // ignore storage errors
  }
};

export const sendAiChatMessage = async ({ sessionId, message }) => {
  return await apiFetch("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({
      sessionId,
      message,
    }),
  });
};

export const deleteAiChatSession = async (sessionId) => {
  if (!sessionId) return null;
  return await apiFetch(`/api/ai/chat/${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
  });
};

export const smartSearchTrains = async (query) => {
  return await apiFetch("/api/ai/smart-search", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
};

/**
 * Normalizes a train object from either SuggestedTrainDto (flat) or TrainResponseDto (nested)
 * so it can be rendered as a compact card and passed into TrainCardModal / addToCart.
 */
export const normalizeSuggestedTrain = (train) => {
  if (!train) return null;

  const fromCity =
    train.fromCity || train.route?.from?.city || "Невідомо";
  const toCity =
    train.toCity || train.route?.to?.city || "Невідомо";
  const departureTime =
    train.departureTime ||
    train.route?.from?.departureTime ||
    new Date().toISOString();
  const arrivalTime =
    train.arrivalTime ||
    train.route?.to?.arrivalTime ||
    new Date().toISOString();
  const duration =
    train.duration || train.route?.duration || "—";
  const basePrice =
    train.basePrice ?? train.payment?.basePrice ?? 0;
  const hasWifi = Boolean(train.hasWifi);

  return {
    ...train,
    id: train.id,
    number: train.number || "—",
    title: train.title || `Потяг ${fromCity} — ${toCity}`,
    description:
      train.description ||
      `Маршрут ${fromCity} → ${toCity}. Тривалість у дорозі: ${duration}.`,
    type: train.type || "Швидкісний",
    fromCity,
    toCity,
    departureTime,
    arrivalTime,
    duration,
    basePrice,
    hasWifi,
    hasAirConditioning:
      train.hasAirConditioning !== undefined ? train.hasAirConditioning : true,
    route: {
      from: {
        city: fromCity,
        station: train.route?.from?.station || fromCity,
        departureTime,
      },
      to: {
        city: toCity,
        station: train.route?.to?.station || toCity,
        arrivalTime,
      },
      duration,
    },
    seat: {
      class: train.seat?.class || "Стандарт",
      carriage: train.seat?.carriage ?? 1,
      number: train.seat?.number ?? 1,
    },
    payment: {
      basePrice,
    },
  };
};
