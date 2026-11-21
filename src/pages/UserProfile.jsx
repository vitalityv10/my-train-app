import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
} from "react-bootstrap";
import UserCard from "../components/user/UserCard";
import { apiFetch } from "../api/apiClient";
import { formatDateUk } from "../utils/dateUtils";

export default function UserProfile() {
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadMyTickets = async () => {
      try {
        const data = await apiFetch("/api/tickets/my");
        if (isMounted && Array.isArray(data)) {
          setTickets(data);
        }
      } catch (error) {
        console.warn("Could not load user tickets:", error);
      } finally {
        if (isMounted) {
          setLoadingTickets(false);
        }
      }
    };

    loadMyTickets();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-vh-100 pb-5">
      <Container className="pt-5">
        <Row className="g-4 justify-content-center">
          <Col md={5} lg={4}>
            <UserCard />
          </Col>

          <Col md={7} lg={8}>
            <Card className="border shadow-sm rounded-4 p-4 bg-white">
              <h4 className="mb-4 fw-bold fs-5">Мої квитки</h4>

              {loadingTickets ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" size="sm" />
                  <p className="text-muted small mt-2 mb-0">
                    Завантаження квитків...
                  </p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <p className="mb-0">У вас поки немає придбаних квитків.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {tickets.map((ticket) => {
                    const depDate = formatDateUk(
                      ticket.route?.from?.departureTime,
                    );
                    return (
                      <div
                        key={ticket.ticketId}
                        className="border rounded-3 p-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2"
                      >
                        <div>
                          <div className="fw-bold">
                            №{ticket.number} {ticket.title}
                          </div>
                          {ticket.route?.from && ticket.route?.to && (
                            <div className="small text-muted">
                              {ticket.route.from.city} → {ticket.route.to.city}
                              {depDate ? ` • ${depDate}` : ""}
                            </div>
                          )}
                          <div className="small mt-1">
                            Вагон {ticket.seat?.carriage}, місце{" "}
                            {ticket.seat?.number} ({ticket.seat?.class})
                          </div>
                        </div>
                        <div className="text-sm-end">
                          <div className="fw-bold text-primary">
                            {ticket.payment?.basePrice} грн
                          </div>
                          <Badge
                            bg={
                              ticket.payment?.status === "Paid"
                                ? "success"
                                : "warning"
                            }
                          >
                            {ticket.payment?.status === "Paid"
                              ? "Оплачено"
                              : "Очікує оплати"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
