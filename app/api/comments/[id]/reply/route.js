import connectToDatabase from "@/app/lib/db";
import Comment from "@/models/Comment";

export async function POST(req, { params }) {
  try {
    await connectToDatabase();

    const { id } = params;
    const { reply } = await req.json();

    if (!reply || typeof reply !== "string" || reply.trim().length < 3) {
      return new Response("پاسخ باید حداقل ۳ کاراکتر باشد.", { status: 400 });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return new Response("نظر مورد نظر یافت نشد.", { status: 404 });
    }

    comment.reply = reply;
    await comment.save();

    return Response.json({ message: "پاسخ ثبت شد", comment });
  } catch (err) {
    console.error("خطا در ثبت پاسخ:", err);
    return new Response("خطا در ثبت پاسخ", { status: 500 });
  }
}
