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

  let customerId = data.customerId ? Number(data.customerId) : null;

  if (data.createCustomer) {
    const newCustomer = await prisma.customer.create({
      data: {
        name: data.customer,
        phone: data.phone || null,
        address: data.address || null,
        locationUrl: data.locationUrl || null,
      },
    });

    customerId = newCustomer.id;
  }

  if (data.updateCustomerAddress && customerId) {
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        phone: data.phone || null,
        address: data.address || null,
        locationUrl: data.locationUrl || null,
      },
    });
  }

  const order = await prisma.order.create({
    data: {
      customerId,
      customer: data.customer,
      phone: data.phone || null,
      items: data.items,
      total: Number(data.total),
      payment: data.payment,
      address: data.address || null,
      locationUrl: data.locationUrl || null,
      notes: data.notes || null,
      sizeName: data.sizeName || null,
      meat1: data.meat1 || null,
      meat2: data.meat2 || null,
      sides: data.sides || null,
      salad: data.salad || null,
    },
  });

  return NextResponse.json(order);
}