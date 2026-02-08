import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

const BodySchema = z.object({
  familyId: z.string().min(1, "Family ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "member"]).optional().default("member"),
  monthlyLimit: z
    .number()
    .min(0, "Monthly limit must be 0 or greater")
    .optional()
    .default(0),
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
        { error: parsed.error.errors[0]?.message || "Invalid member data" },
        { status: 400 },
      );
    }

    // Only allow if user is admin of the family
    const member = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: { userId: user.id, familyId: parsed.data.familyId },
      },
    });
    if (!member || member.role !== "admin")
      return NextResponse.json(
        { error: "You must be an admin to add members" },
        { status: 403 },
      );

    // Check if user exists, if not create them
    let invitedUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (invitedUser) {
      return NextResponse.json(
        { error: "This user already belongs to a family" },
        { status: 400 },
      );
    }

    if (!invitedUser) {
      // Create new user with provided password
      const hashedPassword = await hashPassword(parsed.data.password);
      invitedUser = await prisma.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          password: hashedPassword,
        },
      });
    }

    // Check if user is already a member
    const existing = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: invitedUser.id,
          familyId: parsed.data.familyId,
        },
      },
    });
    if (existing)
      return NextResponse.json(
        { error: "User is already a member of this family" },
        { status: 400 },
      );

    const fm = await prisma.familyMember.create({
      data: {
        userId: invitedUser.id,
        familyId: parsed.data.familyId,
        role: parsed.data.role,
        monthlyLimit: parsed.data.monthlyLimit,
      },
    });

    return NextResponse.json({ member: fm });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
