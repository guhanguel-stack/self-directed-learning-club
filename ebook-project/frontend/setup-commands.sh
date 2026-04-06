#!/bin/bash
# React 프로젝트 초기 세팅 명령어 모음
# 터미널에서 frontend/ 폴더 안에서 실행하세요

# 1. React 프로젝트 생성 (Vite 사용 - CRA보다 빠름)
npm create vite@latest . -- --template react

# 2. 기본 패키지 설치
npm install

# 3. 필수 라이브러리 설치
npm install axios                        # API 통신
npm install react-router-dom             # 페이지 라우팅
npm install zustand                      # 전역 상태관리
npm install epubjs                       # epub 뷰어

# 4. 개발 편의 라이브러리
npm install -D tailwindcss postcss autoprefixer   # CSS 유틸리티
npx tailwindcss init -p

# 설치 완료 후 실행
# npm run dev → http://localhost:5173
