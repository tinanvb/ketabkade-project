// export function reverseUrlSegmentsIfPersian(url) {
//   const isPersian = /[\u0600-\u06FF]/.test(url);
//   if (isPersian && url !== '/') {
//     const segments = url.split('/').filter(Boolean);
//     return '/' + segments.reverse().join('/');
//   }
//   return url;
// }


// export function reverseUrlSegmentsIfPersian(url) {
//   if (url === '/') return url;
//   const segments = url.split('/').filter(Boolean);
//   const hasPersian = segments.some(segment => /[\u0600-\u06FF]/.test(segment));
//   if (hasPersian) {
//     // فقط بخش‌های فارسی را معکوس کن
//     const reversedSegments = segments.reverse().map(segment => {
//       if (/[\u0600-\u06FF]/.test(segment)) {
//         return segment; // بخش‌های فارسی را نگه دار (یا اگر نیاز است، منطق خاصی اضافه کن)
//       }
//       return segment;
//     });
//     return '/' + reversedSegments.join('/');
//   }
//   return url;
// }


export function joinUrl(parentUrl, childUrl) {
  const cleanParent = parentUrl.replace(/\/+$/, '');
  const cleanChild = childUrl.replace(/^\/+/, '');
  return cleanParent === '' ? `/${cleanChild}` : `${cleanParent}/${cleanChild}`;
}



export function reverseUrlSegmentsIfPersian(url) {
  if (url === '/') return url;

  const segments = url.split('/').filter(Boolean);

  let blocks = [];
  let currentBlock = [];
  let currentIsPersian = null;

  for (let seg of segments) {
    const isPersian = /[\u0600-\u06FF]/.test(seg);
    if (currentIsPersian === null) {
      // اولین segment
      currentIsPersian = isPersian;
      currentBlock.push(seg);
    } else if (isPersian === currentIsPersian) {
      // ادامه همون بلاک
      currentBlock.push(seg);
    } else {
      // بلاک قبلی تموم شد
      if (currentIsPersian) {
        // فارسی → reverse کن
        blocks.push(currentBlock.reverse());
      } else {
        // انگلیسی → دست نزن
        blocks.push(currentBlock);
      }
      // بلاک جدید شروع میشه
      currentBlock = [seg];
      currentIsPersian = isPersian;
    }
  }

  // آخرین بلاک رو اضافه کن
  if (currentBlock.length > 0) {
    if (currentIsPersian) {
      blocks.push(currentBlock.reverse());
    } else {
      blocks.push(currentBlock);
    }
  }

  // همه بلاک‌ها رو یکی کن
  const finalSegments = blocks.flat();

  return '/' + finalSegments.join('/');
}
