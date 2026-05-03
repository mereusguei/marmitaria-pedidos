import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await req.json();

  const order = await prisma.order.update({
    where: { id: Number(params.id) },
    data: { status: data.status },
  });

  return NextResponse.json(order);
}