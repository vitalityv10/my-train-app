import React from "react";
import { Row, Col } from "react-bootstrap";
import TrainCard from "./TrainCard";

export default function TrainList({ trains, addToCart }) {
  return (
    <Row className="g-4 align-items-stretch">
      {trains.map((train) => (
        <Col key={train.id} xs={12} sm={6} lg={4} className="d-flex">
          <TrainCard train={train} addToCart={addToCart} />
        </Col>
      ))}
    </Row>
  );
}
