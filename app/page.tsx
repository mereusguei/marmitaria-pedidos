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

type Customer = {
  id: number;
  name: string;
  phone?: string | null;
  address?: string | null;
  locationUrl?: string | null;
};

type OrderMarmita = {
  id: number;
  sizeName: string;
  meat1: string;
  meat2: string;
  sides: string[];
  salad: string;
  price: number;
  quantity: number;
};

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [sizes, setSizes] = useState<MarmitaSize[]>([]);

  const [selectedSides, setSelectedSides] = useState<string[]>([]);

  const [orderMarmitas, setOrderMarmitas] = useState<OrderMarmita[]>([]);

  const [currentMarmitaQuantity, setCurrentMarmitaQuantity] = useState(1);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null,
  );
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [modalCustomers, setModalCustomers] = useState<Customer[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerModalForm, setCustomerModalForm] = useState({
    name: "",
    phone: "",
    address: "",
    locationUrl: "",
  });

  const [modalCustomerSearch, setModalCustomerSearch] = useState("");
  const [modalCustomersPage, setModalCustomersPage] = useState(1);
  const [modalCustomersTotalPages, setModalCustomersTotalPages] = useState(1);

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
  });

  async function loadOrders(page = ordersPage) {
    const res = await fetch(`/api/orders?page=${page}&limit=5`);
    const data = await res.json();

    setOrders(data.orders);
    setOrdersPage(data.page);
    setOrdersTotalPages(data.totalPages);
  }

  async function loadMenu() {
    const res = await fetch("/api/menu");
    const data = await res.json();

    setMenu(data.items);
    setSizes(data.sizes);

    const activeSides = data.items
      .filter(
        (item: MenuItem) => item.category === "acompanhamento" && item.active,
      )
      .map((item: MenuItem) => item.name);

    const firstActiveSalad = data.items.find(
      (item: MenuItem) => item.category === "salada" && item.active,
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
  const sides = menu.filter(
    (item) => item.category === "acompanhamento" && item.active,
  );
  const salads = menu.filter(
    (item) => item.category === "salada" && item.active,
  );

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
        : [...prev, name],
    );
  }

  function buildItemsText() {
    if (orderMarmitas.length === 0) {
      return "Nenhuma marmita adicionada ao pedido.";
    }

    return orderMarmitas
      .map((marmita, index) => {
        return [
          `MARMITA ${index + 1} - QTD: ${marmita.quantity}`,
          `Tamanho: ${marmita.sizeName}`,
          marmita.meat1 ? `Carne: ${marmita.meat1}` : "",
          marmita.meat2 ? `2ª Carne: ${marmita.meat2}` : "",
          marmita.sides.length
            ? `Acompanhamentos: ${marmita.sides.join(", ")}`
            : "Acompanhamentos: nenhum",
          marmita.salad ? `Salada: ${marmita.salad}` : "Salada: nenhuma",
          `Valor unitário: R$ ${Number(marmita.price).toFixed(2)}`,
          `Subtotal: R$ ${Number(marmita.price * marmita.quantity).toFixed(2)}`,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n--------------------\n\n");
  }

  async function searchCustomers(value: string) {
    setCustomerSearch(value);

    if (!value.trim()) {
      setCustomers([]);
      return;
    }

    const res = await fetch(`/api/customers?q=${encodeURIComponent(value)}`);
    const data = await res.json();
    setCustomers(data.customers);
  }

  function selectCustomer(customer: Customer) {
    setSelectedCustomerId(customer.id);
    setIsNewCustomer(false);
    setCustomerSearch(`#${customer.id} - ${customer.name}`);

    setForm((prev) => ({
      ...prev,
      customer: customer.name,
      phone: customer.phone || "",
      address: customer.address || "",
      locationUrl: customer.locationUrl || "",
    }));

    setCustomers([]);
  }

  function startNewCustomer() {
    setSelectedCustomerId(null);
    setIsNewCustomer(true);
    setCustomerSearch("");

    setForm((prev) => ({
      ...prev,
      customer: "",
      phone: "",
      address: "",
      locationUrl: "",
    }));
  }

  async function loadModalCustomers(
    page = modalCustomersPage,
    q = modalCustomerSearch,
  ) {
    const res = await fetch(
      `/api/customers?page=${page}&limit=10&q=${encodeURIComponent(q)}`,
    );

    const data = await res.json();

    setModalCustomers(data.customers);
    setModalCustomersPage(data.page);
    setModalCustomersTotalPages(data.totalPages);
  }

  async function openCustomerModal() {
    setIsCustomerModalOpen(true);
    setModalCustomerSearch("");
    setModalCustomersPage(1);
    await loadModalCustomers(1, "");
  }

  function closeCustomerModal() {
    setIsCustomerModalOpen(false);
    setEditingCustomer(null);
    setCustomerModalForm({
      name: "",
      phone: "",
      address: "",
      locationUrl: "",
    });
  }

  function editCustomer(customer: Customer) {
    setEditingCustomer(customer);
    setCustomerModalForm({
      name: customer.name,
      phone: customer.phone || "",
      address: customer.address || "",
      locationUrl: customer.locationUrl || "",
    });
  }

  async function saveCustomerFromModal(e: React.FormEvent) {
    e.preventDefault();

    if (editingCustomer) {
      const res = await fetch(`/api/customers/${editingCustomer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerModalForm),
      });

      const updated = await res.json();

      if (selectedCustomerId === updated.id) {
        selectCustomer(updated);
      }
    } else {
      await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerModalForm),
      });
    }

    setEditingCustomer(null);
    setCustomerModalForm({
      name: "",
      phone: "",
      address: "",
      locationUrl: "",
    });

    await loadModalCustomers(modalCustomersPage, modalCustomerSearch);
  }

  async function deleteCustomer(id: number) {
    const ok = confirm("Tem certeza que deseja excluir este cliente?");
    if (!ok) return;

    await fetch(`/api/customers/${id}`, {
      method: "DELETE",
    });

    if (selectedCustomerId === id) {
      setSelectedCustomerId(null);
      setCustomerSearch("");
      setForm((prev) => ({
        ...prev,
        customer: "",
        phone: "",
        address: "",
        locationUrl: "",
      }));
    }

    await loadModalCustomers(modalCustomersPage, modalCustomerSearch);
  }

  function toggleNewCustomer() {
    if (isNewCustomer) {
      setIsNewCustomer(false);
      return;
    }

    startNewCustomer();
  }

  async function searchModalCustomers(value: string) {
    setModalCustomerSearch(value);
    setModalCustomersPage(1);
    await loadModalCustomers(1, value);
  }

  function resetMarmitaBuilder() {
    const activeSides = menu
      .filter((item) => item.category === "acompanhamento" && item.active)
      .map((item) => item.name);

    const firstActiveSalad = menu.find(
      (item) => item.category === "salada" && item.active,
    );

    setForm((prev) => ({
      ...prev,
      sizeName: "M",
      meat1: "",
      meat2: "",
      salad: firstActiveSalad?.name || "",
      total: "",
    }));

    setSelectedSides(activeSides);
    setCurrentMarmitaQuantity(1);
  }

  function addMarmitaToOrder() {
    if (!form.meat1) {
      alert("Selecione pelo menos uma carne.");
      return;
    }

    if (form.sizeName === "G com Duas Carnes" && !form.meat2) {
      alert("Selecione a segunda carne.");
      return;
    }

    const newMarmita: OrderMarmita = {
      id: Date.now(),
      sizeName: form.sizeName,
      meat1: form.meat1,
      meat2: form.sizeName === "G com Duas Carnes" ? form.meat2 : "",
      sides: selectedSides,
      salad: form.salad,
      price: calculatedTotal,
      quantity: currentMarmitaQuantity,
    };

    setOrderMarmitas((prev) => [...prev, newMarmita]);
    resetMarmitaBuilder();
  }

  function updateMarmitaQuantity(id: number, quantity: number) {
    const safeQuantity = Math.max(1, quantity);

    setOrderMarmitas((prev) =>
      prev.map((marmita) =>
        marmita.id === id
          ? {
              ...marmita,
              quantity: safeQuantity,
            }
          : marmita,
      ),
    );
  }

  function removeMarmita(id: number) {
    setOrderMarmitas((prev) => prev.filter((marmita) => marmita.id !== id));
  }

  const orderTotal = orderMarmitas.reduce(
    (sum, marmita) => sum + Number(marmita.price) * marmita.quantity,
    0,
  );

  async function createOrder(e: React.FormEvent) {
    e.preventDefault();

    if (orderMarmitas.length === 0) {
      alert("Adicione pelo menos uma marmita ao pedido.");
      return;
    }

    const items = buildItemsText();

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: selectedCustomerId,
        createCustomer: isNewCustomer,
        updateCustomerAddress: Boolean(selectedCustomerId),

        customer: form.customer,
        phone: form.phone,
        sizeName:
          orderMarmitas.length === 1 ? orderMarmitas[0].sizeName : "Várias",
        meat1: orderMarmitas.length === 1 ? orderMarmitas[0].meat1 : null,
        meat2: orderMarmitas.length === 1 ? orderMarmitas[0].meat2 : null,
        salad: orderMarmitas.length === 1 ? orderMarmitas[0].salad : null,
        total: orderTotal,
        payment: form.payment,
        address: form.address,
        locationUrl: form.locationUrl,
        notes: form.notes,
        items,
        sides:
          orderMarmitas.length === 1
            ? orderMarmitas[0].sides.join(", ")
            : "Vários",
      }),
    });

    const order = await res.json();

    const activeSides = menu
      .filter((item) => item.category === "acompanhamento" && item.active)
      .map((item) => item.name);

    const firstActiveSalad = menu.find(
      (item) => item.category === "salada" && item.active,
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
    });

    setSelectedSides(activeSides);

    setOrderMarmitas([]);

    setCurrentMarmitaQuantity(1);

    setCustomerSearch("");
    setSelectedCustomerId(null);
    setIsNewCustomer(false);
    setCustomers([]);

    await loadOrders(1);

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
            <p className="text-sm text-slate-400">
              Sistema interno de anotação e impressão
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href="/divulgar"
              className="rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white border border-green-600"
            >
              Divulgar cardápio
            </a>

            <a
              href="/config"
              className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-white border border-slate-700"
            >
              Configurar cardápio
            </a>
          </div>
        </div>

        <form
          onSubmit={createOrder}
          className="grid gap-4 lg:grid-cols-[1fr_380px]"
        >
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
            <h2 className="mb-3 text-lg font-bold">Dados do cliente</h2>

            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={toggleNewCustomer}
                className={`px-4 py-3 font-bold ${
                  isNewCustomer
                    ? "bg-green-700 text-white"
                    : "bg-slate-800 text-slate-200"
                }`}
              >
                Cliente Novo?
              </button>
              <button
                type="button"
                onClick={openCustomerModal}
                className="bg-blue-700 px-4 py-3 font-bold text-white"
              >
                Editar Cliente
              </button>
            </div>

            <div className="relative grid gap-3 md:grid-cols-2">
              {!isNewCustomer && (
                <div className="relative">
                  <input
                    placeholder="Digite ID, número ou nome do cliente"
                    value={customerSearch}
                    onChange={(e) => searchCustomers(e.target.value)}
                  />

                  {customers.length > 0 && (
                    <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-slate-700 bg-slate-950 shadow-xl">
                      {customers.map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => selectCustomer(customer)}
                          className="block w-full border-b border-slate-800 p-3 text-left hover:bg-slate-800"
                        >
                          <strong>
                            #{customer.id} - {customer.name}
                          </strong>
                          <br />
                          <span className="text-sm text-slate-400">
                            {customer.phone || "Sem telefone"} ·{" "}
                            {customer.address || "Sem endereço"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

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

              {selectedCustomerId && (
                <div className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300">
                  Cliente selecionado: <strong>#{selectedCustomerId}</strong>
                </div>
              )}
            </div>

            <h2 className="mt-6 mb-3 text-lg font-bold">Montar marmita</h2>

            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={form.sizeName}
                onChange={(e) => setForm({ ...form, sizeName: e.target.value })}
              >
                {sizes
                  .filter((s) => s.active)
                  .map((size) => (
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
                    {item.name}
                    {item.specialPrice ? " - preço especial" : ""}
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

            <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-3">
              <div className="mb-3 text-sm text-slate-300">
                Marmita atual:{" "}
                <strong>R$ {Number(calculatedTotal).toFixed(2)}</strong>
              </div>

              <div className="mb-3 grid gap-2">
                <label className="text-sm font-bold text-slate-300">
                  Quantidade desta marmita
                </label>

                <input
                  type="number"
                  min="1"
                  value={currentMarmitaQuantity}
                  onChange={(e) =>
                    setCurrentMarmitaQuantity(
                      Math.max(1, Number(e.target.value || 1)),
                    )
                  }
                />

                <div className="text-sm text-slate-400">
                  Subtotal:{" "}
                  <strong>
                    R${" "}
                    {Number(calculatedTotal * currentMarmitaQuantity).toFixed(
                      2,
                    )}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                onClick={addMarmitaToOrder}
                className="w-full bg-green-700 p-4 text-lg font-black text-white"
              >
                Adicionar marmita ao pedido
              </button>
            </div>

            <h2 className="mt-6 mb-3 text-lg font-bold">
              Entrega e observações
            </h2>

            <div className="grid gap-3">
              <textarea
                placeholder="Endereço escrito"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />

              <input
                placeholder="Link da localização do WhatsApp / Google Maps"
                value={form.locationUrl}
                onChange={(e) =>
                  setForm({ ...form, locationUrl: e.target.value })
                }
              />

              <textarea
                placeholder="Observações: sem salada, sem feijão..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </section>

          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl h-fit">
            <h2 className="mb-3 text-lg font-bold">Resumo</h2>

            <div className="rounded-xl bg-slate-950 p-3 text-sm whitespace-pre-wrap border border-slate-800">
              {buildItemsText()}
            </div>

            <div className="mt-4 grid gap-2">
              {orderMarmitas.map((marmita, index) => (
                <div
                  key={marmita.id}
                  className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm"
                >
                  <strong>
                    Marmita {index + 1} - Qtd: {marmita.quantity}
                  </strong>
                  <p>
                    {marmita.sizeName} - {marmita.meat1}
                  </p>
                  {marmita.meat2 && <p>2ª carne: {marmita.meat2}</p>}
                  <p className="font-bold">
                    Unitário: R$ {Number(marmita.price).toFixed(2)}
                  </p>
                  <p className="font-bold">
                    Subtotal: R${" "}
                    {Number(marmita.price * marmita.quantity).toFixed(2)}
                  </p>

                  <div className="mt-2 grid gap-2">
                    <label className="text-xs font-bold text-slate-300">
                      Quantidade
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={marmita.quantity}
                      onChange={(e) =>
                        updateMarmitaQuantity(
                          marmita.id,
                          Number(e.target.value || 1),
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={() => removeMarmita(marmita.id)}
                      className="bg-red-700 px-3 py-2 text-xs font-bold text-white"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3">
              <div className="rounded-xl border border-green-700 bg-green-950 p-4">
                <p className="text-sm text-green-300">Total do pedido</p>
                <strong className="text-2xl">
                  R$ {Number(orderTotal).toFixed(2)}
                </strong>
              </div>

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
              <div
                key={order.id}
                className="rounded-xl border border-slate-800 bg-slate-950 p-3"
              >
                <strong>
                  #{order.id} - {order.customer}
                </strong>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">
                  {order.items}
                </p>
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

          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: ordersTotalPages }, (_, index) => {
              const page = index + 1;

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => loadOrders(page)}
                  className={`px-3 py-2 font-bold ${
                    ordersPage === page
                      ? "bg-green-700 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4">
          <div className="mx-auto max-w-5xl rounded-2xl border border-slate-700 bg-slate-900 p-4 text-slate-100">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Editar clientes</h2>
                <p className="text-sm text-slate-400">
                  Cadastre, edite ou exclua clientes salvos.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCustomerModal}
                className="bg-slate-800 px-4 py-2 font-bold"
              >
                Fechar
              </button>
            </div>

            <form
              onSubmit={saveCustomerFromModal}
              className="mb-5 grid gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 md:grid-cols-2"
            >
              <input
                placeholder="Nome"
                value={customerModalForm.name}
                onChange={(e) =>
                  setCustomerModalForm({
                    ...customerModalForm,
                    name: e.target.value,
                  })
                }
                required
              />

              <input
                placeholder="Telefone"
                value={customerModalForm.phone}
                onChange={(e) =>
                  setCustomerModalForm({
                    ...customerModalForm,
                    phone: e.target.value,
                  })
                }
              />

              <textarea
                placeholder="Endereço escrito"
                value={customerModalForm.address}
                onChange={(e) =>
                  setCustomerModalForm({
                    ...customerModalForm,
                    address: e.target.value,
                  })
                }
              />

              <textarea
                placeholder="Link da localização / QR Code"
                value={customerModalForm.locationUrl}
                onChange={(e) =>
                  setCustomerModalForm({
                    ...customerModalForm,
                    locationUrl: e.target.value,
                  })
                }
              />

              <button
                type="submit"
                className="bg-green-700 p-3 font-black text-white"
              >
                {editingCustomer ? "Atualizar cliente" : "Adicionar cliente"}
              </button>

              {editingCustomer && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCustomer(null);
                    setCustomerModalForm({
                      name: "",
                      phone: "",
                      address: "",
                      locationUrl: "",
                    });
                  }}
                  className="bg-slate-700 p-3 font-bold text-white"
                >
                  Cancelar edição
                </button>
              )}
            </form>

            <div className="mb-4">
              <input
                placeholder="Pesquisar cliente por nome, ID ou telefone"
                value={modalCustomerSearch}
                onChange={(e) => searchModalCustomers(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="grid gap-2">
              {modalCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="grid gap-2 rounded-xl border border-slate-800 bg-slate-950 p-3 md:grid-cols-[1fr_auto_auto]"
                >
                  <div>
                    <strong>
                      #{customer.id} - {customer.name}
                    </strong>
                    <p className="text-sm text-slate-400">
                      {customer.phone || "Sem telefone"}
                    </p>
                    <p className="text-sm text-slate-400">
                      {customer.address || "Sem endereço"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => editCustomer(customer)}
                    className="bg-blue-700 px-4 py-2 font-bold text-white"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteCustomer(customer.id)}
                    className="bg-red-700 px-4 py-2 font-bold text-white"
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: modalCustomersTotalPages }, (_, index) => {
                const page = index + 1;

                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() =>
                      loadModalCustomers(page, modalCustomerSearch)
                    }
                    className={`px-3 py-2 font-bold ${
                      modalCustomersPage === page
                        ? "bg-green-700 text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
