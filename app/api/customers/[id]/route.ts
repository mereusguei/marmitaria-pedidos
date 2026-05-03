import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = Number(params.id);
  const data = await req.json();

  if (!id || isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      name: data.name,
      phone: data.phone || null,
      address: data.address || null,
      locationUrl: data.locationUrl || null,
    },
  });

  return NextResponse.json(customer);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = Number(params.id);

  if (!id || isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  await prisma.order.updateMany({
    where: { customerId: id },
    data: { customerId: null },
  });

  await prisma.customer.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}