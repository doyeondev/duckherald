import { AppProps } from "next/app";
import { ErrorBoundary } from "@sentry/nextjs";
import "../styles/globals.css";
import { setSentryUser } from "@/lib/sentry";

// 글로벌 에러 처리 컴포넌트
const ErrorFallback = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="mb-4 text-2xl font-bold text-red-600">
        앗! 오류가 발생했습니다.
      </h2>
      <p className="mb-4">
        예상치 못한 문제가 발생했습니다. 관리자에게 문의하시거나 다시 시도해
        주세요.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
      >
        새로고침
      </button>
    </div>
  );
};

function MyApp({ Component, pageProps, router }: AppProps) {
  // 로그인 사용자 정보가 있는 경우 Sentry 사용자 설정
  // 예: 로그인 후 useEffect 내에서 실행
  // useEffect(() => {
  //   if (user) {
  //     setSentryUser({
  //       id: user.id,
  //       email: user.email,
  //       username: user.name
  //     });
  //   }
  // }, [user]);

  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

export default MyApp;
