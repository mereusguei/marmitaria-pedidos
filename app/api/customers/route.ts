import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") || "";
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");

  const safePage = Math.max(page, 1);
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const skip = (safePage - 1) * safeLimit;

  const idNumber = Number(q);

  const where = q.trim()
    ? {
        OR: [
          !isNaN(idNumber) ? { id: idNumber } : {},
          { name: { contains: q, mode: "insensitive" as const } },
          { phone: { contains: q } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { id: "desc" },
      skip,
      take: safeLimit,
    }),
    prisma.customer.count({ where }),
  ]);

  return NextResponse.json({
    customers,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.max(Math.ceil(total / safeLimit), 1),
  });
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