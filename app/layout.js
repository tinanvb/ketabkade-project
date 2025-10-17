// Server Component

import RootLayoutClient from "./RootLayoutClient";

export const metadata = {
  title: "کتابکده",
  description: "کتابکده، فروشگاه آنلاین کتاب",
};

export default function Layout({ children }) {
  return <RootLayoutClient>{children}</RootLayoutClient>;
}
