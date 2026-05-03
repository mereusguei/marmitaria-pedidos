"use client";

import { useEffect, useState } from "react";

type MenuItem = {
  id: number;
  name: string;
  category: string;
  active: boolean;
  specialPrice: boolean;
};

export default function ConfigPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState({
    name: "",
    category: "carne",
    specialPrice: false,
  });

  async function loadMenu() {
    const res = await fetch("/api/menu");
    const data = await res.json();
    setItems(data.items);
  }

  useEffect(() => {
    loadMenu();
  }, []);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm({
      name: "",
      category: "carne",
      specialPrice: false,
    });

    await loadMenu();
  }

  async function updateItem(item: MenuItem, data: Partial<MenuItem>) {
    await fetch(`/api/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...item,
        ...data,
      }),
    });

    await loadMenu();
  }

  async function deleteItem(id: number) {
    const ok = confirm("Tem certeza que deseja remover?");
    if (!ok) return;

    await fetch(`/api/menu/${id}`, {
      method: "DELETE",
    });

    await loadMenu();
  }

  const groups = [
    { key: "carne", title: "Carnes" },
    { key: "acompanhamento", title: "Acompanhamentos" },
    { key: "salada", title: "Saladas" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Configurar cardápio</h1>
            <p className="text-sm text-slate-400">Adicione, remova, ative ou marque preço especial.</p>
          </div>

          <a href="/" className="rounded-xl bg-slate-800 px-4 py-3 font-bold">
            Voltar
          </a>
        </div>

        <form
          onSubmit={addItem}
          className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4 grid gap-3"
        >
          <h2 className="text-lg font-bold">Adicionar novo item</h2>

          <input
            placeholder="Nome do item"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="carne">Carne</option>
            <option value="acompanhamento">Acompanhamento</option>
            <option value="salada">Salada</option>
          </select>

          {form.category === "carne" && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.specialPrice}
                onChange={(e) => setForm({ ...form, specialPrice: e.target.checked })}
              />
              Preço especial tipo Peixe/Rabada
            </label>
          )}

          <button className="bg-green-600 p-3 font-black text-white">
            Adicionar
          </button>
        </form>

        <div className="grid gap-5">
          {groups.map((group) => (
            <section key={group.key} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <h2 className="mb-3 text-xl font-bold">{group.title}</h2>

              <div className="grid gap-2">
                {items.filter((item) => item.category === group.key).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-3 grid gap-2 md:grid-cols-[1fr_auto_auto_auto] md:items-center"
                  >
                    <strong className={item.active ? "text-white" : "text-slate-500"}>
                      {item.name}
                    </strong>

                    {item.category === "carne" && (
                      <button
                        onClick={() => updateItem(item, { specialPrice: !item.specialPrice })}
                        className={`px-3 py-2 text-sm font-bold ${
                          item.specialPrice ? "bg-yellow-600" : "bg-slate-800"
                        }`}
                      >
                        {item.specialPrice ? "Preço especial" : "Preço normal"}
                      </button>
                    )}

                    <button
                      onClick={() => updateItem(item, { active: !item.active })}
                      className={`px-3 py-2 text-sm font-bold ${
                        item.active ? "bg-green-700" : "bg-slate-700"
                      }`}
                    >
                      {item.active ? "Ativo" : "Inativo"}
                    </button>

                    <button
                      onClick={() => deleteItem(item.id)}
                      className="bg-red-700 px-3 py-2 text-sm font-bold"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}