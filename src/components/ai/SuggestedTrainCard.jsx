import React, { useState } from "react";
import { Badge, Button } from "react-bootstrap";
import { useAuth } from "../context/auth/AuthContext";
import { useCart } from "../context/CartContext";
import { normalizeSuggestedTrain } from "../../api/aiApi";
import { formatDateUk, formatTimeUk } from "../../utils/dateUtils";
import TrainCardModal from "../train/TrainCardModal";

export default function SuggestedTrainCard({ rawTrain }) {
  const train = normalizeSuggestedTrain(rawTrain);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [added, setAdded] = useState(false);

  if (!train) return null;

  const depTime = formatTimeUk(train.departureTime);
  const arrTime = formatTimeUk(train.arrivalTime);
  const depDate = formatDateUk(train.departureTime, { short: true });

  const handleAdd = async () => {
    if (!user) {
      alert("Увійдіть в систему, щоб додати квиток у кошик!");
      return;
    }
    await addToCart(train);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <div className="bg-white border rounded-3 p-3 mb-2 shadow-sm">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Badge bg="primary" className="fw-semibold">
              №{train.number}
            </Badge>
            <span className="fw-bold text-dark small">{train.title}</span>
          </div>
          {train.hasWifi && (
            <span className="badge bg-accent-subtle fw-semibold">Wi-Fi</span>
          )}
        </div>

        <div className="d-flex align-items-center justify-content-between small text-secondary mb-1">
          <div className="fw-semibold text-dark">
            {train.fromCity} → {train.toCity}
          </div>
          {train.duration && (
            <span className="text-muted">{train.duration}</span>
          )}
        </div>

        {(depTime || arrTime) && (
          <div className="text-muted mb-2" style={{ fontSize: "0.78rem" }}>
            {depDate ? `${depDate} • ` : ""}
            {depTime} – {arrTime}
          </div>
        )}

        <div className="d-flex align-items-center justify-content-between pt-2 border-top">
          <span className="fw-bold text-primary">
            {Number(train.basePrice).toFixed(0)} грн
          </span>
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              className="py-1 px-2"
              style={{ fontSize: "0.78rem" }}
              onClick={() => setShowModal(true)}
            >
              Детальніше
            </Button>
            <Button
              variant="success"
              size="sm"
              className="py-1 px-2"
              style={{ fontSize: "0.78rem" }}
              onClick={handleAdd}
            >
              {added ? "Додано" : "У кошик"}
            </Button>
          </div>
        </div>
      </div>

      <TrainCardModal
        train={train}
        show={showModal}
        onHide={() => setShowModal(false)}
        onAddToCart={handleAdd}
      />
    </>
  );
}
