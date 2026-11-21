import React from "react";
import { Card, Button } from "react-bootstrap";
import styled from "styled-components";
import { useTrainCard } from "../../hooks/useTrainCard";
import TrainCardModal from "./TrainCardModal";

const StyledCard = styled(Card)`
  width: 100%;
  border: 1px solid var(--brand-border);
  border-radius: 16px;
  overflow: hidden;
  background: var(--brand-surface);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(15, 37, 71, 0.1) !important;
    border-color: rgba(15, 37, 71, 0.25);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  height: 164px;
  overflow: hidden;
  background-color: var(--brand-navy-subtle);
`;

const TrainBadge = styled.span`
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(15, 37, 71, 0.9);
  color: #ffffff;
  font-family: "Unbounded", sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.02em;
`;

const CardTitleText = styled.h3`
  font-family: "Unbounded", sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--brand-text);
  margin-bottom: 12px;
  min-height: 2.66rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const InfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 12px;
  background-color: var(--brand-bg);
  margin-bottom: 14px;
`;

const TagPill = styled.span`
  display: inline-block;
  font-size: 0.76rem;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 6px;
  background-color: ${(props) =>
    props.$accent ? "var(--brand-accent-subtle)" : "var(--brand-navy-subtle)"};
  color: ${(props) =>
    props.$accent ? "var(--brand-accent-hover)" : "var(--brand-navy)"};
`;

const PriceValue = styled.div`
  font-family: "Unbounded", sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--brand-navy);
`;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80";

export default function TrainCard({ train }) {
  const {
    showModal,
    setShowModal,
    handleAddToCart,
    departureTime,
    arrivalTime,
    departureDate,
  } = useTrainCard(train);

  const { route, seat, payment } = train;
  const imgSrc = train.imageUrl?.startsWith("http")
    ? train.imageUrl
    : `${process.env.PUBLIC_URL}${train.imageUrl}`;

  return (
    <>
      <StyledCard className="h-100 shadow-sm d-flex flex-column">
        <ImageWrapper>
          <Card.Img
            variant="top"
            src={imgSrc || FALLBACK_IMAGE}
            alt={`${route.from.city} — ${route.to.city}`}
            style={{ height: "100%", width: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
          {train.number && <TrainBadge>№ {train.number}</TrainBadge>}
        </ImageWrapper>

        <Card.Body className="d-flex flex-column p-3 p-xl-4">
          <CardTitleText title={train.title}>{train.title}</CardTitleText>

          <InfoBlock>
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-bold text-dark">
                {route.from.city} — {route.to.city}
              </span>
              <span className="text-muted small fw-medium">
                {route.duration}
              </span>
            </div>

            <div className="d-flex justify-content-between align-items-center small">
              <span className="fw-semibold text-dark">
                {departureTime} – {arrivalTime}
              </span>
              <span className="text-muted">{departureDate}</span>
            </div>
          </InfoBlock>

          <div
            className="d-flex flex-wrap align-items-center gap-1 mb-3"
            style={{ minHeight: "28px" }}
          >
            <TagPill>{seat.class}</TagPill>
            <TagPill>
              Вагон {seat.carriage}, місце {seat.number}
            </TagPill>
            {train.hasWifi && <TagPill $accent>Wi-Fi</TagPill>}
            {train.hasAirConditioning && <TagPill>Кондиціонер</TagPill>}
          </div>

          <div className="mt-auto pt-3 border-top">
            <div className="d-flex justify-content-between align-items-baseline mb-3">
              <span className="text-muted small">Вартість квитка</span>
              <PriceValue>{payment.basePrice} грн</PriceValue>
            </div>

            <div className="d-grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <Button
                variant="outline-primary"
                size="sm"
                className="py-2"
                onClick={() => setShowModal(true)}
              >
                Детальніше
              </Button>
              <Button
                variant="success"
                size="sm"
                className="py-2"
                onClick={handleAddToCart}
              >
                У кошик
              </Button>
            </div>
          </div>
        </Card.Body>
      </StyledCard>

      <TrainCardModal
        train={train}
        show={showModal}
        onHide={() => setShowModal(false)}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
