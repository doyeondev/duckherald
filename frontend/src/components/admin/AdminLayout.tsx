"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname?.startsWith(path)
      ? "bg-amber-100 text-amber-800"
      : "text-gray-700 hover:bg-gray-100";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Link href="/admin">
                <Image
                  src="/images/bannerLogo.png"
                  alt="Duck Herald Logo"
                  width={240}
                  height={32}
                />
              </Link>
            </div>
            <div className="ml-10 flex items-center space-x-4">
              <Link
                href="/admin/newsletters"
                className={`px-3 py-2 rounded-md text-base font-semibold ${isActive("/admin/newsletters")}`}
              >
                뉴스레터
              </Link>
              <Link
                href="/admin/subscribers"
                className={`px-3 py-2 rounded-md text-base font-semibold ${isActive("/admin/subscribers")}`}
              >
                구독자
              </Link>
              <Link
                href="/admin/delivery"
                className={`px-3 py-2 rounded-md text-base font-semibold ${isActive("/admin/delivery")}`}
              >
                발송
              </Link>
              <div className="border-l h-6 mx-2 border-gray-300"></div>
              <Link
                href="/"
                className="px-3 py-2 rounded-md text-base font-semibold text-amber-600 hover:bg-amber-50 hover:text-amber-700"
              >
                사이트
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-6 px-[5vw] max-w-7xl mx-auto">{children}</main>
    </div>
  );
};

export default AdminLayout;
