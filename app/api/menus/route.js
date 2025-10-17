import connectToDatabase from "@/app/lib/db";
import Menu from "@/models/Menu";
import mongoose from "mongoose";
import { slugify } from "@/app/utils/slugify";
import { joinUrl, reverseUrlSegmentsIfPersian } from "@/app/utils/urlReverse";

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

export async function GET(request) {
  await connectToDatabase();
  const menus = await Menu.find({}).populate("parent", "title").lean();
  return new Response(JSON.stringify(menus), { status: 200 });
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const { title, url, type, order = 0, parent, isActive = true, icon, urlManuallyEdited } = await req.json();

    let slug = slugify(title);
    let exists = await Menu.findOne({ slug });
    let counter = 1;
    while (exists) {
      slug = `${slug}-${counter++}`;
      exists = await Menu.findOne({ slug });
    }

    let finalUrl = url?.trim() || '';
    let parentId = parent === '' || parent === undefined ? null : parent;

    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return new Response(JSON.stringify({ message: "منوی والد انتخاب‌شده معتبر نیست." }), { status: 400 });
      }
      const parentExists = await Menu.findById(parentId);
      if (!parentExists) {
        return new Response(JSON.stringify({ message: "منوی والد انتخاب‌شده وجود ندارد." }), { status: 404 });
      }
      const hasLoop = await checkForParentLoop(null, parentId);
      if (hasLoop) {
        return new Response(JSON.stringify({ message: "نمی‌توانید این منو را به‌عنوان والد انتخاب کنید، زیرا باعث ایجاد حلقه می‌شود." }), { status: 400 });
      }
    }

    if (finalUrl === '/' && (type === 'internal' || type === 'page')) {
      finalUrl = '/';
      parentId = null;
    } else {
      let childSegment = slug;
      if (finalUrl && (type === 'internal' || type === 'page') && urlManuallyEdited) {
        childSegment = finalUrl.split('/').filter(Boolean).pop() || slug;
      }
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

      if (type !== 'external') {
        finalUrl = reverseUrlSegmentsIfPersian(finalUrl);
      }
    }

    const menu = new Menu({
      title,
      slug,
      url: finalUrl,
      type,
      order,
      parent: parentId,
      isActive,
      icon,
    });

    await menu.save();
    return new Response(JSON.stringify(menu.toObject()), { status: 201 });
  } catch (err) {
    console.error('Error in POST /api/menus:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}