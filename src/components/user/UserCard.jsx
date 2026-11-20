import React from "react";
import { Button } from "react-bootstrap";
import { useAuth } from "../context/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

export default function UserCard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="text-center p-4 shadow-sm rounded-4 bg-white">
      {user.photo ? (
        <img
          src={user.photo}
          alt={user.name}
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            marginBottom: 12,
            objectFit: "cover",
          }}
        />
      ) : (
        <div className="mb-3 text-primary">
          <FaUserCircle size={80} />
        </div>
      )}
      <h5 className="fw-bold mb-1">{user.name || "Користувач"}</h5>
      <p className="text-muted small mb-3">{user.email}</p>
      <Button
        variant="outline-danger"
        size="sm"
        className="px-4 rounded-pill"
        onClick={handleLogout}
      >
        Вийти
      </Button>
    </div>
  );
}
