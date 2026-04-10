/* ============================================================
   firebase-config.js — Firebase 프로젝트 설정 (여기만 교체하면 됩니다)

   ✅ 새 Firebase 프로젝트 전환 시 이 파일만 수정하세요.
   Firebase Console (https://console.firebase.google.com)
   → 프로젝트 설정 → 내 앱 → SDK 설정 및 구성에서 복사
   ============================================================ */

const firebaseConfig = {
  apiKey:            "여기에_apiKey_입력",
  authDomain:        "여기에_authDomain_입력",        // 예: your-project.firebaseapp.com
  projectId:         "여기에_projectId_입력",          // 예: your-project-id
  storageBucket:     "여기에_storageBucket_입력",      // 예: your-project.appspot.com
  messagingSenderId: "여기에_messagingSenderId_입력",
  appId:             "여기에_appId_입력",
};

// Firebase 앱 초기화 (전체 앱에서 단 1회)
firebase.initializeApp(firebaseConfig);
