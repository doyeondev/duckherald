"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* About Content */}
      <main className="py-16">
        <div className="container mx-auto px-[25vw]">
          <h1 className="text-4xl font-bold mb-8 text-center">
            We highlight your experience with Korea and more ...!
          </h1>

          <div className="space-y-8 prose max-w-none">
            <p>
              Welcome to Duck Herald, your gateway to Kpop and Korean culture
              that goes beyond the surface. We&apos;re more than just a newsletter
              service - we&apos;re your guides on a journey to uncover the essence of
              Kpop and its rich cultural tapestry.
            </p>

            <p>
              Here at Duck Herald, we firmly believe that your experience in the
              Kpop world transcends mere music. It&apos;s about delving into the
              intricacies of Korean culture, language, and tradition that make
              this genre so unique and captivating. With this belief at our
              core, a passionate trio of Korean natives has come together with a
              mission: to provide you with a fresh perspective on the Kpop
              universe and beyond.
            </p>

            <p>
              Our goal is simple yet profound: to enrich the experience of
              global Kpop fans by offering new cultural insights that resonate
              deeply. Through our meticulously curated content, we aim to
              broaden your understanding of not only Kpop but also other facets
              of Korean media content, including dramas, movies, and more.
            </p>

            <p>
              What sets Duck Herald apart is our commitment to diversity and
              depth. We explore a wide array of topics, from language tips to
              pop culture history, ensuring that there&apos;s something for everyone
              in our vibrant community. With each newsletter, we aim to spark
              curiosity, ignite passion, and foster a deeper connection to the
              world of Korean culture.
            </p>

            <p>
              Join us on this exhilarating journey as we navigate the colorful
              landscape of Kpop and beyond. Let Duck Herald be your trusted
              companion as you uncover the hidden gems and cultural treasures
              that await. Together, let&apos;s embark on a voyage of discovery and
              enrichment.
            </p>

            <p className="font-bold">Welcome aboard 🦆</p>
          </div>

          <div className="mt-12 text-center">
            <img
              src="/images/duck-about.png"
              alt="Duck Herald Banner"
              className="max-w-full mx-auto rounded-lg shadow-lg"
            />
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Subscribe to get full access to the newsletter and website!
            </h2>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
