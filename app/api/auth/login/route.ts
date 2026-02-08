import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-please";

const BodySchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
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

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );

    const valid = await verifyPassword(password, user.password);
    if (!valid)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const cookie = serialize("fb_token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    const safeUser = { id: user.id, name: user.name, email: user.email };

    return NextResponse.json(
      { user: safeUser },
      { status: 200, headers: { "Set-Cookie": cookie } },
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
