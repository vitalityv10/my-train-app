import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Spinner, Badge } from "react-bootstrap";
import styled, { keyframes } from "styled-components";
import {
  FaRobot,
  FaPaperPlane,
  FaTimes,
  FaRedo,
  FaTrashAlt,
  FaMagic,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useAuth } from "../context/auth/AuthContext";
import {
  getOrCreateSessionId,
  resetStoredSessionId,
  setStoredSessionId,
  sendAiChatMessage,
  deleteAiChatSession,
} from "../../api/aiApi";
import MarkdownText from "./MarkdownText";
import SuggestedTrainCard from "./SuggestedTrainCard";

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.45); }
  70% { box-shadow: 0 0 0 12px rgba(13, 110, 253, 0); }
  100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
`;

const FloatingWrapper = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1060;

  @media (max-width: 575.98px) {
    bottom: 16px;
    right: 16px;
  }
`;

const FabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
  color: #ffffff;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 8px 24px rgba(13, 110, 253, 0.35);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  animation: ${pulse} 2.5s infinite;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(13, 110, 253, 0.45);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ChatWindow = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 400px;
  max-width: calc(100vw - 32px);
  height: 580px;
  max-height: calc(100vh - 48px);
  background: #f8f9fa;
  border-radius: 18px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1065;
  border: 1px solid rgba(13, 110, 253, 0.15);

  @media (max-width: 575.98px) {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    max-width: 100vw;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
  color: #fff;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageBubble = styled.div`
  max-width: 88%;
  align-self: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
  background: ${(props) => (props.$isUser ? "#0d6efd" : "#ffffff")};
  color: ${(props) => (props.$isUser ? "#ffffff" : "#212529")};
  border-radius: ${(props) =>
    props.$isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px"};
  padding: 10px 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  font-size: 0.92rem;
  line-height: 1.45;
  word-break: break-word;

  .ai-markdown-content p:last-child {
    margin-bottom: 0 !important;
  }
`;

const QuickChip = styled.button`
  background: #ffffff;
  color: #0d6efd;
  border: 1px solid rgba(13, 110, 253, 0.3);
  border-radius: 20px;
  padding: 6px 13px;
  font-size: 0.83rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;

  &:hover {
    background: #0d6efd;
    color: #ffffff;
    border-color: #0d6efd;
  }
`;

const TypingDots = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;

  span {
    width: 6px;
    height: 6px;
    background-color: #0d6efd;
    border-radius: 50%;
    display: inline-block;
    animation: ${bounce} 1.4s infinite ease-in-out both;
  }

  span:nth-child(1) {
    animation-delay: -0.32s;
  }
  span:nth-child(2) {
    animation-delay: -0.16s;
  }
`;

const InputArea = styled.div`
  background: #ffffff;
  padding: 10px 12px;
  border-top: 1px solid #dee2e6;
  flex-shrink: 0;
`;

const MAX_MESSAGE_LENGTH = 1000;

export default function AiChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(() => getOrCreateSessionId());
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickQueries = [
    "Які міста є в розкладі?",
    "Потяги з Wi-Fi до 600 грн",
    "Найшвидший потяг до Львова",
    ...(user ? ["Мої квитки"] : []),
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend, isRetry = false) => {
    const trimmed = (textToSend ?? inputValue).trim();
    if (!trimmed || isLoading) return;
    if (trimmed.length > MAX_MESSAGE_LENGTH) return;

    if (!isRetry) {
      const userMsg = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
    } else {
      setMessages((prev) => prev.filter((m) => !m.isError));
    }

    setIsLoading(true);

    try {
      const data = await sendAiChatMessage({
        sessionId,
        message: trimmed,
      });

      if (data?.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        setStoredSessionId(data.sessionId);
      }

      const assistantMsg = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data?.reply || "Ось що вдалося знайти за вашим запитом:",
        suggestedTrains: Array.isArray(data?.suggestedTrains)
          ? data.suggestedTrains
          : [],
        usedTools: Array.isArray(data?.usedTools) ? data.usedTools : [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const isOverloaded =
        error?.status === 429 || error?.status === 503 || !error?.status;

      const errorText = isOverloaded
        ? "Сервіс тимчасово перевантажений, спробуйте ще раз за хвилину"
        : error?.message ||
          "Сервіс тимчасово перевантажений, спробуйте ще раз за хвилину";

      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "system",
          isError: true,
          content: errorText,
          failedPrompt: trimmed,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    if (isLoading || isResetting) return;
    setIsResetting(true);
    try {
      await deleteAiChatSession(sessionId);
    } catch {
      // Even if backend session delete fails (e.g. offline), reset local session
    } finally {
      const nextSessionId = resetStoredSessionId();
      setSessionId(nextSessionId);
      setMessages([]);
      setInputValue("");
      setIsResetting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <FloatingWrapper>
          <FabButton
            type="button"
            onClick={() => setIsOpen(true)}
            title="AI-помічник маршрутів"
            aria-label="Відкрити AI-помічник"
          >
            <FaMagic size={18} />
            <span>AI-помічник</span>
          </FabButton>
        </FloatingWrapper>
      )}

      {isOpen && (
        <ChatWindow role="dialog" aria-label="Помічник маршрутів">
          <ChatHeader>
            <div className="d-flex align-items-center gap-2">
              <div
                className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: "36px", height: "36px" }}
              >
                <FaRobot size={19} />
              </div>
              <div>
                <div className="fw-bold lh-sm" style={{ fontSize: "0.98rem" }}>
                  Помічник маршрутів
                </div>
                <div
                  className="d-flex align-items-center gap-1 opacity-75"
                  style={{ fontSize: "0.75rem" }}
                >
                  <span
                    className="rounded-circle d-inline-block"
                    style={{
                      width: "7px",
                      height: "7px",
                      backgroundColor: isLoading ? "#ffc107" : "#20c997",
                    }}
                  />
                  <span>{isLoading ? "Шукає маршрути..." : "Онлайн"}</span>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-1">
              <Button
                variant="link"
                size="sm"
                className="text-white text-decoration-none px-2 py-1 d-flex align-items-center gap-1 opacity-90"
                onClick={handleNewChat}
                disabled={isLoading || isResetting}
                title="Новий чат (очистити історію)"
              >
                {isResetting ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <>
                    <FaTrashAlt size={13} />
                    <span className="small">Новий чат</span>
                  </>
                )}
              </Button>
              <Button
                variant="link"
                size="sm"
                className="text-white p-1 ms-1"
                onClick={() => setIsOpen(false)}
                title="Закрити чат"
                aria-label="Закрити чат"
              >
                <FaTimes size={18} />
              </Button>
            </div>
          </ChatHeader>

          <MessagesContainer>
            {messages.length === 0 && !isLoading ? (
              <div className="my-auto text-center px-2 py-3">
                <div
                  className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: "56px", height: "56px" }}
                >
                  <FaRobot size={28} />
                </div>
                <h6 className="fw-bold text-dark mb-1">
                  Вітаю! Я ваш AI-помічник 🚆
                </h6>
                <p className="text-muted small mb-3">
                  Допоможу знайти потяги за маршрутом, ціною чи наявністю Wi-Fi,
                  а також перевірити вільні місця.
                </p>
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  {quickQueries.map((query, idx) => (
                    <QuickChip
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(query)}
                    >
                      {query}
                    </QuickChip>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                if (msg.isError) {
                  return (
                    <div
                      key={msg.id}
                      className="bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger rounded-3 p-3 small"
                    >
                      <div className="d-flex align-items-start gap-2 mb-2">
                        <FaExclamationTriangle className="mt-1 flex-shrink-0" />
                        <span>{msg.content}</span>
                      </div>
                      {msg.failedPrompt && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="d-inline-flex align-items-center gap-1 py-1 px-2"
                          onClick={() =>
                            handleSendMessage(msg.failedPrompt, true)
                          }
                          disabled={isLoading}
                        >
                          <FaRedo size={11} /> Повторити
                        </Button>
                      )}
                    </div>
                  );
                }

                const isUser = msg.role === "user";

                return (
                  <div
                    key={msg.id}
                    className={`d-flex flex-column ${
                      isUser ? "align-items-end" : "align-items-start"
                    }`}
                  >
                    <MessageBubble $isUser={isUser}>
                      {isUser ? (
                        <div>{msg.content}</div>
                      ) : (
                        <MarkdownText content={msg.content} />
                      )}
                    </MessageBubble>

                    {!isUser &&
                      Array.isArray(msg.suggestedTrains) &&
                      msg.suggestedTrains.length > 0 && (
                        <div className="w-100 mt-2">
                          <div className="text-muted small fw-semibold mb-1 ps-1">
                            Знайдені потяги ({msg.suggestedTrains.length}):
                          </div>
                          {msg.suggestedTrains.map((train, idx) => (
                            <SuggestedTrainCard
                              key={train.id || idx}
                              rawTrain={train}
                            />
                          ))}
                        </div>
                      )}

                    {!isUser &&
                      Array.isArray(msg.usedTools) &&
                      msg.usedTools.length > 0 && (
                        <div className="mt-1 ps-1 d-flex flex-wrap gap-1">
                          {msg.usedTools.map((tool, i) => (
                            <Badge
                              key={i}
                              bg="light"
                              text="secondary"
                              className="border fw-normal"
                              style={{ fontSize: "0.68rem" }}
                            >
                              ⚡ {tool}
                            </Badge>
                          ))}
                        </div>
                      )}
                  </div>
                );
              })
            )}

            {isLoading && (
              <div className="d-flex align-items-center gap-2 bg-white border rounded-3 px-3 py-2 align-self-start shadow-sm">
                <TypingDots>
                  <span />
                  <span />
                  <span />
                </TypingDots>
                <span className="text-muted small">
                  Асистент шукає маршрути...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </MessagesContainer>

          <InputArea>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <div className="d-flex align-items-end gap-2">
                <Form.Control
                  ref={inputRef}
                  as="textarea"
                  rows={1}
                  value={inputValue}
                  onChange={(e) =>
                    setInputValue(e.target.value.slice(0, MAX_MESSAGE_LENGTH))
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Напишіть запит (напр. потяг до Львова з Wi-Fi)..."
                  disabled={isLoading}
                  maxLength={MAX_MESSAGE_LENGTH}
                  className="rounded-3 bg-light border-secondary border-opacity-25"
                  style={{
                    resize: "none",
                    fontSize: "0.9rem",
                    maxHeight: "90px",
                  }}
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: "40px", height: "38px" }}
                  disabled={isLoading || !inputValue.trim()}
                  title="Надіслати"
                  aria-label="Надіслати повідомлення"
                >
                  <FaPaperPlane size={14} />
                </Button>
              </div>
              {inputValue.length > 850 && (
                <div
                  className="text-end text-muted mt-1"
                  style={{ fontSize: "0.72rem" }}
                >
                  {inputValue.length} / {MAX_MESSAGE_LENGTH}
                </div>
              )}
            </Form>
          </InputArea>
        </ChatWindow>
      )}
    </>
  );
}
