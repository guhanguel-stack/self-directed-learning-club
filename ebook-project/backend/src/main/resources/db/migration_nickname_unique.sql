-- nickname 컬럼 UNIQUE 제약 조건 및 길이 변경 마이그레이션
-- PostgreSQL 기준 (Render 배포 환경)

-- 기존에 nickname 컬럼에 UNIQUE 제약이 없는 경우 아래 실행
ALTER TABLE users
    ALTER COLUMN nickname TYPE VARCHAR(30),
    ADD CONSTRAINT users_nickname_unique UNIQUE (nickname);

-- 이미 중복 닉네임이 있다면 아래 쿼리로 확인 후 정리 필요
-- SELECT nickname, COUNT(*) FROM users GROUP BY nickname HAVING COUNT(*) > 1;
