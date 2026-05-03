import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (!q.trim()) {
    const customers = await prisma.customer.findMany({
      orderBy: { id: "desc" },
      take: 20,
    });

    return NextResponse.json(customers);
  }

  const idNumber = Number(q);

  const customers = await prisma.customer.findMany({
    where: {
      OR: [
        !isNaN(idNumber) ? { id: idNumber } : {},
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
      ],
    },
    orderBy: { id: "desc" },
    take: 10,
  });

  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  const data = await req.json();

  const customer = await prisma.customer.create({
    data: {
      name: data.name,
      phone: data.phone || null,
      address: data.address || null,
      locationUrl: data.locationUrl || null,
    },
  });

  return NextResponse.json(customer);
}