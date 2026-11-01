import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import UserCard from "../components/user/UserCard";

export default function UserProfile() {
  return (
    <div
      style={{ backgroundColor: "#f4f8fb", paddingBottom: "50px" }}
      className="min-vh-100"
    >
      <Container className="pt-5 mt-3">
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <UserCard />
          </Col>
        </Row>
      </Container>
    </div>
  );
}
