import React, { useState, useEffect } from "react";
import { Form, Card, Button, InputGroup, Spinner, Badge } from "react-bootstrap";
import { smartSearchTrains, normalizeSuggestedTrain } from "../../api/aiApi";
import { formatDateUk } from "../../utils/dateUtils";

const AI_INTENT_PATTERNS = [
  /\b(до|з|із|зі|у|в|на|через|після|біля|від|без|для)\b/i,
  /\b(грн|uah|грив|цін|дешев|дорог|бюджет|кошту)\w*/i,
  /\b(wi-?fi|wifi|вайфай|вай-фай|інтернет|кондиціонер)\w*/i,
  /\b(поїзд|потяг|рейс|маршрут|квит\w*|вагон|місц\w*|купе\w*|плацкарт\w*|інтерсіті|клас)\b/i,
  /\b(сьогодні|завтра|післязавтра|вранці|зранку|ввечері|вночі|вдень|нічн\w*|денн\w*|швидк\w*)\b/i,
  /\b(знайд\w*|покаж\w*|підбер\w*|шука\w*|хочу|потріб\w*|треба|є)\b/i,
];

/**
 * Визначає, чи ввів користувач простий запит (номер поїзда, місто, коротка назва),
 * чи природномовне речення/фразу для AI-пошуку.
 */
