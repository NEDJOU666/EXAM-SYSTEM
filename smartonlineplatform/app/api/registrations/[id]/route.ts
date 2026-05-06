import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const approveSchema = z.object({
  action:          z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
});

// PATCH /api/registrations/[id] — SUPER_ADMIN: approve or reject
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = approveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const reg = await prisma.universityRegistration.findUnique({ where: { id } });
  if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (reg.status !== "PENDING") {
    return NextResponse.json({ error: "Registration already reviewed" }, { status: 409 });
  }

  const { action, rejectionReason } = parsed.data;

  if (action === "reject") {
    const updated = await prisma.universityRegistration.update({
      where: { id },
      data: {
        status:          "REJECTED",
        rejectionReason: rejectionReason ?? null,
        reviewedAt:      new Date(),
      },
    });
    return NextResponse.json(updated);
  }

  // Approve: create University + UnivAdmin User in a transaction
  const tempPassword = Math.random().toString(36).slice(2, 10) + "A1!";
  const hashed = await bcrypt.hash(tempPassword, 12);

  const result = await prisma.$transaction(async (tx) => {
    // Create the university
    const university = await tx.university.create({
      data: {
        name:   reg.name,
        domain: reg.domain,
        slug:   reg.slug,
        status: "ACTIVE",
        phone:  reg.phone,
        country: reg.country,
      },
    });

    // Create the admin user
    const adminUser = await tx.user.create({
      data: {
        name:     reg.contactName,
        email:    reg.email,
        password: hashed,
        role:     "UNIV_ADMIN",
      },
    });

    // Create UnivAdmin profile
    await tx.univAdmin.create({
      data: { userId: adminUser.id, univId: university.id },
    });

    // Mark registration as approved
    const updated = await tx.universityRegistration.update({
      where: { id },
      data:  { status: "APPROVED", reviewedAt: new Date() },
    });

    return { university, adminUser, registration: updated, tempPassword };
  });

  // TODO: send approval email via Resend with tempPassword
  return NextResponse.json({
    university:   result.university,
    adminEmail:   result.adminUser.email,
    tempPassword: result.tempPassword,
    note:         "Email sending not yet wired — share these credentials manually.",
  });
}

// GET /api/registrations/[id] — SUPER_ADMIN: get single registration
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const reg = await prisma.universityRegistration.findUnique({ where: { id } });
  if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(reg);
}
