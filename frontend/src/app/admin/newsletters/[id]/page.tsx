import { useState } from "react";
import {
  useNewsletterSendMutation,
  useNewsletterSendAsyncMutation,
} from "@/features/newsletter/useNewsletterSendMutation";
import {
  Button,
  Alert,
  Select,
  SelectItem,
  FormControl,
  FormLabel,
} from "@/components/ui";

const NewsletterDetailPage = ({ params }: { params: { id: string } }) => {
  const newsletterId = parseInt(params.id);
  const [sendMode, setSendMode] = useState<"sync" | "async">("sync");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 동기 발송 뮤테이션
  const { mutate: sendNewsletter, isPending: isSending } =
    useNewsletterSendMutation();

  // 비동기 발송 뮤테이션
  const { mutate: sendNewsletterAsync, isPending: isSendingAsync } =
    useNewsletterSendAsyncMutation();

  // 뉴스레터 발송 처리
  const handleSendNewsletter = () => {
    setIsSuccess(false);
    setError(null);

    try {
      if (sendMode === "async") {
        // 대량 발송 (비동기)
        sendNewsletterAsync(newsletterId, {
          onSuccess: () => {
            setIsSuccess(true);
          },
          onError: (err: any) => {
            setError(err.message || "발송 중 오류가 발생했습니다.");
          },
        });
      } else {
        // 일반 발송 (동기)
        sendNewsletter(newsletterId, {
          onSuccess: () => {
            setIsSuccess(true);
          },
          onError: (err: any) => {
            setError(err.message || "발송 중 오류가 발생했습니다.");
          },
        });
      }
    } catch (e: any) {
      setError(e.message || "발송 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">뉴스레터 발송</h1>

      {isSuccess && (
        <Alert variant="success" className="mb-4">
          {sendMode === "async"
            ? "뉴스레터 발송이 백그라운드에서 진행 중입니다."
            : "뉴스레터가 성공적으로 발송되었습니다."}
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}

      <FormControl className="mb-4">
        <FormLabel>발송 방식</FormLabel>
        <Select
          value={sendMode}
          onValueChange={(value) => setSendMode(value as "sync" | "async")}
        >
          <SelectItem value="sync">일반 발송 (소규모)</SelectItem>
          <SelectItem value="async">대량 발송 (백그라운드)</SelectItem>
        </Select>
        <p className="text-sm text-gray-500 mt-1">
          {sendMode === "async"
            ? "대량 발송은 백그라운드에서 처리되며 즉시 페이지 제어권을 반환합니다."
            : "일반 발송은 모든 이메일이 발송될 때까지 기다립니다."}
        </p>
      </FormControl>

      <Button
        onClick={handleSendNewsletter}
        disabled={isSending || isSendingAsync}
      >
        {isSending || isSendingAsync ? "발송 중..." : "뉴스레터 발송하기"}
      </Button>
    </div>
  );
};

export default NewsletterDetailPage;