export function isNaturalLanguageQuery(rawInput) {
  const trimmed = (rawInput || "").trim();
  if (!trimmed) return false;

  // Номер поїзда (наприклад "715", "715К", "№091К") — завжди простий пошук
  if (/^[№#]?\d{1,4}[а-яіїєґa-z]?$/i.test(trimmed)) {
    return false;
  }

  const words = trimmed
    .replace(/[—–-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  // Одне слово (місто, номер або назва поїзда) — завжди простий пошук
  if (words.length <= 1) {
    return false;
  }

  // Якщо є 3+ слів або ключові маркери природної мови (прийменники, ціна, зручності, час) — AI-пошук
  if (words.length >= 3) {
    return true;
  }

  return AI_INTENT_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export default function TrainFilters({
  searchQuery,
  onSearchChange,
  wifiOnly,
  onWifiChange,
  maxPrice,
  onPriceChange,
  selectedCity,
  onCityChange,
  selectedDate,
  onDateChange,
  cities,
  activeAiFilter,
  onApplySmartSearch,
  onClearSmartSearch,
}) {
  const [inputValue, setInputValue] = useState(searchQuery || "");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    if (!isNaturalLanguageQuery(inputValue)) {
      setInputValue(searchQuery || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const isAiMode = isNaturalLanguageQuery(inputValue);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    setAiError(null);

    if (!val.trim()) {
      onSearchChange("");
      if (activeAiFilter && onClearSmartSearch) {
        onClearSmartSearch();
      }
      return;
    }

    if (!isNaturalLanguageQuery(val)) {
      // Простий пошук: миттєво фільтруємо за номером, назвою або містом
      if (activeAiFilter && onClearSmartSearch) {
        onClearSmartSearch();
      }
      onSearchChange(val);
    }
  };

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || aiLoading) return;

    // Якщо це простий запит (номер або назва) — працює локальний пошук
    if (!isNaturalLanguageQuery(trimmed)) {
      if (activeAiFilter && onClearSmartSearch) {
        onClearSmartSearch();
      }
      onSearchChange(trimmed);
      return;
    }

    // Якщо введено речення/опис — запускаємо AI-пошук
    setAiLoading(true);
    setAiError(null);

    try {
      const response = await smartSearchTrains(trimmed);
      const appliedFilter = response?.appliedFilter || {};
      const returnedTrains = Array.isArray(response?.trains)
        ? response.trains.map(normalizeSuggestedTrain).filter(Boolean)
        : null;

      if (onApplySmartSearch) {
        onApplySmartSearch({
          query: trimmed,
          appliedFilter,
          trains: returnedTrains,
        });
      }
    } catch (err) {
      setAiError(
        err?.status === 429 || err?.status === 503
          ? "AI-пошук тимчасово перевантажений. Спробуйте пізніше або скористайтеся фільтрами нижче."
          : "Не вдалося обробити AI-запит. Перевірте підключення до сервера.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const clearFilters = () => {
    setInputValue("");
    setAiError(null);
    onSearchChange("");
    onWifiChange(false);
    onPriceChange(250);
    onCityChange("");
    onDateChange("");
    if (onClearSmartSearch) {
      onClearSmartSearch();
    }
  };

  return (
    <Card className="border shadow-sm rounded-4 overflow-hidden bg-white">
      <Card.Body className="p-4">
        <h5 className="mb-4 fw-bold fs-6 text-uppercase text-primary">
          Параметри пошуку
        </h5>

        <Form onSubmit={handleSearchSubmit} className="mb-3">
          <Form.Group>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <Form.Label className="text-muted small fw-semibold mb-0">
                Пошук
              </Form.Label>
              {isAiMode && (
                <span
                  className="badge bg-accent-subtle fw-semibold"
                  style={{ fontSize: "0.7rem" }}
                >
                  AI-запит
                </span>
              )}
            </div>

            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Номер, місто або запит для AI..."
                value={inputValue}
                onChange={handleInputChange}
                disabled={aiLoading}
                maxLength={300}
              />
              {isAiMode && (
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={aiLoading || !inputValue.trim()}
                  className="px-3"
                >
                  {aiLoading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Знайти"
                  )}
                </Button>
              )}
            </InputGroup>

            <Form.Text className="text-muted" style={{ fontSize: "0.75rem" }}>
              {isAiMode
                ? "Натисніть Enter або «Знайти» для AI-підбору"
                : "Введіть номер/місто або опишіть поїздку реченням"}
            </Form.Text>

            {aiError && (
              <div className="text-danger small mt-2">{aiError}</div>
            )}

            {activeAiFilter && (
              <div className="mt-2 pt-2 border-top d-flex align-items-center flex-wrap gap-1">
                {activeAiFilter.city && (
                  <Badge bg="primary" className="fw-normal">
                    {activeAiFilter.city}
                  </Badge>
                )}
                {activeAiFilter.search && (
                  <Badge bg="primary" className="fw-normal">
                    {activeAiFilter.search}
                  </Badge>
                )}
                {activeAiFilter.date && (
                  <Badge bg="primary" className="fw-normal">
                    {formatDateUk(activeAiFilter.date) || activeAiFilter.date}
                  </Badge>
                )}
                {activeAiFilter.maxPrice !== undefined &&
                  activeAiFilter.maxPrice !== null && (
                    <Badge bg="primary" className="fw-normal">
                      до {activeAiFilter.maxPrice} грн
                    </Badge>
                  )}
                {activeAiFilter.wifiOnly && (
                  <Badge bg="secondary" className="fw-normal">
                    Wi-Fi
                  </Badge>
                )}
              </div>
            )}
          </Form.Group>
        </Form>

        <Form.Group className="mb-3">
          <Form.Label className="text-muted small fw-semibold">
            Місто
          </Form.Label>
          <Form.Select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
          >
            <option value="">Усі напрямки</option>
            {cities.map((city, idx) => (
              <option key={idx} value={city}>
                {city}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className="text-muted small fw-semibold">
            Дата відправлення (до)
          </Form.Label>
          <Form.Control
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Form.Label className="text-muted small fw-semibold mb-0">
              Максимальна ціна
            </Form.Label>
            <span className="fw-bold text-primary small">{maxPrice} грн</span>
          </div>
          <Form.Range
            min={50}
            max={1000}
            step={10}
            value={maxPrice}
            onChange={(e) => onPriceChange(Number(e.target.value))}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Check
            type="switch"
            id="wifi-switch"
            label="Тільки з Wi-Fi"
            checked={wifiOnly}
            onChange={(e) => onWifiChange(e.target.checked)}
            className="fw-semibold text-dark"
          />
        </Form.Group>

        <Button
          variant="outline-primary"
          size="sm"
          className="w-100 py-2"
          onClick={clearFilters}
        >
          Скинути фільтри
        </Button>
      </Card.Body>
    </Card>
  );
}
