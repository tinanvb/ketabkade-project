import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";


export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }
  const userId = session.user.id;

  const user = await User.findById(userId);
  const transactions = await Transaction.find({ userId }).sort({
    createdAt: -1,
  });

  return NextResponse.json({
    balance: user.balance,
    transactions,
  });
}
