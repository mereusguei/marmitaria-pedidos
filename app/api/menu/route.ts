import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const carnes = [
  "Feijoada Completa", "Peixe Frito", "Bife", "Peixe ao Molho", "Frango Assado",
  "Bife Acebolado", "Rabada com Mandioca", "Maria Isabel", "Pernil Assado com Barbecue",
  "Arroz com Galinha", "Costela com Mandioca", "Bisteca Suína Acebolada", "Bife com Ovo",
  "Strogonoff de Frango", "Panqueca com Carne Moída", "Strogonoff de Carne",
  "Almôndegas ao Molho", "Carne Suína com Arroz", "Dobradinha"
];

const acompanhamentos = [
  "Arroz Branco", "Feijão", "Farofa de Torresmo", "Macarrão ao Alho e Oleo",
  "Batata Frita", "Couve Refogada", "Farofa Mista", "Macarrao com Almôndegas",
  "Purê de Batata", "Farofa de Cenoura", "Macarrão ao Molho Shoyo",
  "Batata Doce Cozida", "Farofa de Calabresa", "Macarrão ao Molho Vermelho",
  "Batata com Ovo e Helmas", "Mandioca Frita", "Farofa de Banana",
  "Abobora Cabotian Refogada", "Batata Doce Frita", "Macarronese", "Vinagrete",
  "Batata Palha", "Macarrão Caipira", "Abobrinha Verde Refogada", "Farofa de Bacon",
  "Batata Sauté", "Beterraba Cozida", "Banana Frita",
  "Macarrão ao Molho Vermelho com Linguiça Toscana", "Farofa de Carne",
  "Chuchu Refogado", "Batata Rústica Frita"
];

const saladas = [
  "Salada de Repolho/Alface/Tomate",
  "Salada de Alface/Repolho",
  "Salada de Repolho/Cenoura",
  "Salada de Alface/Cenoura",
  "Salada de Alface/Tomate",
  "Salada de Repolho/Cenoura/Beterraba",
  "Salada de Vinagrete/Repolho/Tomate"
];

async function seedIfEmpty() {
  const count = await prisma.menuItem.count();

  if (count === 0) {
    await prisma.menuItem.createMany({
      data: [
        ...carnes.map((name) => ({
          name,
          category: "carne",
          specialPrice: name.includes("Peixe") || name === "Rabada com Mandioca",
        })),
        ...acompanhamentos.map((name) => ({
          name,
          category: "acompanhamento",
        })),
        ...saladas.map((name) => ({
          name,
          category: "salada",
        })),
      ],
    });
  }

  const sizeCount = await prisma.marmitaSize.count();

  if (sizeCount === 0) {
    await prisma.marmitaSize.createMany({
      data: [
        {
          name: "M",
          normalPrice: 17,
          specialPrice: 18,
          twoMeatPrice: null,
        },
        {
          name: "G",
          normalPrice: 20,
          specialPrice: 23,
          twoMeatPrice: 25,
        },
        {
          name: "G com Duas Carnes",
          normalPrice: 25,
          specialPrice: 25,
          twoMeatPrice: 25,
        },
      ],
    });
  }
}

export async function GET() {
  await seedIfEmpty();

  const items = await prisma.menuItem.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const sizes = await prisma.marmitaSize.findMany({
    orderBy: { id: "asc" },
  });

  return NextResponse.json({ items, sizes });
}

export async function POST(req: Request) {
  const data = await req.json();

  const item = await prisma.menuItem.create({
    data: {
      name: data.name,
      category: data.category,
      specialPrice: Boolean(data.specialPrice),
      active: true,
    },
  });

  return NextResponse.json(item);
}