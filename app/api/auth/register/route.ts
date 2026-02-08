import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

const BodySchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email, password, name } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 },
      );

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
      },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
