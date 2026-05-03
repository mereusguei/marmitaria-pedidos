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
    return NextResponse.json(
      { error: "ID inválido" },
      { status: 400 }
    );
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status: data.status },
  });

  return NextResponse.json(order);
}