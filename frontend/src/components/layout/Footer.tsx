"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8 border-t border-gray-200">
      <div className="container mx-auto px-[25vw]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Link href="/">
                <Image
                  src="/images/bannerLogo.png"
                  alt="Duck Herald Logo"
                  width={100}
                  height={32}
                />
              </Link>
            </div>
            <p className="text-gray-600">
              K-Pop 팬들을 위한 프리미엄 뉴스레터 서비스
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-black mb-4">사이트맵</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-amber-500">
                  홈
                </Link>
              </li>
              <li>
                <Link
                  href="/archive"
                  className="text-gray-600 hover:text-amber-500"
                >
                  아카이브
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="text-gray-600 hover:text-amber-500"
                >
                  팀 소개
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-amber-500"
                >
                  소개
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="text-gray-600 hover:text-amber-500"
                >
                  면책 조항
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-black mb-4">연락처</h4>
            <p className="text-gray-600">문의: info@duckherald.com</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>© {new Date().getFullYear()} Duck Herald. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
