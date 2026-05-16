# 📚 EBook Market

공개 도메인 전자책 중고 거래 플랫폼 (포트폴리오 프로젝트)

Project Gutenberg의 퍼블릭 도메인 도서를 기반으로 한 이북 거래 플랫폼입니다.

---

## 🛠 Tech Stack

### Frontend
| 기술 | 버전 |
|------|------|
| React | 18 |
| Vite | 5 |
| Zustand | 4 |
| Axios | 1.6 |
| Tailwind CSS | 3 |
| epub.js | 0.3 |

### Backend
| 기술 | 버전 |
|------|------|
| Java | 17 |
| Spring Boot | 3.2 |
| Spring Security | 6 |
| Gradle | 8.10.2 |

### Database & Infrastructure
| 기술 | 버전 |
|------|------|
| PostgreSQL | 15 |
| Redis | 7 |
| Docker | - |
| AWS S3 | - |

### 인증
- JWT (Access Token 30분 + Refresh Token 7일)
- BCrypt 비밀번호 암호화
- Redis 기반 Refresh Token 관리

---

## 🏗 프로젝트 구조

```
ebook-project/
├── backend/          # Spring Boot API 서버
├── frontend/         # React 클라이언트
├── scripts/          # S3 업로드 및 초기 데이터 스크립트
└── docker-compose.yml
```

---

## 🚀 로컬 실행 방법

### 사전 준비
- Java 17
- Node.js 18+
- Docker Desktop
- AWS S3 버킷 및 액세스 키

### 1. 환경 변수 설정

`backend/src/main/resources/application.yml` 파일을 생성하고 아래 내용을 참고하여 작성:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ebook
    username: [DB_USERNAME]
    password: [DB_PASSWORD]

jwt:
  secret: [JWT_SECRET]

aws:
  access-key: [AWS_ACCESS_KEY]
  secret-key: [AWS_SECRET_KEY]
  region: ap-northeast-2
  bucket: [S3_BUCKET_NAME]
```

### 2. Docker로 DB 실행

```bash
docker compose up -d
```

### 3. 백엔드 실행

```bash
cd backend
.\gradlew.bat bootRun   # Windows
./gradlew bootRun       # Mac/Linux
```

### 4. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

### 접속 주소
- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:8080


---

## 📖 주요 기능

- 회원가입 / 로그인 (JWT 인증)
- 공개 도메인 전자책 목록 조회 및 검색
- 카테고리별 필터링
- AWS S3 Presigned URL 기반 epub 뷰어
- 중고 이북 거래 기능

---

## 📚 수록 도서 (Project Gutenberg 공개 도메인)

| 제목 | 저자 |
|------|------|
| Pride and Prejudice | Jane Austen |
| Alice's Adventures in Wonderland | Lewis Carroll |
| Frankenstein | Mary Shelley |
| The Adventures of Sherlock Holmes | Arthur Conan Doyle |
| The Picture of Dorian Gray | Oscar Wilde |
| A Tale of Two Cities | Charles Dickens |
| Moby Dick | Herman Melville |
| A Modest Proposal | Jonathan Swift |
| Great Expectations | Charles Dickens |
| Little Women | Louisa May Alcott |
