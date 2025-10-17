import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function requireSession(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return { session };
}

export async function requireRole(request, roles = []) {
  const result = await requireSession(request);
  if (result instanceof NextResponse) return result;

  const { session } = result;
  if (!roles.includes(session.user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return { session };
}
