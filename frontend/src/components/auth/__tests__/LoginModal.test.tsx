// LoginModal.test.tsx
// 로그인 모달 컴포넌트 테스트
// 테스트 항목:
// 1. 컴포넌트가 올바르게 렌더링되는지 확인
// 2. 폼 입력값 변경이 제대로 처리되는지 확인
// 3. 로그인 요청 성공 시나리오 테스트
// 4. 로그인 요청 실패 시나리오 테스트
// 5. 네트워크 에러 테스트

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginModal } from '../LoginModal';
import { AuthProvider } from '../AuthProvider';
import fetchMock from 'jest-fetch-mock';

// fetch API 모킹 활성화
fetchMock.enableMocks();

// 로그인 성공 응답 모의
const mockSuccessResponse = {
    token: 'test-token-12345',
    user: {
        id: 1,
        email: 'admin@duckherald.com',
        type: 'ADMIN'
    }
};

// 로그인 실패 응답 모의
const mockFailureResponse = {
    message: '이메일 또는 비밀번호가 올바르지 않습니다.'
};

describe('LoginModal', () => {
    // 각 테스트 전에 모의 함수 초기화
    beforeEach(() => {
        fetchMock.resetMocks();
        jest.clearAllMocks();
    });

    // 기본 프롭스
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        onLoginSuccess: jest.fn(),
    };

    // 컴포넌트 렌더링 테스트
    test('로그인 모달이 올바르게 렌더링되어야 함', () => {
        render(
            <AuthProvider>
                <LoginModal {...defaultProps} />
            </AuthProvider>
        );

        // 모달 제목 확인
        expect(screen.getByText('관리자 로그인')).toBeInTheDocument();

        // 입력 필드 확인
        expect(screen.getByLabelText('이메일')).toBeInTheDocument();
        expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();

        // 로그인 버튼 확인
        expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();

        console.log('로그인 모달 렌더링 테스트 완료');
    });

    // 입력값 변경 테스트
    test('이메일과 비밀번호 입력값 변경이 제대로 처리되어야 함', () => {
        render(
            <AuthProvider>
                <LoginModal {...defaultProps} />
            </AuthProvider>
        );

        // 이메일 입력
        const emailInput = screen.getByLabelText('이메일');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        expect(emailInput).toHaveValue('test@example.com');

        // 비밀번호 입력
        const passwordInput = screen.getByLabelText('비밀번호');
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        expect(passwordInput).toHaveValue('password123');

        console.log('입력값 변경 테스트 완료');
    });

    // 로그인 성공 테스트
    test('로그인 성공 시 onLoginSuccess 콜백이 호출되어야 함', async () => {
        // fetch 응답 모의 설정
        fetchMock.mockResponseOnce(JSON.stringify(mockSuccessResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

        render(
            <AuthProvider>
                <LoginModal {...defaultProps} />
            </AuthProvider>
        );

        // 이메일 입력
        fireEvent.change(screen.getByLabelText('이메일'), {
            target: { value: 'admin@duckherald.com' }
        });

        // 비밀번호 입력
        fireEvent.change(screen.getByLabelText('비밀번호'), {
            target: { value: 'password123' }
        });

        // 폼 제출
        fireEvent.click(screen.getByRole('button', { name: '로그인' }));

        // fetch가 호출되었는지 확인
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/api/auth/login'),
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'admin@duckherald.com',
                    password: 'password123'
                })
            })
        );

        // 로그인 성공 콜백이 호출되었는지 확인
        await waitFor(() => {
            expect(defaultProps.onLoginSuccess).toHaveBeenCalledWith('test-token-12345');
        });

        console.log('로그인 성공 테스트 완료');
    });

    // 로그인 실패 테스트
    test('로그인 실패 시 에러 메시지가 표시되어야 함', async () => {
        // fetch 응답 모의 설정 (실패 케이스)
        fetchMock.mockResponseOnce(JSON.stringify(mockFailureResponse), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });

        render(
            <AuthProvider>
                <LoginModal {...defaultProps} />
            </AuthProvider>
        );

        // 이메일 입력
        fireEvent.change(screen.getByLabelText('이메일'), {
            target: { value: 'wrong@example.com' }
        });

        // 비밀번호 입력
        fireEvent.change(screen.getByLabelText('비밀번호'), {
            target: { value: 'wrongpassword' }
        });

        // 폼 제출
        fireEvent.click(screen.getByRole('button', { name: '로그인' }));

        // 에러 메시지가 표시되었는지 확인
        await waitFor(() => {
            expect(screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeInTheDocument();
        });

        // 성공 콜백이 호출되지 않았는지 확인
        expect(defaultProps.onLoginSuccess).not.toHaveBeenCalled();

        console.log('로그인 실패 테스트 완료');
    });

    // 네트워크 에러 테스트
    test('네트워크 에러 발생 시 적절한 에러 메시지가 표시되어야 함', async () => {
        // fetch 실패 모의 설정
        fetchMock.mockRejectOnce(new Error('Network error'));

        render(
            <AuthProvider>
                <LoginModal {...defaultProps} />
            </AuthProvider>
        );

        // 이메일 입력
        fireEvent.change(screen.getByLabelText('이메일'), {
            target: { value: 'admin@duckherald.com' }
        });

        // 비밀번호 입력
        fireEvent.change(screen.getByLabelText('비밀번호'), {
            target: { value: 'password123' }
        });

        // 폼 제출
        fireEvent.click(screen.getByRole('button', { name: '로그인' }));

        // 에러 메시지가 표시되었는지 확인
        await waitFor(() => {
            expect(screen.getByText('로그인 처리 중 오류가 발생했습니다.')).toBeInTheDocument();
        });

        // 성공 콜백이 호출되지 않았는지 확인
        expect(defaultProps.onLoginSuccess).not.toHaveBeenCalled();

        console.log('네트워크 에러 테스트 완료');
    });
}); 