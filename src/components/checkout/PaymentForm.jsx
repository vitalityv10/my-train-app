import React from "react";
import { Form, Tab, Tabs } from "react-bootstrap";

export default function PaymentForm({
  paymentMethod,
  setPaymentMethod,
  cardData,
  setCardData,
  phone,
  setPhone,
  errors,
}) {
  return (
    <Tabs
      activeKey={paymentMethod}
      onSelect={setPaymentMethod}
      className="mb-3"
    >
      <Tab eventKey="card" title="Банківська картка">
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold">Номер картки</Form.Label>
            <Form.Control
              placeholder="1234 5678 9012 3456"
              value={cardData.number}
              onChange={(e) =>
                setCardData({ ...cardData, number: e.target.value })
              }
              isInvalid={!!errors.number}
            />
            <Form.Control.Feedback type="invalid">
              {errors.number}
            </Form.Control.Feedback>
          </Form.Group>
          <div className="d-flex gap-3">
            <Form.Group className="mb-3 flex-fill">
              <Form.Label className="small fw-semibold">Термін дії</Form.Label>
              <Form.Control
                placeholder="MM/YY"
                value={cardData.expiry}
                onChange={(e) =>
                  setCardData({ ...cardData, expiry: e.target.value })
                }
                isInvalid={!!errors.expiry}
              />
              <Form.Control.Feedback type="invalid">
                {errors.expiry}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" style={{ width: 110 }}>
              <Form.Label className="small fw-semibold">CVV</Form.Label>
              <Form.Control
                placeholder="123"
                value={cardData.cvv}
                onChange={(e) =>
                  setCardData({ ...cardData, cvv: e.target.value })
                }
                isInvalid={!!errors.cvv}
              />
              <Form.Control.Feedback type="invalid">
                {errors.cvv}
              </Form.Control.Feedback>
            </Form.Group>
          </div>
          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold">
              Ім'я власника картки
            </Form.Label>
            <Form.Control
              placeholder="IVAN KOVALENKO"
              value={cardData.name}
              onChange={(e) =>
                setCardData({ ...cardData, name: e.target.value.toUpperCase() })
              }
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Tab>

      <Tab eventKey="cash" title="Оплата при посадці">
        <Form.Group className="mb-2">
          <Form.Label className="small fw-semibold">
            Номер телефону для бронювання
          </Form.Label>
          <Form.Control
            placeholder="+380 XX XXX XX XX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            isInvalid={!!errors.phone}
          />
          <Form.Control.Feedback type="invalid">
            {errors.phone}
          </Form.Control.Feedback>
        </Form.Group>
        <p className="text-muted small mb-0">
          Квиток буде заброньовано. Оплата здійснюється при посадці у вагон.
        </p>
      </Tab>
    </Tabs>
  );
}
