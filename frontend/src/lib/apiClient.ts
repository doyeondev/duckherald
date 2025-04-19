// export const apiClient = {
// 	async getNewsletterList() {
// 		// const res = await fetch('http://localhost:8055/items/newsletters');
// 		const res = await fetch('http://localhost:8055/items/newsletters?sort=-created_at', {
// 			headers: {
// 				Authorization: `Bearer ${process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN}`, // public이면 생략 가능
// 			},
// 			cache: 'no-store', // 최신 데이터 항상 가져오게 설정 (선택)
// 		});
// 		const json = await res.json();
// 		console.log('!!!!!!', process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN);
// 		console.log('Directus 응답:', json); // ← 여기에 찍어보자
// 		return json.data;
// 	},
// };

// frontend/src/lib/apiClient.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 토큰 관련 상수
const TOKEN_KEY = 'authToken';

// Axios 인스턴스 생성
export const apiAxios = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000, // 10초
});

// 요청 인터셉터 (요청 보내기 전에 호출)
apiAxios.interceptors.request.use(
	config => {
		// 인증 토큰 설정
		const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
			console.log(`API 요청 [${config.method?.toUpperCase()} ${config.url}] - 인증 토큰 추가: ${token.substring(0, 20)}...`);
		} else {
			console.log(`API 요청 [${config.method?.toUpperCase()} ${config.url}] - 인증 토큰 없음`);
		}

		// CORS 관련 헤더 추가
		config.headers['Access-Control-Allow-Origin'] = '*';
		return config;
	},
	error => {
		console.error('API 요청 설정 실패:', error);
		return Promise.reject(error);
	}
);

// 응답 인터셉터 (응답 받은 후 호출)
apiAxios.interceptors.response.use(
	response => {
		console.log(`API 응답 성공 [${response.config.method?.toUpperCase()} ${response.config.url}]`);
		return response;
	},
	(error: AxiosError) => {
		// 에러 처리
		if (error.response) {
			// 서버가 응답을 반환한 경우
			console.error(`API 오류 [${error.config?.method?.toUpperCase()} ${error.config?.url}] - 상태 코드: ${error.response.status}`);

			if (error.response.status === 401) {
				// 인증 오류 처리 (로그아웃, 토큰 갱신 등)
				console.error('인증 오류:', error.response.data);
				// 필요시 로컬 스토리지 토큰 삭제 처리
				if (typeof window !== 'undefined') {
					console.log('401 오류로 인해 토큰 삭제');
					localStorage.removeItem(TOKEN_KEY);
				}
			} else if (error.response.status === 403) {
				// 권한 오류 처리
				console.error('권한 오류:', error.response.data);
			} else if (error.response.status === 404) {
				// 리소스를 찾을 수 없음
				console.error('리소스 없음:', error.response.data);
			} else {
				// 기타 서버 오류
				console.error('서버 오류:', error.response.data);
			}
		} else if (error.request) {
			// 요청은 보냈으나 서버가 응답하지 않은 경우
			console.error('서버 응답 없음:', error.message);
		} else {
			// 요청 설정 중 오류 발생
			console.error('요청 설정 오류:', error.message);
		}
		return Promise.reject(error);
	}
);

// orval에서 사용할 mutator 함수 (API 요청 함수)
export const customInstance = async <T>(config: AxiosRequestConfig): Promise<T> => {
	const { data } = await apiAxios(config);
	return data;
};

// 테스트를 위한 apiClient 객체 (테스트 코드 호환성 유지)
export const apiClient = {
	// 관리자 인증 관련 API
	async loginAdmin(email: string, password: string) {
		console.log(`로그인 시도: ${email}`);
		const response = await apiAxios.post('/api/auth/login', { email, password });
		console.log('로그인 응답:', response.data);
		return response.data;
	},

	async createAdmin(email: string, password: string) {
		console.log(`관리자 계정 생성 시도: ${email}`);
		const response = await apiAxios.post('/api/auth/admin/create', { email, password });
		return response.data;
	},

	async validateToken(token: string) {
		console.log(`토큰 검증 요청: ${token.substring(0, 20)}...`);
		const response = await apiAxios.get('/api/auth/validate', {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response.data;
	},

	async getNewsletterList() {
		console.log('뉴스레터 목록 요청');
		const response = await apiAxios.get('/api/newsletters/published');
		return response.data;
	},

	async sendNewsletter(newsletterId: number) {
		console.log(`뉴스레터 발송 요청 (동기): ID=${newsletterId}`);
		const response = await apiAxios.post(`/api/delivery/newsletters/${newsletterId}/send`);
		return response.data;
	},

	async sendNewsletterAsync(newsletterId: number) {
		console.log(`뉴스레터 발송 요청 (비동기): ID=${newsletterId}`);
		const response = await apiAxios.post(`/api/delivery/newsletters/${newsletterId}/send-async`);
		return response.data;
	},

	async sendTestEmail(newsletterId: number, email: string) {
		console.log(`테스트 이메일 발송 요청: ID=${newsletterId}, 이메일=${email}`);
		const response = await apiAxios.post(`/api/delivery/test-email?newsletterId=${newsletterId}&email=${encodeURIComponent(email)}`);
		return response.data;
	},

	async getDeliveryLogs() {
		console.log('전체 발송 로그 요청');
		const response = await apiAxios.get('/api/delivery/logs');
		return response.data;
	},

	async getDeliveryLogsByNewsletter(newsletterId: number) {
		console.log(`뉴스레터별 발송 로그 요청: ID=${newsletterId}`);
		const response = await apiAxios.get(`/api/delivery/newsletters/${newsletterId}/logs`);
		return response.data;
	},
};

export default apiAxios;
