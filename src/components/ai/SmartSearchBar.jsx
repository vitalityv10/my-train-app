import React, { useState } from "react";
import { Card, Form, Button, InputGroup, Spinner, Badge } from "react-bootstrap";
import { smartSearchTrains, normalizeSuggestedTrain } from "../../api/aiApi";
import { formatDateUk } from "../../utils/dateUtils";

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
          ? "Розумний пошук тимчасово перевантажений. Спробуйте пізніше або скористайтеся фільтрами."
          : "Не вдалося виконати розумний пошук. Перевірте підключення до сервера.",
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
    <Card className="border shadow-sm rounded-4 mb-4 bg-white">
      <Card.Body className="p-3 p-md-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div>
            <h6 className="mb-0 fw-bold text-primary">
              Розумний пошук маршрутів
            </h6>
            <small className="text-muted">
              Опишіть поїздку природною мовою — параметри фільтрації налаштуються автоматично
            </small>
          </div>
          {activeAiFilter && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleReset}
            >
              Скинути
            </Button>
          )}
        </div>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Form.Control
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Наприклад: до Одеси з Wi-Fi до 700 грн..."
              disabled={loading}
              maxLength={300}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !query.trim()}
              className="px-4"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  <span>Пошук...</span>
                </>
              ) : (
                <span>Знайти</span>
              )}
            </Button>
          </InputGroup>
        </Form>

        {error && <div className="text-danger small mt-2">{error}</div>}

        {activeAiFilter && (
          <div className="mt-2 pt-2 border-top d-flex align-items-center flex-wrap gap-2">
            <span className="text-muted small">Застосовані параметри:</span>
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
                Дата: {formatDateUk(activeAiFilter.date) || activeAiFilter.date}
              </Badge>
            )}
            {activeAiFilter.maxPrice !== undefined &&
              activeAiFilter.maxPrice !== null && (
                <Badge bg="primary" className="fw-normal">
                  До {activeAiFilter.maxPrice} грн
                </Badge>
              )}
            {activeAiFilter.wifiOnly && (
              <Badge bg="secondary" className="fw-normal">
                Тільки з Wi-Fi
              </Badge>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
