import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";

const BodySchema = z.object({
  name: z.string().min(1, "Family name is required"),
  description: z.string().optional(),
  currency: z.string().optional(),
  monthlyBudget: z.number().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid family data" },
        { status: 400 },
      );
    }

    // User can create only ONE family
    const existingMembership = await prisma.familyMember.findFirst({
      where: { userId: user.id },
    });

    if (existingMembership) {
      return NextResponse.json(
        {
          error: "You already belong to a family and cannot create another one",
        },
        { status: 400 },
      );
    }

    const family = await prisma.family.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        currency: parsed.data.currency ?? "USD",
        monthlyBudget: parsed.data.monthlyBudget ?? 0,
        members: {
          create: {
            userId: user.id,
            role: "admin",
            monthlyLimit: 0,
          },
        },
      },
      include: { members: true },
    });

    return NextResponse.json({ family });
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const families = await prisma.family.findMany({
    where: { members: { some: { userId: user.id } } },
    include: { members: { include: { user: true } } },
  });

  return NextResponse.json({ families });
}
