"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Disclaimer Content */}
      <main className="py-16">
        <div className="container mx-auto px-[25vw]">
          <h1 className="text-4xl font-bold mb-8 text-center">Disclaimer</h1>

          <div className="space-y-8 prose max-w-none">
            <p>
              It&apos;s crucial to emphasize that our service operates with full
              respect for copyright laws. We acknowledge and mark all copyright
              sources appropriately, ensuring due credit is given to creators
              and copyright holders. Our intention is to provide informative and
              entertaining content while upholding the principles of
              intellectual property rights.
            </p>

            <p>
              As of now, our newsletter service is offered free of charge to our
              valued subscribers. However, please note that while we strive to
              deliver accurate and engaging content, the information provided is
              for informational purposes only. We cannot guarantee the accuracy,
              completeness, or reliability of the content shared.
            </p>

            <p>
              Furthermore, our newsletters may contain links to third-party
              websites or resources for additional information or entertainment
              purposes. We do not endorse or assume any responsibility for the
              content, products, or services offered by these external sources.
            </p>

            <p>
              By subscribing to our newsletter service, you agree to use the
              provided information responsibly and at your own discretion. We
              encourage you to verify any information obtained from our
              newsletters and seek professional advice when necessary.
            </p>

            <p>
              Should you have any concerns regarding copyright issues, content
              accuracy, or any other inquiries, please don&apos;t hesitate to contact
              us. Your feedback is valuable as we continually strive to improve
              our service and deliver content that enriches your experience with
              Kpop and beyond.
            </p>
          </div>

          <div className="mt-12 text-center">
            <img
              src="/images/disclaimer-image.jpg"
              alt="Office workspace with plants"
              className="max-w-full mx-auto rounded-lg shadow-lg"
            />
          </div>

          <div className="mt-12 space-y-8 prose max-w-none">
            <p className="text-lg">
              저희 서비스는 저작권법을 전적으로 존중하며 운영되고 있습니다. 모든
              저작권 출처는 적 절히 언급하고 표시하며, 창작자 및 저작권
              소유자에게 공로를 인정합니다. 저희의 목표는 지적 재산권을 존중하며
              유익하고 즐거움을 전달하는 콘텐츠를 제공하는 것입니다.
            </p>

            <p className="text-lg">
              현재 저희 뉴스레터 서비스는 모든 구독자분들께 무료로 제공되고
              있습니다. 저희는 정확하고 흥미로운 콘텐츠 제공을 위해 노력하고
              있으나, 제공되는 정보는 오직 정보 제공 목적으로만 활 용되어야
              합니다. 콘텐츠의 정확성, 완전성 또는 신뢰성에 대해 보증할 수
              없습니다.
            </p>

            <p className="text-lg">
              또한 저희 뉴스레터에는 추가 정보나 엔터테인먼트 목적의 제3자
              링크나 자원으로의 링크 를 수 있습니다. 이러한 외부 출처의 콘텐츠,
              제품 또는 서비스에 대해 저희하가 책임 을 지지 않습니다.
            </p>

            <p className="text-lg">
              저희 뉴스레터 서비스 구독으로써, 귀하지분들께 제공된 정보를 책임감
              있게, 그리고 자신의 판 단에 따라 사용하는 데 동의하시는 것으로
              간주됩니다. 저희 뉴스레터에서 얻은 정보를 확인하고, 필요한 경우
              전문가의 조언을 구하는 것이 좋습니다.
            </p>

            <p className="text-lg">
              저작권 문제, 콘텐츠의 정확성 또는 기타 문의사항이 있으신 주저하지
              말고 저희에게 연락해 주 십시오. 저희는 서비스를 개선하고,
              케이팝(K-Pop)을 포함한 다양한 정보를 통 해 여러분의 경험을
              풍요롭게 하는 콘텐츠를 제공하기 위해 노력하고 있습니다.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
