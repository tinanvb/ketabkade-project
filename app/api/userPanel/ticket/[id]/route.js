import connectToDatabase from "@/app/lib/db";
import Ticket from "@/models/Ticket";
import sanitizeHtml from "sanitize-html";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const MAX_TEXT = 2000;

export async function GET(request, { params }) {
  const { id } = await params;
  if (!id) {
    return new Response(JSON.stringify({ message: "شناسه معتبر نیست" }), {
      status: 400,
    });
  }

  await connectToDatabase();
  try {
    const ticket = await Ticket.findOne({ _id: id });

    if (!ticket) {
      return new Response(JSON.stringify({ message: "تیکت پیدا نشد" }), {
        status: 404,
      });
    }
    return new Response(JSON.stringify(ticket), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 500,
    });
  }
}

export async function POST(request, { params }) {
  await connectToDatabase();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const userId = session.user.id;
    const { id } = await params;
    const { text } = await request.json();

    // basic validation

    if (!text || !text.trim()) {
      return new Response(JSON.stringify({ message: "متن پیام الزامی است" }), {
        status: 400,
      });
    }
    if (text.length > MAX_TEXT) {
      return new Response(
        JSON.stringify({
          message: `متن پیام باید حداکثر ${MAX_TEXT} کاراکتر باشد`,
        }),
        { status: 400 }
      );
    }

    // sanitize text to avoid XSS
    const cleanText = sanitizeHtml(text, {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return new Response(JSON.stringify({ message: "تیکت پیدا نشد" }), {
        status: 404,
      });
    }

    // اضافه کردن پیام جدید
    const newMessage = {
      sender: "user", // چون سمت کاربر هست
      text: cleanText,
      date: new Date(),
    };
    ticket.messages.push(newMessage);
    ticket.status = "pending";
    ticket.updatedAt = new Date();
    await ticket.save();

    return new Response(JSON.stringify(newMessage), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 500,
    });
  }
}
