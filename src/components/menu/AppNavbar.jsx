import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useAuth } from "../context/auth/AuthContext";
import { useCart } from "../context/CartContext";

export default function AppNavbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { cart } = useCart();

  const cartCount =
    cart?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `fw-semibold px-2 ${isActive ? "text-white" : "text-white-50"}`;
  };

  return (
    <Navbar
      expand="lg"
      sticky="top"
      variant="dark"
      style={{ backgroundColor: "var(--brand-navy)" }}
      className="py-3 shadow-sm"
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          className="text-white fw-bold fs-5 d-flex align-items-center gap-2"
        >
          <span>TrainApp</span>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "var(--brand-accent)",
              display: "inline-block",
            }}
          />
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          className="border-0 focus-ring"
        />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto ms-lg-4 gap-2 gap-lg-3 align-items-lg-center mt-3 mt-lg-0">
            <Nav.Link as={Link} to="/" className={getLinkClass("/")}>
              Каталог
            </Nav.Link>
            {user && (
              <>
                <Nav.Link as={Link} to="/cart" className={getLinkClass("/cart")}>
                  Кошик{cartCount > 0 ? ` (${cartCount})` : ""}
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/profile"
                  className={getLinkClass("/profile")}
                >
                  Профіль
                </Nav.Link>
              </>
            )}
          </Nav>

          <Nav className="gap-2 align-items-lg-center mt-3 mt-lg-0 pt-3 pt-lg-0 border-top border-secondary border-opacity-25 border-lg-0">
            {user ? (
              <Button
                variant="outline-light"
                size="sm"
                onClick={logout}
                className="px-3 py-1"
              >
                Вийти
              </Button>
            ) : (
              <Button
                as={Link}
                to="/login"
                variant="success"
                size="sm"
                className="px-4 py-2"
              >
                Увійти
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
