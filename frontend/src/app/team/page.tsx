"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Team Content */}
      <main className="py-16">
        <div className="container mx-auto px-[25vw]">
          <h1 className="text-4xl font-bold mb-8 text-center">Meet the Team</h1>

          <p className="text-center text-lg mb-12">
            Here, you get to know the faces behind the quartet! Our team is a
            diverse group of passionate individuals, united by our love for
            Korean culture and our dedication to bringing you the best of Kpop
            and beyond. We strive for the best to make Duck Herald your ultimate
            destination for cultural exploration.
          </p>

          {/* Team Member 1 */}
          <div className="mb-16">
            <div className="flex flex-col items-center mb-6">
              <img
                src="https://img.duckherald.com/team/jhs.webp"
                alt="Jaehoon Sung"
                className="w-48 h-48 object-cover rounded-full mb-4"
              />
              <h2 className="text-2xl font-bold">
                Jaehoon Sung | &quot;Jaethoven&quot; | Creatives & Writing
              </h2>
            </div>
            <p className="text-lg">
              Jaehoon, affectionately known as &quot;Jaethoven&quot;, is the creative
              genius behind Duck Herald. While Jaehoon&apos;s days are spent working
              as a software engineer in Canada, his true passion lies in the
              mesmerizing melodies of Korean pop music from the 1970s and 80s.
              With a deep love for this era, Jaehoon brings a unique perspective
              to Duck Herald, blending his technical expertise with a profound
              understanding of music history. His knack for breaking down the
              music and entertainment industry in his own distinctive way adds a
              refreshing depth to our content.
            </p>
          </div>

          {/* Team Member 2 */}
          <div className="mb-16">
            <div className="flex flex-col items-center mb-6">
              <img
                src="https://img.duckherald.com/team/syl.webp"
                alt="So Yoon Lee"
                className="w-48 h-48 object-cover rounded-full mb-4"
              />
              <h2 className="text-2xl font-bold">
                So Yoon Lee | &quot;Doctor of Kpop&quot; | Creatives & Writing
              </h2>
            </div>
            <p className="text-lg">
              So Yoon is currently working towards her doctorate degree in
              sociology at the University of Chicago. Her dissertation research
              aims to examine the roles of various individuals and organizations
              in K-pop production, thereby providing an empirically-grounded and
              nuanced understanding of the industry. She also serves as a Ph.D
              Research Associate for the project &quot;Mapping Global Impacts of
              Hallyu&quot;, an interdisciplinary research effort that brings together
              leading scholars in Hallyu studies around the world. So Yoon is
              indeed well on her way to earning the title of Doctor of Kpop, as
              she continues to contribute to the field with her groundbreaking
              work.
            </p>
          </div>

          {/* Team Member 3 */}
          <div className="mb-16">
            <div className="flex flex-col items-center mb-6">
              <img
                src="https://img.duckherald.com/team/dyk.webp"
                alt="Sean Kim"
                className="w-48 h-48 object-cover rounded-full mb-4"
              />
              <h2 className="text-2xl font-bold">
                Sean Kim | &quot;Cultural Nomad&quot; | Service Operation
              </h2>
            </div>
            <p className="text-lg">
              Sean leads Service Operations. By day, he serves as a sales
              representative at a law firm in Seoul. He is an avid traveler who
              frequently explores Korea and Japan. Somewhat fluent in Chinese
              and Japanese, Sean&apos;s linguistic prowess adds depth to his cultural
              perspectives, enriching his interactions and insights. With his
              meticulous attention to detail and service-oriented approach, Sean
              plays a pivotal role in ensuring that Duck Herald delivers
              superlative experiences to our readers.
            </p>
          </div>

          {/* Team Member 4 */}
          <div>
            <div className="flex flex-col items-center mb-6">
              <img
                src="https://img.duckherald.com/team/wss.webp"
                alt="Woonseong Seol"
                className="w-48 h-48 object-cover rounded-full mb-4"
              />
              <h2 className="text-2xl font-bold">
                Woonseong Seo | &quot;Neo&quot; | Marketing & Sales
              </h2>
            </div>
            <p className="text-lg">
              Woonseong oversees Marketing & Sales. Neo infuses our publication
              with vibrant, novel ideas that elevate the visual and narrative
              dimensions of our newsletters. With a heartwarming love for
              gifting others, he often call him Self-To- Other, and
              Bia-Giver-Choa. Currently serving as a production designer at a
              tier-one Korean IT startup, his skill sets to design and marketing
              coupled with his entrepreneurial experiences make him a driving
              force behind Duck Herald.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
