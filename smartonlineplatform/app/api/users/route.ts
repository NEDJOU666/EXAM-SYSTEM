import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

function isAdmin(role: string) {
  return role === "UNIV_ADMIN" || role === "SUPER_ADMIN";
}

// GET /api/users — list users scoped to the admin's university (UNIV_ADMIN) or all (SUPER_ADMIN)
export async function GET() {
  const session = await auth();
  if (!session || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let where = {};
  if (session.user.role === "UNIV_ADMIN") {
    const univAdmin = await prisma.univAdmin.findUnique({
      where: { userId: session.user.id },
    });
    if (!univAdmin) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    where = {
      OR: [
        { student: { univId: univAdmin.univId } },
        { teacher: { univId: univAdmin.univId } },
        { univAdmin: { univId: univAdmin.univId } },
      ],
    };
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      student: { select: { univ: { select: { name: true } } } },
      teacher: { select: { univ: { select: { name: true } } } },
      univAdmin: { select: { univ: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

const createSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(8),
  role:     z.enum(["STUDENT", "TEACHER"]),
});

// POST /api/users — UNIV_ADMIN creates a teacher or student in their university
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "UNIV_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const univAdmin = await prisma.univAdmin.findUnique({
    where: { userId: session.user.id },
  });
  if (!univAdmin) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { name, email, password, role } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already in use." }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { name, email, password: hashed, role },
    });
    if (role === "STUDENT") {
      await tx.student.create({ data: { userId: newUser.id, univId: univAdmin.univId } });
    } else {
      await tx.teacher.create({ data: { userId: newUser.id, univId: univAdmin.univId } });
    }
    return newUser;
  });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role }, { status: 201 });
}

const updateSchema = z.object({
  id:   z.string(),
  role: z.enum(["STUDENT", "TEACHER", "UNIV_ADMIN"]).optional(),
});

// PATCH /api/users — update role (admin only)
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: parsed.data.id },
    data:  { ...(parsed.data.role ? { role: parsed.data.role } : {}) },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(updated);
}

// DELETE /api/users — admin only
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await req.json();
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
