"use client";

import { useEffect, useMemo, useState } from "react";

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

export default function DivulgarPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [sizes, setSizes] = useState<MarmitaSize[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [clickedToday, setClickedToday] = useState<number[]>([]);

  const todayKey = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return `divulgacao-clientes-${today}`;
  }, []);

  async function loadMenu() {
    const res = await fetch("/api/menu");
    const data = await res.json();

    setMenu(data.items);
    setSizes(data.sizes);
  }

  async function loadAllCustomers() {
    let page = 1;
    let totalPages = 1;
    const allCustomers: Customer[] = [];

    do {
      const res = await fetch(`/api/customers?page=${page}&limit=50`);
      const data = await res.json();

      allCustomers.push(...data.customers);
      totalPages = data.totalPages;
      page++;
    } while (page <= totalPages);

    setCustomers(allCustomers);
  }

  useEffect(() => {
    loadMenu();
    loadAllCustomers();

    const saved = localStorage.getItem(todayKey);
    if (saved) {
      setClickedToday(JSON.parse(saved));
    }
  }, [todayKey]);

  const meats = menu.filter((item) => item.category === "carne" && item.active);
  const normalMeats = meats.filter((item) => !item.specialPrice);
  const specialMeats = meats.filter((item) => item.specialPrice);

  const sides = menu.filter(
    (item) => item.category === "acompanhamento" && item.active,
  );

  const salads = menu.filter(
    (item) => item.category === "salada" && item.active,
  );

  const activeSizes = sizes.filter((size) => size.active);

  function buildMenuMessage(customer?: Customer) {
    const normalPrices = activeSizes
      .map((size) => {
        if (size.name === "G com Duas Carnes") {
          return `${size.name}: R$ ${Number(size.twoMeatPrice || size.normalPrice).toFixed(2)}`;
        }

        return `${size.name}: R$ ${Number(size.normalPrice).toFixed(2)}`;
      })
      .join("\n");

    const specialPrices = activeSizes
      .filter((size) => size.name !== "G com Duas Carnes")
      .map((size) => `${size.name}: R$ ${Number(size.specialPrice).toFixed(2)}`)
      .join("\n");

    return [
      `Olá${customer?.name ? `, ${customer.name}` : ""}! 😄`,
      "",
      "🍛 *Cardápio de hoje da Marmitaria*",
      "",
      "🥩 *Opções de carne:*",
      normalMeats.length
        ? normalMeats.map((item) => `• ${item.name}`).join("\n")
        : "• Nenhuma carne normal ativa",
      "",
      specialMeats.length
        ? [
            "⭐ *Opções com preço especial:*",
            specialMeats.map((item) => `• ${item.name}`).join("\n"),
            "",
          ].join("\n")
        : "",
      "🍚 *Acompanhamentos:*",
      sides.length
        ? sides.map((item) => `• ${item.name}`).join("\n")
        : "• Nenhum acompanhamento ativo",
      "",
      "🥗 *Salada:*",
      salads.length
        ? salads.map((item) => `• ${item.name}`).join("\n")
        : "• Sem salada ativa",
      "",
      "💰 *Valores das marmitas:*",
      normalPrices,
      "",
      specialMeats.length
        ? ["⭐ *Valores das opções especiais:*", specialPrices, ""].join("\n")
        : "",
      "📍 Para pedir, me envie:",
      "• Nome",
      "• Tamanho da marmita",
      "• Opção de carne",
      "• Endereço",
      "• Localização, se tiver",
      "• Forma de pagamento",
      "",
      "Obrigada! 🙏",
    ]
      .filter(Boolean)
      .join("\n");
  }

  function cleanPhone(phone?: string | null) {
    if (!phone) return "";

    const onlyNumbers = phone.replace(/\D/g, "");

    if (onlyNumbers.startsWith("55")) {
      return onlyNumbers;
    }

    return `55${onlyNumbers}`;
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  }

  async function openCustomerWhatsApp(customer: Customer) {
    const phone = cleanPhone(customer.phone);

    if (!phone) {
      alert("Esse cliente não tem telefone cadastrado.");
      return;
    }

    const message = buildMenuMessage(customer);

    await copyText(message);

    const newClicked = Array.from(new Set([...clickedToday, customer.id]));
    setClickedToday(newClicked);
    localStorage.setItem(todayKey, JSON.stringify(newClicked));

    window.open(`https://wa.me/${phone}`, "_blank");
  }

  function resetTodayList() {
    const ok = confirm("Deseja desmarcar todos os clientes clicados hoje?");
    if (!ok) return;

    setClickedToday([]);
    localStorage.removeItem(todayKey);
  }

  const previewMessage = buildMenuMessage();

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Divulgação do cardápio</h1>
            <p className="text-sm text-slate-400">
              Clique no cliente, copie a mensagem automaticamente e abra o
              WhatsApp.
            </p>
          </div>

          <a href="/" className="rounded-xl bg-slate-800 px-4 py-3 font-bold">
            Voltar
          </a>
        </div>

        <section className="mb-5 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Mensagem gerada</h2>

            <button
              type="button"
              onClick={() => copyText(previewMessage)}
              className="bg-green-700 px-4 py-2 font-bold text-white"
            >
              Copiar mensagem
            </button>
          </div>

          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200">
            {previewMessage}
          </pre>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Clientes salvos</h2>
              <p className="text-sm text-slate-400">
                Vermelho/riscado = você já clicou nesse cliente hoje.
              </p>
            </div>

            <button
              type="button"
              onClick={resetTodayList}
              className="bg-red-700 px-4 py-2 font-bold text-white"
            >
              Resetar hoje
            </button>
          </div>

          <div className="grid gap-2">
            {customers.map((customer) => {
              const clicked = clickedToday.includes(customer.id);

              return (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => openCustomerWhatsApp(customer)}
                  className={`rounded-xl border p-3 text-left ${
                    clicked
                      ? "border-red-700 bg-red-950 text-red-300 line-through"
                      : "border-slate-800 bg-slate-950 text-slate-100"
                  }`}
                >
                  <strong>
                    #{customer.id} - {customer.name}
                  </strong>

                  <p className="text-sm">
                    {customer.phone || "Sem telefone cadastrado"}
                  </p>

                  <p className="text-sm text-slate-400">
                    {customer.address || "Sem endereço cadastrado"}
                  </p>
                </button>
              );
            })}

            {customers.length === 0 && (
              <p className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-400">
                Nenhum cliente cadastrado.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
