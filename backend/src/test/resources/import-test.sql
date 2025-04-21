-- 테스트용 구독자 데이터
INSERT INTO subscriber (id, email, status, created_at, unsubscribed_at) VALUES (1, 'test@example.com', 'ACTIVE', '2025-01-01 10:00:00', NULL);
INSERT INTO subscriber (id, email, status, created_at, unsubscribed_at) VALUES (2, 'inactive@example.com', 'INACTIVE', '2025-01-02 11:00:00', '2025-01-05 11:00:00');
INSERT INTO subscriber (id, email, status, created_at, unsubscribed_at) VALUES (3, 'admin@duckherald.com', 'ACTIVE', '2025-01-03 12:00:00', NULL);

-- 테스트용 뉴스레터 데이터
INSERT INTO newsletter (id, title, content, status, created_at, updated_at, published_at, author_id) 
VALUES (1, '첫 번째 테스트 뉴스레터', '테스트 내용입니다.', 'PUBLISHED', '2025-01-10 10:00:00', '2025-01-10 11:00:00', '2025-01-10 12:00:00', 1);
INSERT INTO newsletter (id, title, content, status, created_at, updated_at, published_at, author_id) 
VALUES (2, '두 번째 테스트 뉴스레터', '임시 저장된 뉴스레터입니다.', 'DRAFT', '2025-01-11 10:00:00', '2025-01-11 11:00:00', NULL, 1);

-- 테스트용 어드민 사용자 데이터
INSERT INTO admin_user (id, email, password, name, role, created_at) 
VALUES (1, 'admin@duckherald.com', '$2a$10$zCN.eOOy1wlm6tlOjGYuIeY.UUlKGRxsUVS/2XNW16kqQHCzGqOES', '테스트 관리자', 'ADMIN', '2025-01-01 00:00:00');

-- 테스트용 발송 기록 데이터
INSERT INTO delivery (id, newsletter_id, subscriber_id, status, sent_at, error_message) 
VALUES (1, 1, 1, 'SENT', '2025-01-10 13:00:00', NULL);
INSERT INTO delivery (id, newsletter_id, subscriber_id, status, sent_at, error_message) 
VALUES (2, 1, 3, 'SENT', '2025-01-10 13:01:00', NULL);
INSERT INTO delivery (id, newsletter_id, subscriber_id, status, sent_at, error_message) 
VALUES (3, 1, 2, 'FAILED', '2025-01-10 13:02:00', '이메일 발송 실패: 구독 해지된 이메일'); 