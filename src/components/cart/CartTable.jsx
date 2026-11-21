import React from "react";
import { Table } from "react-bootstrap";
import CartItem from "./CartItem";

export default function CartTable({ items, onRemove, onUpdate }) {
  return (
    <Table hover responsive className="align-middle mb-0">
      <thead className="table-light">
        <tr>
          <th>Поїзд</th>
          <th>Маршрут</th>
          <th>Відправлення / Прибуття</th>
          <th>Клас / Місце</th>
          <th>Зручності</th>
          <th>Ціна</th>
          <th className="text-center">Кількість</th>
          <th>Сума</th>
          <th>Дії</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onRemove={onRemove}
            onUpdate={onUpdate}
          />
        ))}
      </tbody>
    </Table>
  );
}
