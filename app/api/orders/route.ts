import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const data = await req.json();

  const order = await prisma.order.create({
    data: {
      customer: data.customer,
      phone: data.phone || null,
      items: data.items,
      total: Number(data.total),
      payment: data.payment,
      address: data.address || null,
      locationUrl: data.locationUrl || null,
      notes: data.notes || null,
    },
  });

  return NextResponse.json(order);
}