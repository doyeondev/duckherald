"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="border-b border-gray-200 py-4">
      <div className="container mx-auto px-[25vw] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image
              src="/images/bannerLogo.png"
              alt="Duck Herald Logo"
              width={120}
              height={48}
              priority
            />
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className="text-black hover:text-amber-500 font-medium"
          >
            Home
          </Link>
          <Link
            href="/archive"
            className="text-black hover:text-amber-500 font-medium"
          >
            Archive
          </Link>
          <Link
            href="/team"
            className="text-black hover:text-amber-500 font-medium"
          >
            Team
          </Link>
          <Link
            href="/about"
            className="text-black hover:text-amber-500 font-medium"
          >
            About
          </Link>
          <Link
            href="/disclaimer"
            className="text-black hover:text-amber-500 font-medium"
          >
            Disclaimer
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/search">
            <Button
              variant="ghost"
              size="icon"
              className="text-black hover:text-amber-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-search"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </Button>
          </Link>
          <Link href="/admin">
            <Button
              variant="ghost"
              size="icon"
              className="text-black hover:text-amber-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-user"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Button>
          </Link>
          <Link href="/subscribe">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              Subscribe
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
