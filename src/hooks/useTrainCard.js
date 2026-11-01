import { useState } from "react";
import { useAuth } from "../components/context/auth/AuthContext";
import { useCart } from "../components/context/CartContext";

export function useTrainCard(train) {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [showModal, setShowModal] = useState(false);

  const handleAddToCart = () => {
    if (!user) {
      alert("Увійдіть в систему, щоб додати квиток у кошик!");
      return;
    }
    addToCart(train);
  };

  const departureTime = new Date(
    train.route.from.departureTime,
  ).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const arrivalTime = new Date(train.route.to.arrivalTime).toLocaleTimeString(
    "uk-UA",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );
  const departureDate = new Date(
    train.route.from.departureTime,
  ).toLocaleDateString("uk-UA");

  return {
    showModal,
    setShowModal,
    handleAddToCart,
    departureTime,
    arrivalTime,
    departureDate,
  };
}
