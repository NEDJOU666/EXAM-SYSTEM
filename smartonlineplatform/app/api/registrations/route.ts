import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name:        z.string().min(2),
  domain:      z.string().min(3),
  slug:        z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  contactName: z.string().min(2),
  email:       z.string().email(),
  phone:       z.string().optional(),
  country:     z.string().optional(),
});

// POST /api/registrations — public; anyone can apply
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { name, domain, slug, contactName, email, phone, country } = parsed.data;

  // Check uniqueness
  const [slugTaken, emailTaken] = await Promise.all([
    prisma.universityRegistration.findUnique({ where: { slug } }),
    prisma.universityRegistration.findUnique({ where: { email } }),
  ]);

  if (slugTaken) return NextResponse.json({ error: "This portal slug is already taken." }, { status: 409 });
  if (emailTaken) return NextResponse.json({ error: "An application with this email already exists." }, { status: 409 });

  // Also check active universities
  const [univSlug, univDomain] = await Promise.all([
    prisma.university.findUnique({ where: { slug } }),
    prisma.university.findUnique({ where: { domain } }),
  ]);
  if (univSlug)   return NextResponse.json({ error: "This slug is already in use by an active university." }, { status: 409 });
  if (univDomain) return NextResponse.json({ error: "This domain is already registered." }, { status: 409 });

  const registration = await prisma.universityRegistration.create({
    data: { name, domain, slug, contactName, email, phone, country },
  });

  return NextResponse.json(registration, { status: 201 });
}

// GET /api/registrations — SUPER_ADMIN only; list all
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const registrations = await prisma.universityRegistration.findMany({
    where: status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : {},
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(registrations);
}
