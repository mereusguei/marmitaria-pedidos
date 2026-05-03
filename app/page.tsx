"use client";

import { useEffect, useState } from "react";

type Order = {
  id: number;
  customer: string;
  phone?: string;
  items: string;
  total: number;
  payment: string;
  address?: string;
  locationUrl?: string;
  notes?: string;
  status: string;
  createdAt: string;
};

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState({
    customer: "",
    phone: "",
    items: "",
    total: "",
    payment: "PIX",
    address: "",
    locationUrl: "",
    notes: "",
  });

  async function loadOrders() {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function createOrder(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const order = await res.json();

    setForm({
      customer: "",
      phone: "",
      items: "",
      total: "",
      payment: "PIX",
      address: "",
      locationUrl: "",
      notes: "",
    });

    await loadOrders();

    window.open(`/print/${order.id}`, "_blank");
  }

  return (
    <main style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Pedidos - Marmitaria</h1>

      <form onSubmit={createOrder} style={{ display: "grid", gap: 10, maxWidth: 500 }}>
        <input placeholder="Nome do cliente" value={form.customer}
          onChange={(e) => setForm({ ...form, customer: e.target.value })} required />

        <input placeholder="Telefone" value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })} />

        <textarea placeholder="Pedido / Marmitas / Misturas" value={form.items}
          onChange={(e) => setForm({ ...form, items: e.target.value })} required />

        <input placeholder="Valor total" type="number" step="0.01" value={form.total}
          onChange={(e) => setForm({ ...form, total: e.target.value })} required />

        <select value={form.payment}
          onChange={(e) => setForm({ ...form, payment: e.target.value })}>
          <option>PIX</option>
          <option>Dinheiro</option>
          <option>Cartão</option>
          <option>Fiado</option>
        </select>

        <textarea placeholder="Endereço escrito" value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })} />

        <input placeholder="Link da localização do WhatsApp / Google Maps" value={form.locationUrl}
          onChange={(e) => setForm({ ...form, locationUrl: e.target.value })} />

        <textarea placeholder="Observações: sem salada, sem feijão..." value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })} />

        <button type="submit" style={{ padding: 12, fontWeight: "bold" }}>
          Salvar e Imprimir
        </button>
      </form>

      <h2>Últimos pedidos</h2>

      {orders.map((order) => (
        <div key={order.id} style={{ border: "1px solid #ccc", padding: 10, marginTop: 10 }}>
          <strong>#{order.id} - {order.customer}</strong>
          <p>{order.items}</p>
          <p>R$ {Number(order.total).toFixed(2)} - {order.payment}</p>
          <button onClick={() => window.open(`/print/${order.id}`, "_blank")}>
            Imprimir
          </button>
        </div>
      ))}
    </main>
  );
}