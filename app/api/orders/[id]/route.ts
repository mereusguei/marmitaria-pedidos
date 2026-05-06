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

  const updateData: {
  status?: string;
  payment?: string;
  paid?: boolean;
} = {};

if (typeof data.status === "string") {
  updateData.status = data.status;
}

if (typeof data.payment === "string") {
  updateData.payment = data.payment;
}

if (typeof data.paid === "boolean") {
  updateData.paid = data.paid;
}

const order = await prisma.order.update({
  where: { id },
  data: updateData,
});

  return NextResponse.json(order);
}