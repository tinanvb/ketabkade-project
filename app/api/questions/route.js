import { NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/db";
import Question from "@/models/Question";

await connectToDatabase();

export async function GET() {
  try {
    const questions = await Question.find().sort({ order: 1 });
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json(
      { message: "خطا در دریافت اطلاعات", error: error.message },
      { status: 500 }
    );x
  }
}

export async function POST(request) {
  try {
    const { question } = await request.json(); // فقط question رو می‌گیریم

    if (!question?.trim()) {
      return NextResponse.json(
        { message: "عنوان سوال الزامی است" },
        { status: 400 }
      );
    }

    // تعیین order به صورت خودکار بر اساس آخرین مقدار موجود
    const lastQuestion = await Question.findOne().sort({ order: -1 });
    const newOrder = lastQuestion ? lastQuestion.order + 1 : 1;

    const newQuestion = await Question.create({
      question: question.trim(),
      answer: "", // چون هنوز پاسخی نیست
      order: newOrder,
      isActive: false, // سوال جدید هنوز فعال نیست تا ادمین تایید کند
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "خطا در ایجاد سوال", error: error.message },
      { status: 500 }
    );
  }
}
