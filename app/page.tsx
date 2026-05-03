"use client";

import { useEffect, useMemo, useState } from "react";

type Order = {
  id: number;
  customer: string;
  items: string;
  total: number;
  payment: string;
  status: string;
  createdAt: string;
};

type MenuItem = {
  id: number;
  name: string;
  category: string;
  active: boolean;
  specialPrice: boolean;
};

type MarmitaSize = {
  id: number;
  name: string;
  normalPrice: number;
  specialPrice: number;
  twoMeatPrice?: number | null;
  active: boolean;
};

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [sizes, setSizes] = useState<MarmitaSize[]>([]);

  const [selectedSides, setSelectedSides] = useState<string[]>([]);

  const [form, setForm] = useState({
    customer: "",
    phone: "",
    sizeName: "M",
    meat1: "",
    meat2: "",
    salad: "",
    total: "",
    payment: "PIX",
    address: "",
    locationUrl: "",
    notes: "",
    manualItems: "",
  });

  async function loadOrders() {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data);
  }

  async function loadMenu() {
  const res = await fetch("/api/menu");
  const data = await res.json();

  setMenu(data.items);
  setSizes(data.sizes);

  const activeSides = data.items
    .filter((item: MenuItem) => item.category === "acompanhamento" && item.active)
    .map((item: MenuItem) => item.name);

  const firstActiveSalad = data.items.find(
    (item: MenuItem) => item.category === "salada" && item.active
  );

  setSelectedSides(activeSides);

  setForm((prev) => ({
    ...prev,
    salad: firstActiveSalad?.name || "",
  }));
}

  useEffect(() => {
    loadOrders();
    loadMenu();
  }, []);

  const meats = menu.filter((item) => item.category === "carne" && item.active);
  const sides = menu.filter((item) => item.category === "acompanhamento" && item.active);
  const salads = menu.filter((item) => item.category === "salada" && item.active);

  const selectedMeat = meats.find((item) => item.name === form.meat1);
  const selectedSize = sizes.find((size) => size.name === form.sizeName);

  const calculatedTotal = useMemo(() => {
    if (!selectedSize) return 0;

    if (form.sizeName === "G com Duas Carnes") {
      return selectedSize.twoMeatPrice || selectedSize.normalPrice;
    }

    if (selectedMeat?.specialPrice) {
      return selectedSize.specialPrice;
    }

    return selectedSize.normalPrice;
  }, [selectedSize, selectedMeat, form.sizeName]);

  useEffect(() => {
    if (calculatedTotal > 0) {
      setForm((prev) => ({
        ...prev,
        total: String(calculatedTotal),
      }));
    }
  }, [calculatedTotal]);

  function toggleSalad(name: string) {
  setForm((prev) => ({
    ...prev,
    salad: prev.salad === name ? "" : name,
  }));
  }

  function toggleSide(name: string) {
    setSelectedSides((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  }

  function buildItemsText() {
    if (form.manualItems.trim()) {
      return form.manualItems.trim();
    }

    return [
      `Tamanho: ${form.sizeName}`,
      form.meat1 ? `Carne: ${form.meat1}` : "",
      form.meat2 ? `2ª Carne: ${form.meat2}` : "",
      selectedSides.length ? `Acompanhamentos: ${selectedSides.join(", ")}` : "",
      form.salad ? `Salada: ${form.salad}` : "",
    ].filter(Boolean).join("\n");
  }

  async function createOrder(e: React.FormEvent) {
    e.preventDefault();

    const items = buildItemsText();

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        items,
        sides: selectedSides.join(", "),
      }),
    });

    const order = await res.json();

    const activeSides = menu
  .filter((item) => item.category === "acompanhamento" && item.active)
  .map((item) => item.name);

const firstActiveSalad = menu.find(
  (item) => item.category === "salada" && item.active
);

setForm({
  customer: "",
  phone: "",
  sizeName: "M",
  meat1: "",
  meat2: "",
  salad: firstActiveSalad?.name || "",
  total: "",
  payment: "PIX",
  address: "",
  locationUrl: "",
  notes: "",
  manualItems: "",
});

