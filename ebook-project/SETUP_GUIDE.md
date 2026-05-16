# EBookMarket 실행 가이드

이 가이드를 순서대로 따라하면 로컬에서 완전히 동작하는 사이트를 볼 수 있습니다.

---

## Step 1. 사전 설치 확인

아래가 모두 설치되어 있어야 합니다.

- [ ] **Docker Desktop** → https://www.docker.com/products/docker-desktop/
- [ ] **Java 17** → `java -version` 확인
- [ ] **Node.js 18+** → `node -v` 확인
- [ ] **Python 3.8+** → `python3 --version` 확인
- [ ] **AWS 계정** → https://aws.amazon.com/

---

## Step 2. AWS S3 버킷 만들기

### 2-1. 버킷 생성
1. AWS 콘솔 → **S3** → **버킷 만들기**
2. 버킷 이름: 예) `my-ebook-bucket-2024` (전 세계 유일해야 함)
3. 리전: **아시아 태평양(서울) ap-northeast-2**
4. **퍼블릭 액세스 차단** → 모두 체크 유지 (presigned URL 사용하므로 그대로)
5. **버킷 만들기** 클릭

### 2-2. IAM 사용자 생성 (Access Key 발급)
1. AWS 콘솔 → **IAM** → **사용자** → **사용자 추가**
2. 사용자 이름: `ebook-app`
3. **직접 정책 연결** → `AmazonS3FullAccess` 선택
4. 사용자 생성 후 → **보안 자격 증명** 탭 → **액세스 키 만들기**
5. 액세스 키 ID, 비밀 액세스 키를 안전한 곳에 복사

### 2-3. CORS 설정 (epub 뷰어에서 S3 파일 읽기 위해 필요)
1. 버킷 → **권한** 탭 → **CORS(Cross-origin 리소스 공유)**
2. 아래 JSON 붙여넣기:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedOrigins": ["http://localhost:5173"],
    "ExposeHeaders": []
  }
]
```

---

## Step 3. application.yml 수정

`backend/src/main/resources/application.yml` 파일을 열고:

```yaml
aws:
  s3:
    bucket-name: my-ebook-bucket-2024  # ← 실제 버킷 이름으로 교체
  credentials:
    access-key: AKIAXXXXXXXXXX         # ← 발급받은 Access Key
    secret-key: xxxxxxxxxxxxxxxxxxxx   # ← 발급받은 Secret Key
```

---

## Step 4. DB 실행 (Docker)

```bash
# 프로젝트 루트에서
cd ebook-project
docker-compose up -d

# 확인
docker ps
# ebook-postgres, ebook-redis 두 컨테이너가 실행 중이어야 함
```

---

## Step 5. epub 파일 S3 업로드

```bash
# scripts/ 폴더에서
cd ebook-project/scripts
pip3 install boto3 requests
python3 setup_books.py \
  --bucket my-ebook-bucket-2024 \
  --region ap-northeast-2 \
  --access-key AKIAXXXXXXXXXX \
  --secret-key xxxxxxxxxxxxxxxxxxxx
```

완료되면 S3에 `epubs/`, `covers/` 폴더가 생기고
로컬에 `books_seed.sql` 파일이 생성됩니다.
(Spring Boot의 `DataInitializer`가 DB에 자동 삽입하므로 SQL은 참고용)

---

## Step 6. 백엔드 실행

```bash
cd ebook-project/backend
./gradlew bootRun
```

처음 실행 시:
- PostgreSQL에 테이블 자동 생성 (`ddl-auto: create`)
- `DataInitializer`가 책 10권 자동 삽입
- `http://localhost:8080` 에서 동작

---

## Step 7. 프론트엔드 실행

```bash
cd ebook-project/frontend
npm install
npm run dev
```

→ `http://localhost:5173` 에서 확인

---

## Step 8. 동작 테스트 체크리스트

### 기본 기능
- [ ] 회원가입 (`/register`)
- [ ] 로그인 (`/login`)
- [ ] 헤더에 포인트 잔액 표시

### 서점
- [ ] 도서 목록 조회 (`/books`) — 10권이 보여야 함
- [ ] 카테고리 필터 동작
- [ ] 도서 검색 동작
- [ ] 도서 상세 페이지

### 구매 & 서재
- [ ] 포인트 충전: Postman으로 `POST /api/users/me/points/charge` `{"amount": 10000}`
- [ ] 도서 구매 후 서재 이동
- [ ] epub 읽기 뷰어 동작

### 중고거래
- [ ] 내 서재에서 책 중고 등록
- [ ] 중고 마켓에서 등록된 책 확인
- [ ] 다른 계정으로 로그인 후 포인트 구매
- [ ] 교환 신청 → 수락 → 서재 변동 확인
- [ ] 거래 내역 조회

---

## Postman으로 초기 포인트 충전

테스트를 위해 포인트를 직접 충전해야 합니다.

```
POST http://localhost:8080/api/users/me/points/charge
Headers:
  Authorization: Bearer {로그인 후 받은 access_token}
  Content-Type: application/json
Body:
  {"amount": 50000}
```

---

## 자주 발생하는 오류

| 오류 | 원인 | 해결 |
|------|------|------|
| `Connection refused 5432` | PostgreSQL 미실행 | `docker-compose up -d` |
| `Connection refused 6379` | Redis 미실행 | `docker-compose up -d` |
| `S3 NoSuchBucket` | 버킷 이름 오타 | `application.yml` 확인 |
| `403 Forbidden` | JWT 토큰 없음/만료 | 재로그인 후 토큰 재사용 |
| `epub 안 열림` | S3 CORS 미설정 | Step 2-3 다시 확인 |
