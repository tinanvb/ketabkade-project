import connectToDatabase from "@/app/lib/db";
import Comment from "@/models/Comment";
import User from "@/models/User";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectToDatabase();

    const comments = await Comment.find({})
      .populate("user", "firstname lastname")
      .populate("productName", "name")
      .sort({ createdAt: -1 });

    return Response.json(comments);
  } catch (err) {
    console.error("خطا در دریافت نظرات:", err);
    return new Response("خطا در دریافت نظرات", { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { user, commentText, rating, product } = body;

    if (!user || typeof user !== "string" || user.trim() === "")
      return new Response("شناسه کاربر نامعتبر است", { status: 400 });

    if (!commentText || commentText.trim().length < 3)
      return new Response("متن نظر باید حداقل ۳ کاراکتر باشد", { status: 400 });

    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5)
      return new Response("امتیاز باید بین ۱ تا ۵ باشد", { status: 400 });

    if (!product || typeof product !== "string" || product.trim() === "")
      return new Response("شناسه محصول الزامی است", { status: 400 });

    const existingUser = await User.findById(user);
    if (!existingUser)
      return new Response("کاربر موردنظر یافت نشد", { status: 404 });

    const existingProduct = await Product.findById(product);
    if (!existingProduct)
      return new Response("محصول موردنظر یافت نشد", { status: 404 });

    const newComment = await Comment.create({
      user,
      commentText,
      rating: parsedRating,
      product,
    });

    const savedComment = await Comment.findById(newComment._id)
      .populate("user", "firstname lastname")
      .populate("product", "name");

    return Response.json(savedComment, { status: 201 });
  } catch (err) {
    console.error("خطا در ایجاد نظر:", err);
    return new Response("خطا در ایجاد نظر", { status: 500 });
  }
}
