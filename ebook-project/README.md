# EBookMarket — e-book 중고거래 플랫폼

퍼블릭 도메인 전자책을 포인트 또는 1:1 교환으로 거래할 수 있는 플랫폼 포트폴리오 프로젝트입니다.

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 18, Vite, Zustand, Axios, TailwindCSS, epub.js |
| Backend | Spring Boot 3.2, Spring Security, Spring JPA |
| Database | PostgreSQL 15, Redis 7 |
| Storage | AWS S3 |
| 인증 | JWT (Access Token 30분 / Refresh Token 7일) |

---

## 실행 방법

### 1. DB 실행 (Docker 필요)
```bash
docker-compose up -d
```

### 2. 백엔드 실행
```bash
cd backend
# application.yml의 AWS 키, JWT secret 설정 후
./gradlew bootRun
# → http://localhost:8080
```

### 3. 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 주요 기능

- 회원가입 / 로그인 (JWT 인증)
- 도서 목록 / 검색 / 카테고리 필터
- 포인트로 도서 구매
- 내 서재 관리
- epub 뷰어 (폰트 크기 조절)
- 중고 도서 등록 (포인트 판매 / 교환)
- 중고 포인트 구매
- 1:1 교환 신청 / 수락 / 거절
- 거래 내역 조회

---

## ERD 요약

```
USER ─── LIBRARY ─── BOOK
  │                    │
  └──── USED_LISTING ──┘
              │
           TRADE
```

---

## API 목록

| Method | URL | 설명 |
|--------|-----|------|
| POST | /api/auth/register | 회원가입 |
| POST | /api/auth/login | 로그인 |
| POST | /api/auth/logout | 로그아웃 |
| POST | /api/auth/reissue | 토큰 재발급 |
| GET | /api/users/me | 내 정보 |
| POST | /api/users/me/points/charge | 포인트 충전 |
| GET | /api/books | 도서 목록 |
| GET | /api/books/{id} | 도서 상세 |
| GET | /api/books/{id}/read | epub URL 발급 |
| GET | /api/library | 내 서재 |
| POST | /api/library/purchase/{bookId} | 도서 구매 |
| GET | /api/used | 중고 목록 |
| POST | /api/used | 중고 등록 |
| DELETE | /api/used/{id} | 중고 취소 |
| POST | /api/used/{id}/purchase | 포인트 구매 |
| POST | /api/used/{id}/exchange | 교환 신청 |
| PATCH | /api/used/exchange/{tradeId}/accept | 교환 수락 |
| PATCH | /api/used/exchange/{tradeId}/reject | 교환 거절 |
| GET | /api/trades/me | 거래 내역 |

---

## 참고

- 퍼블릭 도메인 epub 파일: [Project Gutenberg](https://www.gutenberg.org/)
- S3 버킷 구조: `covers/{book_id}.jpg`, `epubs/{book_id}.epub`
- `application.yml`의 AWS 키와 JWT secret은 환경변수로 분리 권장
