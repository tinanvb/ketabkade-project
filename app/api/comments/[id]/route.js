import connectToDatabase from "@/app/lib/db";
import Comment from "@/models/Comment";

export async function GET(req, { params }) {
  await connectToDatabase();
  const { id } = await params;

  try {
    const comment = await Comment.findById(id);
    if (!comment) return new Response("نظر یافت نشد", { status: 404 });
    return Response.json(comment);
  } catch (error) {
    console.error("خطا در دریافت نظر:", error);
    return new Response("خطا در دریافت نظر", { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  await connectToDatabase();
  const { id } = await params;

  try {
    const { action, replyText, ...rest } = await req.json();

    let update = {};
    if (action === "approve") update.approved = true;
    else if (action === "reject") update.approved = false;
    else if (action === "reply" && replyText)
      update.reply = { text: replyText.trim(), date: new Date() };
    else update = { ...rest };

    const updatedComment = await Comment.findByIdAndUpdate(id, update, {
      new: true,
    });
    if (!updatedComment) return new Response("نظر یافت نشد", { status: 404 });
    return Response.json(updatedComment);
  } catch (error) {
    console.error("خطا در به‌روزرسانی نظر:", error);
    return new Response("خطا در به‌روزرسانی نظر", { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await connectToDatabase();
  const { id } = await params;
  try {
    const deletedComment = await Comment.findByIdAndDelete(id);
    if (!deletedComment) return new Response("نظر یافت نشد", { status: 404 });
    return new Response("نظر با موفقیت حذف شد", { status: 200 });
  } catch (error) {
    console.error("خطا در حذف نظر:", error);
    return new Response("خطا در حذف نظر", { status: 500 });
  }
}
