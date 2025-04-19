import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

// 동기식 뉴스레터 발송 (일반 발송)
export const useNewsletterSendMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newsletterId: number) =>
      apiClient.sendNewsletter(newsletterId),
    onSuccess: () => {
      // 발송 성공 시 발송 로그 리스트 갱신
      queryClient.invalidateQueries({ queryKey: ["deliveryLogs"] });
    },
  });
};

// 비동기식 뉴스레터 발송 (대량 발송)
export const useNewsletterSendAsyncMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newsletterId: number) =>
      apiClient.sendNewsletterAsync(newsletterId),
    onSuccess: () => {
      // 백그라운드에서 처리되므로 최신 로그를 보려면 일정 시간 후 갱신해야 함
      queryClient.invalidateQueries({ queryKey: ["deliveryLogs"] });

      // 일정 시간 후 자동으로 한 번 더 갱신 (배송 상태 업데이트 확인용)
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["deliveryLogs"] });
      }, 10000); // 10초 후 갱신
    },
  });
};
