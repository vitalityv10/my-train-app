import React from "react";
import { Container } from "react-bootstrap";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-top py-4 mt-auto">
      <Container className="d-flex flex-column flex-md-row justify-content-between align-items-center text-muted small">
        <div className="mb-2 mb-md-0">
          <span className="fw-bold text-primary me-1">TrainApp</span>
          &copy; {currentYear}. Усі права захищено.
        </div>
        <div>Сервіс пошуку та бронювання залізничних квитків</div>
      </Container>
    </footer>
  );
}
