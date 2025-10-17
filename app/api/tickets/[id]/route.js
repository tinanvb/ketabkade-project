import connectToDatabase from "@/app/lib/db";
import Ticket from "@/models/Ticket";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import sanitizeHtml from "sanitize-html";
import { requireRole } from "@/app/utils/auth";

const MAX_TEXT = 2000;

export async function GET(request, { params }) {
  await connectToDatabase();

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "شناسه نامعتبر است." },
      {
        status: 400,
      }
    );
  }

  const errorResponse = await requireRole(request, ["admin"]);
  if (errorResponse instanceof NextResponse) return errorResponse;

  try {
    const ticket = await Ticket.findById(id).populate(
      "user",
      "firstname lastname email username phoneNumber createdAt isActive"
    );
    if (!ticket) {
      return NextResponse.json(
        { message: "تیکت پیدا نشد." },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "خطا در دریافت تیکت", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  await connectToDatabase();
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "شناسه نامعتبر است." },
      { status: 400 }
    );
  }

  const errorResponse = await requireRole(request, ["admin"]);
  if (errorResponse instanceof NextResponse) return errorResponse;

  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { message: "متن پیام الزامی است" },
        {
          status: 400,
        }
      );
    }
    if (text.length > MAX_TEXT) {
      return NextResponse.json(
        {
          message: `متن پیام باید حداکثر ${MAX_TEXT} کاراکتر باشد`,
        },
        { status: 400 }
      );
    }

    // پاکسازی متن برای جلوگیری از XSS
    const cleanText = sanitizeHtml(text, {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return NextResponse.json(
        { message: "تیکت پیدا نشد" },
        {
          status: 404,
        }
      );
    }

    // اضافه کردن پیام جدید
    const newMessage = {
      sender: "admin", // چون سمت ادمین هست
      text: cleanText,
      date: new Date(),
    };
    ticket.messages.push(newMessage);
    ticket.status = "answered";
    ticket.updatedAt = new Date();
    await ticket.save();

    return NextResponse.json(newMessage, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: err.message },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request, { params }) {
  await connectToDatabase();

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "شناسه نامعتبر است." },
      { status: 400 }
    );
  }
  const errorResponse = await requireRole(request, ["admin"]);
  if (errorResponse instanceof NextResponse) return errorResponse;

  try {
    const deletedTicket = await Ticket.findByIdAndDelete(id);
    if (!deletedTicket) {
      return NextResponse.json({ message: "تیکت پیدا نشد." }, { status: 404 });
    }

    return NextResponse.json({ message: "تیکت با موفقیت حذف شد." });
  } catch (error) {
    return NextResponse.json(
      { message: "خطا در حذف تیکت", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  const { id } = params;
  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "شناسه نامعتبر است." },
      { status: 400 }
    );
  }
  const errorResponse = await requireRole(request, ["admin"]);
  if (errorResponse instanceof NextResponse) return errorResponse;

  try {
    const { status } = await request.json();

    // اعتبارسنجی وضعیت
    const allowedStatuses = ["pending", "answered", "closed"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: "وضعیت نامعتبر است." },
        { status: 400 }
      );
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return NextResponse.json({ message: "تیکت پیدا نشد." }, { status: 404 });
    }

    ticket.status = status;
    ticket.updatedAt = new Date();
    await ticket.save();

    return NextResponse.json({ message: "وضعیت تیکت به‌روزرسانی شد." });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
