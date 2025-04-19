import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import NewsletterList from "@/features/newsletter/NewsletterList";
import SubscriptionForm from "@/components/SubscriptionForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Main Content */}
      <main>
        {/* Latest Newsletters */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-[25vw]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-black">최신 뉴스레터</h2>
              <Link href="/archive">
                <Button
                  variant="outline"
                  className="text-amber-500 border-amber-500 hover:bg-amber-50"
                >
                  전체 보기
                </Button>
              </Link>
            </div>
            <NewsletterList />
          </div>
        </section>
        {/* Subscription Form */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-[25vw]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-black mb-4">
                뉴스레터 구독하기
              </h2>
              <p className="text-gray-600">
                지금 구독하고 K-POP의 모든 소식을 받아보세요!
              </p>
            </div>
            <SubscriptionForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
