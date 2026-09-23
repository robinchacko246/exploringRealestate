"use client";

import PublicHeader from "@/components/public/public-header";
import PublicFooter from "@/components/public/public-footer";

export default function SellLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#212121]">
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}
