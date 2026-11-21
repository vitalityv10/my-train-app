import React, { useState } from "react";
import { Card, Form, Button, InputGroup, Spinner, Badge } from "react-bootstrap";
import { FaMagic, FaTimes, FaSearch } from "react-icons/fa";
import { smartSearchTrains, normalizeSuggestedTrain } from "../../api/aiApi";

export default function SmartSearchBar({
  onApplySmartSearch,
  onClearSmartSearch,
  activeAiFilter,
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await smartSearchTrains(trimmed);
      const appliedFilter = response?.appliedFilter || {};
      const returnedTrains = Array.isArray(response?.trains)
        ? response.trains.map(normalizeSuggestedTrain).filter(Boolean)
        : null;

      onApplySmartSearch({
        query: trimmed,
        appliedFilter,
        trains: returnedTrains,
      });
    } catch (err) {
      setError(
        err?.status === 429 || err?.status === 503
          ? "AI-пошук тимчасово перевантажений. Спробуйте пізніше або скористайтеся звичайними фільтрами."
          : "Не вдалося виконати AI-пошук. Перевірте підключення до сервера."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuery("");
    setError(null);
    onClearSmartSearch();
  };

  return (
    <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white">
      <Card.Body className="p-3 p-md-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary bg-opacity-10 text-primary p-2 rounded-3">
              <FaMagic />
            </span>
            <div>
              <h6 className="mb-0 fw-bold text-dark">
                Розумний AI-пошук маршрутів
              </h6>
              <small className="text-muted">
                Опишіть поїздку природною мовою — AI автоматично налаштує фільтри
              </small>
            </div>
          </div>
          {activeAiFilter && (
            <Button
              variant="outline-secondary"
              size="sm"
              className="rounded-pill d-inline-flex align-items-center gap-1"
              onClick={handleReset}
            >
              <FaTimes size={12} /> Скинути AI-пошук
            </Button>
          )}
        </div>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Form.Control
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Наприклад: до Одеси з вайфаєм до 700 грн..."
              disabled={loading}
              maxLength={300}
              className="bg-light border-primary border-opacity-25"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !query.trim()}
              className="px-3 d-flex align-items-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" />
                  <span>Аналіз...</span>
                </>
              ) : (
                <>
                  <FaSearch size={14} />
                  <span>Знайти з AI</span>
                </>
              )}
            </Button>
          </InputGroup>
        </Form>

        {error && (
          <div className="text-danger small mt-2">{error}</div>
        )}

        {activeAiFilter && (
          <div className="mt-2 pt-2 border-top d-flex align-items-center flex-wrap gap-2">
            <span className="text-muted small">Розпізнані параметри:</span>
            {activeAiFilter.city && (
              <Badge bg="primary" className="fw-normal">
                Місто: {activeAiFilter.city}
              </Badge>
            )}
            {activeAiFilter.search && (
              <Badge bg="primary" className="fw-normal">
                Пошук: {activeAiFilter.search}
              </Badge>
            )}
            {activeAiFilter.date && (
              <Badge bg="primary" className="fw-normal">
                Дата: {activeAiFilter.date}
              </Badge>
            )}
            {activeAiFilter.maxPrice !== undefined &&
              activeAiFilter.maxPrice !== null && (
                <Badge bg="primary" className="fw-normal">
                  До {activeAiFilter.maxPrice} грн
                </Badge>
              )}
            {activeAiFilter.wifiOnly && (
              <Badge bg="info" text="dark" className="fw-normal">
                Тільки з Wi-Fi
              </Badge>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
