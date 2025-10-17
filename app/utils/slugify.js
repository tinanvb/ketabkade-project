export function slugify(str) {
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")           // فاصله → -
    .replace(/[^\w\-آ-ی]+/g, "")    // فقط حروف فارسی، لاتین و - نگه داشته میشه
    .replace(/\-\-+/g, "-")         // چندتا - پشت سر هم → یکی
    .replace(/^-+/, "")             // حذف - اول
    .replace(/-+$/, "");            // حذف - آخر
}


export function unslugify(str) {
  return str.replace(/-/g, " ").trim();
}