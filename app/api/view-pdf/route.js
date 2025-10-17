import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get("file");

  // جلوگیری از هک با مسیر غیرمجاز
  if (!fileName || fileName.includes("..")) {
    return NextResponse.json({ error: "نام فایل معتبر نیست" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public", "uploads", fileName);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "فایل پیدا نشد" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline", // نمایش در مرورگر
    },
  });
}
