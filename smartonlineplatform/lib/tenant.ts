import { headers } from "next/headers";
import prisma from "./prisma";
import type { University } from "@prisma/client";

/** Read the tenant slug injected by middleware. */
export async function getTenantSlug(): Promise<string | null> {
  const h = await headers();
  return h.get("x-tenant-slug");
}

/** Fetch the active University for the current tenant slug. Returns null if not found or suspended. */
export async function getActiveTenant(): Promise<University | null> {
  const slug = await getTenantSlug();
  if (!slug) return null;

  const univ = await prisma.university.findUnique({ where: { slug } });
  if (!univ || univ.status === "SUSPENDED") return null;
  return univ;
}

/** Get tenant by slug — used in API routes. */
export async function getTenantBySlug(slug: string): Promise<University | null> {
  return prisma.university.findUnique({ where: { slug } });
}
