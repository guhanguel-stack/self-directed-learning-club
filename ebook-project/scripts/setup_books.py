"""
EBookMarket - 퍼블릭 도메인 책 자동 세팅 스크립트

사용법:
  pip install boto3 requests
  python setup_books.py --bucket YOUR_BUCKET --region ap-northeast-2 \
                        --access-key YOUR_KEY --secret-key YOUR_SECRET

이 스크립트가 하는 일:
  1. Project Gutenberg에서 epub 파일 10권 다운로드
  2. AWS S3에 업로드 (covers/ + epubs/)
  3. DB INSERT SQL 파일 생성 → Spring Boot 실행 시 자동 삽입됨
"""

import argparse
import time
import requests
import boto3
from pathlib import Path

# ──────────────────────────────────────────────
# 퍼블릭 도메인 책 목록 (Project Gutenberg)
# ──────────────────────────────────────────────
BOOKS = [
    {
        "id": 1,
        "gutenberg_id": 1342,
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "description": "A romantic novel that charts the emotional development of the protagonist Elizabeth Bennet.",
        "price": 1000,
        "category": "NOVEL",
    },
    {
        "id": 2,
        "gutenberg_id": 11,
        "title": "Alice's Adventures in Wonderland",
        "author": "Lewis Carroll",
        "description": "A young girl named Alice falls through a rabbit hole into a fantasy world.",
        "price": 800,
        "category": "NOVEL",
    },
    {
        "id": 3,
        "gutenberg_id": 84,
        "title": "Frankenstein",
        "author": "Mary Shelley",
        "description": "A scientist creates a sapient creature in an unorthodox scientific experiment.",
        "price": 1200,
        "category": "NOVEL",
    },
    {
        "id": 4,
        "gutenberg_id": 1661,
        "title": "The Adventures of Sherlock Holmes",
        "author": "Arthur Conan Doyle",
        "description": "Twelve stories featuring the brilliant detective Sherlock Holmes.",
        "price": 1500,
        "category": "NOVEL",
    },
    {
        "id": 5,
        "gutenberg_id": 174,
        "title": "The Picture of Dorian Gray",
        "author": "Oscar Wilde",
        "description": "A philosophical novel about a handsome man whose portrait ages while he remains young.",
        "price": 1000,
        "category": "NOVEL",
    },
    {
        "id": 6,
        "gutenberg_id": 98,
        "title": "A Tale of Two Cities",
        "author": "Charles Dickens",
        "description": "A historical novel set in London and Paris before and during the French Revolution.",
        "price": 1300,
        "category": "HISTORY",
    },
    {
        "id": 7,
        "gutenberg_id": 2701,
        "title": "Moby Dick",
        "author": "Herman Melville",
        "description": "The tale of the obsessive quest of Ahab for revenge on the whale Moby Dick.",
        "price": 1200,
        "category": "NOVEL",
    },
    {
        "id": 8,
        "gutenberg_id": 1080,
        "title": "A Modest Proposal",
        "author": "Jonathan Swift",
        "description": "A satirical essay suggesting that the poor Irish sell their children as food.",
        "price": 500,
        "category": "ESSAY",
    },
    {
        "id": 9,
        "gutenberg_id": 1400,
        "title": "Great Expectations",
        "author": "Charles Dickens",
        "description": "The story of the orphan Pip and his journey from humble beginnings to wealth.",
        "price": 1100,
        "category": "NOVEL",
    },
    {
        "id": 10,
        "gutenberg_id": 514,
        "title": "Little Women",
        "author": "Louisa May Alcott",
        "description": "Follows the lives of the four March sisters as they grow from childhood to womanhood.",
        "price": 900,
        "category": "NOVEL",
    },
]

EPUB_URL = "https://www.gutenberg.org/cache/epub/{id}/pg{id}.epub"
COVER_URL = "https://www.gutenberg.org/cache/epub/{id}/pg{id}.cover.medium.jpg"


def download_file(url, dest_path, label):
    print(f"  다운로드 중: {label} ...", end=" ", flush=True)
    try:
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        dest_path.write_bytes(resp.content)
        print(f"완료 ({len(resp.content) // 1024}KB)")
        return True
    except Exception as e:
        print(f"실패 ({e})")
        return False


def upload_to_s3(s3_client, bucket, local_path, s3_key, content_type):
    print(f"  S3 업로드: {s3_key} ...", end=" ", flush=True)
    try:
        s3_client.upload_file(
            str(local_path), bucket, s3_key,
            ExtraArgs={"ContentType": content_type}
        )
        print("완료")
        return True
    except Exception as e:
        print(f"실패 ({e})")
        return False


def generate_sql(books_with_keys):
    lines = ["-- EBookMarket 초기 데이터", "-- setup_books.py가 생성한 파일입니다.\n"]
    for b in books_with_keys:
        desc = b["description"].replace("'", "''")
        title = b["title"].replace("'", "''")
        author = b["author"].replace("'", "''")
        lines.append(
            f"INSERT INTO books (title, author, description, cover_image_url, epub_url, original_price, category, created_at) "
            f"VALUES ('{title}', '{author}', '{desc}', "
            f"'{b['cover_key']}', '{b['epub_key']}', "
            f"{b['price']}, '{b['category']}', NOW());"
        )
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="EBookMarket 책 세팅 스크립트")
    parser.add_argument("--bucket", required=True, help="S3 버킷 이름")
    parser.add_argument("--region", default="ap-northeast-2", help="AWS 리전")
    parser.add_argument("--access-key", required=True, help="AWS Access Key")
    parser.add_argument("--secret-key", required=True, help="AWS Secret Key")
    args = parser.parse_args()

    tmp_dir = Path("tmp_books")
    tmp_dir.mkdir(exist_ok=True)

    s3 = boto3.client(
        "s3",
        region_name=args.region,
        aws_access_key_id=args.access_key,
        aws_secret_access_key=args.secret_key,
    )

    books_with_keys = []

    for book in BOOKS:
        gid = book["gutenberg_id"]
        print(f"\n📖 [{book['id']}/{len(BOOKS)}] {book['title']}")

        # epub 다운로드 & 업로드
        epub_path = tmp_dir / f"{gid}.epub"
        epub_key = f"epubs/{gid}.epub"
        if download_file(EPUB_URL.format(id=gid), epub_path, "epub"):
            upload_to_s3(s3, args.bucket, epub_path, epub_key, "application/epub+zip")

        # 표지 다운로드 & 업로드
        cover_path = tmp_dir / f"{gid}_cover.jpg"
        cover_key = f"covers/{gid}.jpg"
        if download_file(COVER_URL.format(id=gid), cover_path, "표지"):
            upload_to_s3(s3, args.bucket, cover_path, cover_key, "image/jpeg")

        books_with_keys.append({**book, "epub_key": epub_key, "cover_key": cover_key})
        time.sleep(0.5)  # Gutenberg 서버 부하 방지

    # SQL 파일 생성
    sql_path = Path("books_seed.sql")
    sql_path.write_text(generate_sql(books_with_keys), encoding="utf-8")
    print(f"\n✅ 완료! SQL 파일 생성: {sql_path}")
    print("   → backend/src/main/resources/data.sql 로 복사하면 앱 시작 시 자동 삽입됩니다.")


if __name__ == "__main__":
    main()
