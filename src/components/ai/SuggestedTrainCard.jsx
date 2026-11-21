import React, { useState } from "react";
import { Badge, Button } from "react-bootstrap";
import {
  FaWifi,
  FaClock,
  FaArrowRight,
  FaCartPlus,
  FaCheck,
  FaInfoCircle,
} from "react-icons/fa";
import { useAuth } from "../context/auth/AuthContext";
import { useCart } from "../context/CartContext";
import { normalizeSuggestedTrain } from "../../api/aiApi";
import TrainCardModal from "../train/TrainCardModal";

export default function SuggestedTrainCard({ rawTrain }) {
  const train = normalizeSuggestedTrain(rawTrain);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [added, setAdded] = useState(false);

  if (!train) return null;

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const depTime = formatTime(train.departureTime);
  const arrTime = formatTime(train.arrivalTime);
  const depDate = formatDate(train.departureTime);

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
      <div className="bg-white border rounded-3 p-2 mb-2 shadow-sm">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
          <div className="d-flex align-items-center gap-1 flex-wrap">
            <Badge bg="primary" className="fw-semibold">
              №{train.number}
            </Badge>
            <span className="fw-bold text-dark small">{train.title}</span>
          </div>
          {train.hasWifi && (
            <Badge
              bg="info"
              text="dark"
              className="d-inline-flex align-items-center gap-1 bg-opacity-25 text-primary border border-primary border-opacity-25"
            >
              <FaWifi size={11} /> Wi-Fi
            </Badge>
          )}
        </div>

        <div className="d-flex align-items-center justify-content-between small text-secondary mb-1">
          <div className="fw-semibold text-dark d-flex align-items-center gap-1">
            <span>{train.fromCity}</span>
            <FaArrowRight size={11} className="text-primary mx-1" />
            <span>{train.toCity}</span>
          </div>
          {train.duration && (
            <span className="text-muted d-inline-flex align-items-center gap-1">
              <FaClock size={11} /> {train.duration}
            </span>
          )}
        </div>

        {(depTime || arrTime) && (
          <div className="text-muted mb-2" style={{ fontSize: "0.78rem" }}>
            {depDate ? `${depDate} • ` : ""}
            {depTime} — {arrTime}
          </div>
        )}

        <div className="d-flex align-items-center justify-content-between pt-1 border-top">
          <span className="fw-bold text-primary">
            {Number(train.basePrice).toFixed(0)} грн
          </span>
          <div className="d-flex gap-1">
            <Button
              variant="outline-primary"
              size="sm"
              className="py-1 px-2 d-inline-flex align-items-center gap-1"
              style={{ fontSize: "0.78rem" }}
              onClick={() => setShowModal(true)}
            >
              <FaInfoCircle size={12} /> Детальніше
            </Button>
            <Button
              variant={added ? "success" : "primary"}
              size="sm"
              className="py-1 px-2 d-inline-flex align-items-center gap-1"
              style={{ fontSize: "0.78rem" }}
              onClick={handleAdd}
            >
              {added ? (
                <>
                  <FaCheck size={11} /> Додано
                </>
              ) : (
                <>
                  <FaCartPlus size={12} /> У кошик
                </>
              )}
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
