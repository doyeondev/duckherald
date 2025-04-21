// AuthProvider.test.tsx
// 인증 관련 컴포넌트 테스트
// 테스트 항목:
// 1. AuthProvider 컴포넌트 렌더링 테스트
// 2. 로그인 함수(login)가 토큰을 저장하고 인증 상태를 변경하는지 테스트
// 3. 로그아웃 함수(logout)가 토큰을 제거하고 인증 상태를 변경하는지 테스트
// 4. localStorage에서 토큰을 읽어와 인증 상태를 초기화하는지 테스트

import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthProvider';

// localStorage mocking
const localStorageMock = (function () {
    let store: Record<string, string> = {};
    return {
        getItem: jest.fn((key: string) => {
            return store[key] || null;
        }),
        setItem: jest.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        })
    };
})();

// Override localStorage
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

// 테스트를 위한 모의 컴포넌트 - useAuth를 사용하는 컴포넌트
const TestComponent = () => {
    const { isAuthenticated, login, logout } = useAuth();

    return (
        <div>
            <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
            <button data-testid="login-button" onClick={() => login('test-token')}>Login</button>
            <button data-testid="logout-button" onClick={logout}>Logout</button>
        </div>
    );
};

// 테스트 시작
describe('AuthProvider', () => {
    // 각 테스트 전에 모의 객체 초기화
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.clear();
    });

    // 기본 렌더링 테스트
    test('AuthProvider가 올바르게 렌더링되어야 함', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // 인증되지 않은 상태로 시작해야 함
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
        expect(screen.getByTestId('login-button')).toBeInTheDocument();
        expect(screen.getByTestId('logout-button')).toBeInTheDocument();

        console.log('AuthProvider 기본 렌더링 테스트 완료');
    });

    // 로그인 함수 테스트
    test('login 함수가 호출되면 토큰을 저장하고 인증 상태를 변경해야 함', async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // 초기 상태: 인증되지 않음
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');

        // 로그인 버튼 클릭
        act(() => {
            screen.getByTestId('login-button').click();
        });

        // 결과 검증
        await waitFor(() => {
            // localStorage에 토큰이 저장되었는지 확인
            expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', 'test-token');

            // 인증 상태가 변경되었는지 확인
            expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        });

        console.log('login 함수 테스트 완료');
    });

    // 로그아웃 함수 테스트
    test('logout 함수가 호출되면 토큰을 제거하고 인증 상태를 변경해야 함', async () => {
        // 먼저 인증 상태 설정
        localStorageMock.setItem('authToken', 'test-token');

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // useEffect가 실행될 시간을 주기 위해 기다림
        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        });

        // 로그아웃 버튼 클릭
        act(() => {
            screen.getByTestId('logout-button').click();
        });

        // 결과 검증
        await waitFor(() => {
            // localStorage에서 토큰이 제거되었는지 확인
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');

            // 인증 상태가 변경되었는지 확인
            expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
        });

        console.log('logout 함수 테스트 완료');
    });

    // localStorage에서 토큰 읽기 테스트
    test('localStorage에 토큰이 있으면 인증 상태를 초기화해야 함', async () => {
        // 미리 localStorage에 토큰 설정
        localStorageMock.setItem('authToken', 'existing-token');

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // useEffect 실행 후 상태 확인
        await waitFor(() => {
            // localStorage에서 토큰을 읽었는지 확인
            expect(localStorageMock.getItem).toHaveBeenCalledWith('authToken');

            // 인증 상태가 토큰 존재에 따라 설정되었는지 확인
            expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        });

        console.log('localStorage 토큰 초기화 테스트 완료');
    });
}); 