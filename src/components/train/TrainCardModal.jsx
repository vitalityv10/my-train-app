import React from "react";
import { Modal, Button } from "react-bootstrap";
import {
  formatDateUk,
  formatTimeUk,
  localizeTrainType,
} from "../../utils/dateUtils";

export default function TrainCardModal({ train, show, onHide, onAddToCart }) {
  const { route, seat, payment } = train;
  const departureTime = formatTimeUk(route.from.departureTime);
  const arrivalTime = formatTimeUk(route.to.arrivalTime);
  const departureDate = formatDateUk(route.from.departureTime);
  const arrivalDate = formatDateUk(route.to.arrivalTime);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="fs-5">
          Поїзд №{train.number} — {train.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-3">
        {train.description && (
          <p className="text-muted mb-3">{train.description}</p>
        )}
        <div className="bg-light rounded-3 p-3 d-flex flex-column gap-2 small">
          <div className="d-flex justify-content-between">
            <span className="text-muted">Маршрут</span>
            <span className="fw-semibold text-end">
              {route.from.station} → {route.to.station}
            </span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted">Відправлення</span>
            <span className="fw-semibold">
              {departureTime}, {departureDate}
            </span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted">Прибуття</span>
            <span className="fw-semibold">
              {arrivalTime}
              {arrivalDate && arrivalDate !== departureDate
                ? `, ${arrivalDate}`
                : ""}
            </span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted">Тривалість у дорозі</span>
            <span className="fw-semibold">{route.duration}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted">Тип поїзда</span>
            <span className="fw-semibold">{localizeTrainType(train.type)}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted">Клас / місце</span>
            <span className="fw-semibold">
              {seat.class}, вагон {seat.carriage}, місце {seat.number}
            </span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted">Зручності</span>
            <span className="fw-semibold">
              {[
                train.hasWifi ? "Wi-Fi" : null,
                train.hasAirConditioning ? "Кондиціонер" : null,
              ]
                .filter(Boolean)
                .join(", ") || "Стандартні"}
            </span>
          </div>
          {payment?.basePrice !== undefined && (
            <div className="d-flex justify-content-between pt-2 mt-1 border-top">
              <span className="text-muted">Вартість</span>
              <span className="fw-bold text-primary fs-6">
                {payment.basePrice} грн
              </span>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer className="border-top-0 pt-0">
        <Button variant="outline-secondary" onClick={onHide}>
          Закрити
        </Button>
        <Button
          variant="success"
          onClick={() => {
            onAddToCart();
            onHide();
          }}
        >
          У кошик
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
