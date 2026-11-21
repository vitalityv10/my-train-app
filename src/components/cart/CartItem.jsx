import React from "react";
import { Button, Badge } from "react-bootstrap";
import {
  formatDateUk,
  formatTimeUk,
  localizeTrainType,
} from "../../utils/dateUtils";

export default function CartItem({ item, onRemove, onUpdate }) {
  const quantity = item.quantity || 1;
  const depTime = formatTimeUk(item.route.from.departureTime);
  const arrTime = formatTimeUk(item.route.to.arrivalTime);
  const depDate = formatDateUk(item.route.from.departureTime);

  const amenities = [
    item.hasWifi ? "Wi-Fi" : null,
    item.hasAirConditioning ? "Кондиціонер" : null,
  ].filter(Boolean);

  return (
    <tr>
      <td>
        <strong>№{item.number}</strong>
        <div className="text-muted small">{item.title}</div>
        <Badge bg="primary" className="mt-1 fw-normal">
          {localizeTrainType(item.type)}
        </Badge>
      </td>
      <td>
        <strong>{item.route.from.city}</strong> →{" "}
        <strong>{item.route.to.city}</strong>
      </td>
      <td>
        <div className="fw-semibold">
          {depTime} – {arrTime}
        </div>
        <div className="text-muted small">{depDate}</div>
      </td>
      <td>
        <span className="fw-semibold">{item.seat.class}</span>
        <div className="small text-muted">
          Вагон {item.seat.carriage}, місце {item.seat.number}
        </div>
      </td>
      <td className="small text-muted">
        {amenities.length > 0 ? amenities.join(", ") : "—"}
      </td>
      <td>{item.payment.basePrice} грн</td>
      <td>
        <div className="d-flex justify-content-center align-items-center">
          <Button
            variant="outline-primary"
            size="sm"
            disabled={quantity <= 1}
            onClick={() => onUpdate(item.id, quantity - 1)}
          >
            -
          </Button>
          <span className="mx-3 fw-bold">{quantity}</span>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => onUpdate(item.id, quantity + 1)}
          >
            +
          </Button>
        </div>
      </td>
      <td>
        <strong>{item.payment.basePrice * quantity} грн</strong>
      </td>
      <td>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => onRemove(item.id)}
        >
          Видалити
        </Button>
      </td>
    </tr>
  );
}
