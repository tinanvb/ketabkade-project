import connectToDatabase from "@/app/lib/db";
import { requireRole } from "@/app/utils/auth";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request) {
  const errorResponse = await requireRole(request, ["admin"]);
  if (errorResponse instanceof NextResponse) return errorResponse;

  try {
    await connectToDatabase();

    const tickets = await Ticket.find()
      .populate("user", "firstname lastname")
      .sort({ createdAt: -1 });

    return NextResponse.json(tickets, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: err.message },
      {
        status: 500,
      }
    );
  }
}
