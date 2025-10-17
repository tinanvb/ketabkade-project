import connectToDatabase from "@/app/lib/db";
import Setting from "@/models/Setting";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

const MAX_SIZE = 2 * 1024 * 1024;
const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

export async function GET() {
  try {
    await connectToDatabase();
    const setting = await Setting.findOne({});
    if (!setting) {
      return NextResponse.json({ error: "تنظیمات یافت نشد" }, { status: 404 });
    }
    return NextResponse.json(setting, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "خطا در دریافت تنظیمات" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const formData = await req.formData();
    const jsonData = JSON.parse(formData.get("data"));
    const file = formData.get("logo");

    // تبدیل مقادیر استرینگ به بولین برای paymentMethods
    if (jsonData.paymentMethods && typeof jsonData.paymentMethods === "object") {
      for (const key of Object.keys(jsonData.paymentMethods)) {
        const val = jsonData.paymentMethods[key];
        if (val === "true") jsonData.paymentMethods[key] = true;
        else if (val === "false") jsonData.paymentMethods[key] = false;
      }
    }

    const errors = {};

    // اعتبارسنجی فایل لوگو
    if (file instanceof Blob && file.size > 0) {
      if (file.size > MAX_SIZE) errors.logo = "حجم فایل لوگو زیاد است";
      if (!allowedTypes.includes(file.type))
        errors.logo = "فرمت فایل لوگو نامعتبر است";
    }

    // اعتبارسنجی عنوان سایت
    if (!jsonData.siteTitle?.trim())
      errors.siteTitle = "عنوان سایت الزامی است.";

    // اعتبارسنجی contactInfo
    const contact = jsonData.contactInfo || {};
    if (!contact.email?.trim()) {
      errors.email = "ایمیل الزامی است.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact.email)) {
        errors.email = "فرمت ایمیل نامعتبر است.";
      }
    }

    if (!contact.phone?.trim()) {
      errors.phone = "شماره تماس الزامی است.";
    } else {
      const phoneRegex = /^[0-9+\-()\s]{7,}$/;
      if (!phoneRegex.test(contact.phone)) {
        errors.phone = "فرمت شماره تماس نامعتبر است.";
      }
    }

    // اعتبارسنجی شبکه‌های اجتماعی
    if (jsonData.social && typeof jsonData.social === "object") {
      for (const [key, val] of Object.entries(jsonData.social)) {
        if (typeof val !== "string") {
          errors[`social_${key}`] = `مقدار ${key} باید رشته باشد.`;
        }
      }
    }

    // اعتبارسنجی paymentMethods
    if (jsonData.paymentMethods && typeof jsonData.paymentMethods === "object") {
      for (const [key, val] of Object.entries(jsonData.paymentMethods)) {
        if (typeof val !== "boolean") {
          errors[`paymentMethods_${key}`] = `مقدار ${key} باید بولین باشد.`;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "مقادیر نامعتبر", details: errors },
        { status: 422 }
      );
    }

    await connectToDatabase();
    let setting = await Setting.findOne({});

    // ذخیره فایل لوگو
    if (file instanceof Blob && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = Date.now() + "-" + file.name.replaceAll(" ", "-");
      const filepath = join("public", "uploads", filename);

      if (setting?.logo) {
        try {
          await unlink(join("public", setting.logo));
        } catch {}
      }

      await writeFile(filepath, buffer);
      jsonData.logo = "/uploads/" + filename;
    }

    // ذخیره تنظیمات
    if (setting) {
      await Setting.updateOne({ _id: setting._id }, { $set: jsonData });
    } else {
      setting = new Setting(jsonData);
      await setting.save();
    }

    return NextResponse.json({ message: "تنظیمات ذخیره شد" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "خطا در ذخیره تنظیمات", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await connectToDatabase();
    const setting = await Setting.findOne({});
    if (!setting) {
      return NextResponse.json(
        { error: "چیزی برای حذف وجود ندارد" },
        { status: 404 }
      );
    }

    if (setting.logo) {
      try {
        await unlink(join("public", setting.logo));
      } catch {}
    }

    await Setting.deleteOne({ _id: setting._id });
    return NextResponse.json({ message: "تنظیمات حذف شد" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "خطا در حذف تنظیمات" }, { status: 500 });
  }
}
