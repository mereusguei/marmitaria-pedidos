import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const data = await req.json();
  const id = Number(params.id);

  if (!id || isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const item = await prisma.menuItem.update({
    where: { id },
    data: {
      name: data.name,
      active: data.active,
      specialPrice: data.specialPrice,
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = Number(params.id);

  await prisma.menuItem.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}