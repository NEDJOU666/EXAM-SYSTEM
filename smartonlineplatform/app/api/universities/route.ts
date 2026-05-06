import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const unis = await prisma.university.findMany({
    select: { id: true, name: true, domain: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(unis);
}

const createSchema = z.object({
  name:   z.string().min(2),
  domain: z.string().min(3),
  slug:   z.string().min(2).regex(/^[a-z0-9-]+$/),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  try {
    const uni = await prisma.university.create({ data: parsed.data });
    return NextResponse.json(uni, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Domain already exists." }, { status: 409 });
  }
}
