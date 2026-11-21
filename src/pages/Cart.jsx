import React, { useState } from "react";
import { Container, Button, Card } from "react-bootstrap";
import { useAuth } from "../components/context/auth/AuthContext";
import { useCart } from "../components/context/CartContext";
import CheckoutModal from "../components/checkout/CheckoutModal";
import CartTable from "../components/cart/CartTable";

export default function Cart() {
  const { user } = useAuth();
  const { cart, removeFromCart, updateQuantity, purchaseTickets } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const totalPrice = cart.items.reduce(
    (sum, item) => sum + item.payment.basePrice * (item.quantity || 1),
    0,
  );

  const handleSuccess = async (tickets, paymentMethod, contactPhone) => {
    await purchaseTickets(tickets, paymentMethod, contactPhone);
    setShowCheckout(false);
    alert("Квитки успішно придбано!");
  };

  if (!user)
    return (
      <Container className="mt-5 text-center">
        <h3>Увійдіть, щоб переглянути кошик.</h3>
      </Container>
    );

  return (
    <Container className="py-5">
      <Card className="border shadow-sm rounded-4 p-4 bg-white">
        <h2 className="fs-4 mb-4">Кошик</h2>

        {cart.items.length === 0 ? (
          <p className="text-muted mb-0">Ваш кошик порожній.</p>
        ) : (
          <>
            <CartTable
              items={cart.items}
              onRemove={removeFromCart}
              onUpdate={updateQuantity}
            />

            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mt-4 pt-3 border-top gap-3">
              <div>
                <span className="text-muted me-2">Разом до сплати:</span>
                <span className="fs-4 fw-bold text-primary font-display">
                  {totalPrice} грн
                </span>
              </div>
              <Button
                variant="success"
                className="px-4 py-2"
                onClick={() => setShowCheckout(true)}
              >
                Оформити замовлення
              </Button>
            </div>

            <CheckoutModal
              show={showCheckout}
              onHide={() => setShowCheckout(false)}
              cartItems={cart.items}
              onSuccess={handleSuccess}
            />
          </>
        )}
      </Card>
    </Container>
  );
}
