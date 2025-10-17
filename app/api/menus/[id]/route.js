import connectToDatabase from "@/app/lib/db";
import Menu from "@/models/Menu";
import mongoose from "mongoose";
import { slugify } from "@/app/utils/slugify";
import { joinUrl, reverseUrlSegmentsIfPersian } from "@/app/utils/urlReverse";

function isInvalidId(id) {
  return !mongoose.Types.ObjectId.isValid(id);
}

async function checkForParentLoop(menuId, parentId) {
  if (!parentId) return false;
  const visited = new Set();
  let currentId = parentId;

  while (currentId) {
    if (currentId === menuId) return true;
    if (visited.has(currentId)) break;
    visited.add(currentId);
    const menu = await Menu.findById(currentId).select('parent').lean();
    currentId = menu && menu.parent ? String(menu.parent) : null;
  }
  return false;
}

export async function GET(request, { params }) {
  await connectToDatabase();
  try {
    const { id } = params;
    if (isInvalidId(id)) {
      return new Response(JSON.stringify({ message: "شناسه منو معتبر نیست." }), {
        status: 400,
      });
    }

    const menu = await Menu.findById(id).populate("parent", "title");
    if (!menu) {
      return new Response(
        JSON.stringify({ message: "منو مورد نظر پیدا نشد" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(menu), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 500,
    });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    if (isInvalidId(id)) {
      return new Response(JSON.stringify({ message: "شناسه منو معتبر نیست." }), { status: 400 });
    }

    const body = await req.json();
    const updateData = { ...body };

    let slug = slugify(body.title || updateData.title);
    let exists = await Menu.findOne({ slug, _id: { $ne: id } });
    let counter = 1;
    while (exists) {
      slug = `${slug}-${counter++}`;
      exists = await Menu.findOne({ slug, _id: { $ne: id } });
    }
    updateData.slug = slug;

    let finalUrl;
    let parentId = body.parent === '' || body.parent === undefined ? null : body.parent;

    if (parentId) {
      if (isInvalidId(parentId)) {
        return new Response(JSON.stringify({ message: "منوی والد انتخاب‌شده معتبر نیست." }), { status: 400 });
      }
      const parentExists = await Menu.findById(parentId);
      if (!parentExists) {
        return new Response(JSON.stringify({ message: "منوی والد انتخاب‌شده وجود ندارد." }), { status: 404 });
      }
      const hasLoop = await checkForParentLoop(id, parentId);
      if (hasLoop) {
        return new Response(JSON.stringify({ message: "نمی‌توانید این منو را به‌عنوان والد انتخاب کنید، زیرا باعث ایجاد حلقه می‌شود." }), { status: 400 });
      }
    }

    const currentMenu = await Menu.findById(id);
    const parentChanged = String(currentMenu.parent) !== String(parentId);

    if (body.url?.trim() === '/' && (body.type === 'internal' || body.type === 'page')) {
      finalUrl = '/';
      parentId = null;
    } else if (!parentChanged && body.urlManuallyEdited && body.url?.trim()) {
      finalUrl = body.url.trim();
      if (body.type !== 'external') {
        finalUrl = reverseUrlSegmentsIfPersian(finalUrl);
      }
    } else {
      let childSegment = body.urlManuallyEdited && body.url?.trim()
        ? body.url.trim().split('/').filter(Boolean).pop() || slug
        : slug;
      finalUrl = `/${childSegment}`;

      if (parentId) {
        const parentMenu = await Menu.findById(parentId);
        if (parentMenu) {
          const logicalParentUrl = reverseUrlSegmentsIfPersian(parentMenu.url);
          finalUrl = joinUrl(logicalParentUrl, childSegment);
        } else {
          parentId = null;
        }
      }

      if (body.type !== 'external') {
        finalUrl = reverseUrlSegmentsIfPersian(finalUrl);
      }
    }

    updateData.url = finalUrl;
    updateData.parent = parentId;

    const menu = await Menu.findByIdAndUpdate(id, updateData, { new: true });
    return new Response(JSON.stringify(menu.toObject()), { status: 200 });
  } catch (err) {
    console.error('Error in PUT /api/menus/[id]:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await connectToDatabase();
  try {
    const { id } = params;
    if (isInvalidId(id)) {
      return new Response(JSON.stringify({ message: "شناسه منو معتبر نیست." }), {
        status: 400,
      });
    }

    await Menu.updateMany({ parent: id }, { $set: { parent: null } });

    await Menu.findByIdAndDelete(id);
    return new Response(null, { status: 204 });
  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ message: err.message }), {
      status: 500,
    });
  }
}