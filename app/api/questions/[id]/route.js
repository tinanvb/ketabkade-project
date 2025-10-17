import { NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/db";
import Question from "@/models/Question";

await connectToDatabase();

const isValidId = (id) => typeof id === "string" && id.length === 24;

export async function GET(request, { params }) {
  const { id } = await params;

  if (!isValidId(id)) {
    return NextResponse.json({ message: "شناسه نامعتبر است" }, { status: 400 });
  }

  try {
    const question = await Question.findById(id);
    if (!question) {
      return NextResponse.json({ message: "سوال یافت نشد" }, { status: 404 });
    }
    return NextResponse.json(question);
  } catch (error) {
    return NextResponse.json(
      { message: "خطا در دریافت سوال", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const { id } = await params;

  if (!isValidId(id)) {
    return NextResponse.json({ message: "شناسه نامعتبر است" }, { status: 400 });
  }

  try {
    const { question, answer, order, isActive } = await request.json();
    const updates = {};

    if (question !== undefined) {
      if (typeof question !== "string" || question.trim() === "") {
        return NextResponse.json(
          { message: "عنوان نامعتبر است" },
          { status: 400 }
        );
      }
      updates.question = question.trim();
    }

    if (answer !== undefined) {
      if (typeof answer !== "string" || answer.trim() === "") {
        return NextResponse.json(
          { message: "پاسخ نامعتبر است" },
          { status: 400 }
        );
      }
      updates.answer = answer.trim();
    }

    if (order !== undefined) {
      const num = Number(order);
      if (isNaN(num) || num < 0) {
        return NextResponse.json(
          { message: "ترتیب نامعتبر است" },
          { status: 400 }
        );
      }
      updates.order = num;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return NextResponse.json(
          { message: "وضعیت باید بولی باشد" },
          { status: 400 }
        );
      }
      updates.isActive = isActive;
    }

    const updatedQuestion = await Question.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedQuestion) {
      return NextResponse.json({ message: "سوال یافت نشد" }, { status: 404 });
    }

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    return NextResponse.json(
      { message: "خطا در بروزرسانی سوال", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  if (!isValidId(id)) {
    return NextResponse.json({ message: "شناسه نامعتبر است" }, { status: 400 });
  }

  try {
    const deleted = await Question.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "سوال یافت نشد" }, { status: 404 });
    }
    return NextResponse.json({ message: "سوال با موفقیت حذف شد" });
  } catch (error) {
    return NextResponse.json(
      { message: "خطا در حذف سوال", error: error.message },
      { status: 500 }
    );
  }
}
