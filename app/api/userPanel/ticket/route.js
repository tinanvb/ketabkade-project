import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectToDatabase from "@/app/lib/db";
import Ticket from "@/models/Ticket";
import sanitizeHtml from "sanitize-html";

const MAX_TITLE = 100;
const MAX_TEXT = 2000;

export async function GET(request, params) {
  await connectToDatabase();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const userId = session.user.id;
    const tickets = await Ticket.find({ user: userId })
      .select("title status updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    if (!tickets || tickets.length === 0) {
      return new Response(JSON.stringify({ message: "تیکتی یافت نشد" }), {
        status: 401,
      });
    }
    return new Response(JSON.stringify(tickets), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 500,
    });
  }
}

export async function POST(request) {
  await connectToDatabase();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const userId = session.user.id;
    const data = await request.json().catch(() => ({}));
    const { title, messages } = data;

    // basic validation
    if (!title || !title.trim()) {
      return new Response(JSON.stringify({ message: "عنوان الزامی است" }), {
        status: 400,
      });
    }
    if (title.length > MAX_TITLE) {
      return new Response(
        JSON.stringify({
          message: `عنوان باید حداکثر ${MAX_TITLE} کاراکتر باشد`,
        }),
        { status: 400 }
      );
    }
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ message: "پیام معتبر نیست" }), {
        status: 400,
      });
    }

    // validate first message structure and length
    const first = messages[0];
    if (!first.text || !first.text.trim()) {
      return new Response(JSON.stringify({ message: "متن پیام الزامی است" }), {
        status: 400,
      });
    }
    if (first.text.length > MAX_TEXT) {
      return new Response(
        JSON.stringify({
          message: `متن پیام باید حداکثر ${MAX_TEXT} کاراکتر باشد`,
        }),
        { status: 400 }
      );
    }

    // sanitize text to avoid XSS
    const cleanTitle = sanitizeHtml(title, {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();
    const cleanMessages = messages.map((m) => ({
      sender: m.sender === "admin" ? "admin" : "user",
      text: sanitizeHtml(String(m.text), {
        allowedTags: [],
        allowedAttributes: {},
      }).trim(),
    }));

    const newTicket = new Ticket({
      title: cleanTitle,
      user: userId,
      messages: cleanMessages,
      status: "pending",
    });

    await newTicket.save();

    // return the saved ticket (lean it if you want)
    return new Response(JSON.stringify(newTicket), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 500,
    });
  }
}