setSelectedSides(activeSides);

    await loadOrders();

    if (order?.id) {
      window.open(`/print/${order.id}`, "_blank");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Pedidos - Marmitaria</h1>
            <p className="text-sm text-slate-400">Sistema interno de anotação e impressão</p>
          </div>

          <a
            href="/config"
            className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-white border border-slate-700"
          >
            Configurar cardápio
          </a>
        </div>

        <form onSubmit={createOrder} className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
            <h2 className="mb-3 text-lg font-bold">Dados do cliente</h2>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                placeholder="Nome do cliente"
                value={form.customer}
                onChange={(e) => setForm({ ...form, customer: e.target.value })}
                required
              />

              <input
                placeholder="Telefone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <h2 className="mt-6 mb-3 text-lg font-bold">Montar marmita</h2>

            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={form.sizeName}
                onChange={(e) => setForm({ ...form, sizeName: e.target.value })}
              >
                {sizes.filter((s) => s.active).map((size) => (
                  <option key={size.id} value={size.name}>
                    {size.name} - R$ {Number(size.normalPrice).toFixed(2)}
                  </option>
                ))}
              </select>

              <select
                value={form.meat1}
                onChange={(e) => setForm({ ...form, meat1: e.target.value })}
              >
                <option value="">Selecione a carne</option>
                {meats.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}{item.specialPrice ? " - preço especial" : ""}
                  </option>
                ))}
              </select>

              {form.sizeName === "G com Duas Carnes" && (
                <select
                  value={form.meat2}
                  onChange={(e) => setForm({ ...form, meat2: e.target.value })}
                >
                  <option value="">Selecione a 2ª carne</option>
                  {meats.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <h3 className="mt-5 mb-2 font-bold">Acompanhamentos</h3>

            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {sides.map((item) => {
                const active = selectedSides.includes(item.name);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSide(item.name)}
                    className={`p-3 text-left text-sm font-semibold border ${
                      active
                        ? "bg-green-600 border-green-400 text-white"
                        : "bg-slate-800 border-slate-700 text-slate-200"
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>

            <h3 className="mt-5 mb-2 font-bold">Salada</h3>

<div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
  {salads.map((item) => {
    const active = form.salad === item.name;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => toggleSalad(item.name)}
        className={`p-3 text-left text-sm font-semibold border ${
          active
            ? "bg-green-600 border-green-400 text-white"
            : "bg-slate-800 border-slate-700 text-slate-200"
        }`}
      >
        {item.name}
      </button>
    );
  })}

  <button
    type="button"
    onClick={() => setForm({ ...form, salad: "" })}
    className={`p-3 text-left text-sm font-semibold border ${
      form.salad === ""
        ? "bg-red-700 border-red-400 text-white"
        : "bg-slate-800 border-slate-700 text-slate-200"
    }`}
  >
    Nenhuma salada
  </button>
</div>

            <h2 className="mt-6 mb-3 text-lg font-bold">Entrega e observações</h2>

            <div className="grid gap-3">
              <textarea
                placeholder="Endereço escrito"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />

              <input
                placeholder="Link da localização do WhatsApp / Google Maps"
                value={form.locationUrl}
                onChange={(e) => setForm({ ...form, locationUrl: e.target.value })}
              />

              <textarea
                placeholder="Observações: sem salada, sem feijão..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />

              <textarea
                placeholder="Pedido manual de emergência, se quiser ignorar as seleções"
                value={form.manualItems}
                onChange={(e) => setForm({ ...form, manualItems: e.target.value })}
              />
            </div>
          </section>

          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl h-fit">
            <h2 className="mb-3 text-lg font-bold">Resumo</h2>

            <div className="rounded-xl bg-slate-950 p-3 text-sm whitespace-pre-wrap border border-slate-800">
              {buildItemsText() || "Monte a marmita para ver o resumo."}
            </div>

            <div className="mt-4 grid gap-3">
              <input
                placeholder="Valor total"
                type="number"
                step="0.01"
                value={form.total}
                onChange={(e) => setForm({ ...form, total: e.target.value })}
                required
              />

              <select
                value={form.payment}
                onChange={(e) => setForm({ ...form, payment: e.target.value })}
              >
                <option>PIX</option>
                <option>Dinheiro</option>
                <option>Cartão</option>
                <option>Fiado</option>
              </select>

              <button
                type="submit"
                className="bg-green-600 p-4 text-lg font-black text-white"
              >
                Salvar e Imprimir
              </button>
            </div>
          </aside>
        </form>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-3 text-lg font-bold">Últimos pedidos</h2>

          <div className="grid gap-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <strong>#{order.id} - {order.customer}</strong>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{order.items}</p>
                <p className="mt-2 font-bold">
                  R$ {Number(order.total).toFixed(2)} - {order.payment}
                </p>
                <button
                  className="mt-2 bg-slate-800 px-4 py-2 text-sm font-bold text-white"
                  onClick={() => window.open(`/print/${order.id}`, "_blank")}
                >
                  Imprimir
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}