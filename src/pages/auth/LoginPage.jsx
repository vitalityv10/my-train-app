import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Nav,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { useAuth } from "../../components/context/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaGoogle,
  FaEnvelope,
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
  FaTrain,
} from "react-icons/fa";

export default function LoginPage() {
  const { loginWithGoogle, loginWithBackend, registerWithBackend } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSubmitting(true);
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      console.error("Помилка входу через Google:", err);
      setError(err.message || "Не вдалося увійти через Google.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Будь ласка, заповніть email та пароль.");
      return;
    }

    if (mode === "register") {
      if (!name.trim()) {
        setError("Будь ласка, введіть ваше ім'я.");
        return;
      }
      if (password.length < 6) {
        setError("Пароль повинен містити щонайменше 6 символів.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Паролі не співпадають.");
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await loginWithBackend(email.trim(), password);
      } else {
        await registerWithBackend({
          name: name.trim(),
          email: email.trim(),
          password,
        });
      }
      navigate("/");
    } catch (err) {
      console.error("Помилка авторизації:", err);
      setError(
        err.message ||
          (mode === "login"
            ? "Невірний email або пароль."
            : "Не вдалося зареєструвати акаунт."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 py-5 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={7} lg={5}>
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
              <Card.Header className="bg-primary text-white text-center py-4 border-0">
                <FaTrain size={36} className="mb-2" />
                <h3 className="fw-bold mb-1">TrainApp</h3>
                <p className="mb-0 small opacity-75">
                  {mode === "login"
                    ? "Увійдіть в акаунт, щоб бронювати квитки"
                    : "Створіть акаунт для швидкого бронювання квитків"}
                </p>
              </Card.Header>

              <Card.Body className="p-4 p-md-5 bg-white">
                <Nav
                  variant="pills"
                  justify
                  className="mb-4 bg-light p-1 rounded-3"
                  activeKey={mode}
                  onSelect={(selectedKey) => switchMode(selectedKey)}
                >
                  <Nav.Item>
                    <Nav.Link
                      eventKey="login"
                      className="rounded-3 fw-semibold"
                    >
                      Вхід
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="register"
                      className="rounded-3 fw-semibold"
                    >
                      Реєстрація
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                {error && (
                  <Alert
                    variant="danger"
                    onClose={() => setError("")}
                    dismissible
                    className="small"
                  >
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {mode === "register" && (
                    <Form.Group className="mb-3" controlId="authName">
                      <Form.Label className="small fw-bold text-muted">
                        Ім'я
                      </Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-light text-secondary">
                          <FaUser />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Введіть ваше ім'я"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={submitting}
                          required
                        />
                      </InputGroup>
                    </Form.Group>
                  )}

                  <Form.Group className="mb-3" controlId="authEmail">
                    <Form.Label className="small fw-bold text-muted">
                      Email
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light text-secondary">
                        <FaEnvelope />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={submitting}
                        required
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="authPassword">
                    <Form.Label className="small fw-bold text-muted">
                      Пароль
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light text-secondary">
                        <FaLock />
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Введіть пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={submitting}
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  {mode === "register" && (
                    <Form.Group className="mb-4" controlId="authConfirmPassword">
                      <Form.Label className="small fw-bold text-muted">
                        Підтвердіть пароль
                      </Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-light text-secondary">
                          <FaLock />
                        </InputGroup.Text>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          placeholder="Повторіть пароль"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={submitting}
                          required
                        />
                      </InputGroup>
                    </Form.Group>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 fw-bold rounded-3 mt-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Зачекайте...
                      </>
                    ) : mode === "login" ? (
                      "Увійти"
                    ) : (
                      "Зареєструватися"
                    )}
                  </Button>
                </Form>

                <div className="d-flex align-items-center my-4">
                  <hr className="flex-grow-1 text-muted opacity-25" />
                  <span className="mx-3 text-muted small text-uppercase">
                    або
                  </span>
                  <hr className="flex-grow-1 text-muted opacity-25" />
                </div>

                <Button
                  variant="outline-danger"
                  size="lg"
                  className="w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold rounded-3"
                  onClick={handleGoogleLogin}
                  disabled={submitting}
                >
                  <FaGoogle />
                  Увійти через Google
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
