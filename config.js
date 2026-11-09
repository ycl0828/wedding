/* =========================================================
   청첩장 설정 파일 — 이 파일만 고치면 내용이 전부 바뀝니다.
   ========================================================= */
window.WEDDING = {
  groom: { name: "이예찬", short: "예찬", en: "Yechan", father: "이광희", mother: "육순희", relation: "아들" },
  bride: { name: "함현주", short: "현주", en: "Hyunju", father: "함관수", mother: "정은경", relation: "딸" },

  // ⚠️ 예식 일시 — 반드시 실제 날짜/시간으로 바꿔주세요 (24시간 형식)
  date: "2027-03-20T12:00:00+09:00",

  venue: {
    name: "로얄파크컨벤션",
    hall: "",                 // 예: "2층 그랜드홀" — 비워두면 표시 안 됨
    tel: "",                  // 예: "02-000-0000" — 비워두면 전화 아이콘 숨김
    address: "서울 용산구 이태원로 29",
    addressJibun: "서울 용산구 용산동1가 8",
  },

  transport: [
    { title: "지하철", items: [
      "6호선 삼각지역 12번 출구 (도보 3분)",
      "4호선 삼각지역 1번 출구 (도보 5분)",
      "1호선 남영역 1번 출구 (도보 7분)",
    ]},
    { title: "버스", items: [
      "<b>삼각지역 11번 출구</b> 421, N75, 용산03",
      "<b>삼각지역</b> 100, 150, 151, 152, 500, 501, 502, 504, 506, 507, 605, 742, 750A, 750B, 752, N15",
      "<b>전쟁기념관</b> 110A, 421, 740, N72, N75, 용산03",
    ]},
    { title: "주차", items: [ "전쟁기념관 내 주차장 이용 가능" ] },
  ],

  greeting: [
    "서로 다른 길을 걸어온 두 사람이",
    "이제 같은 곳을 바라보며 함께 걸어가려 합니다.",
    "",
    "저희의 새로운 시작을",
    "따뜻한 마음으로 축복해 주신다면",
    "그 사랑을 오래도록 간직하며 살겠습니다.",
  ],

  // 화환 안내 섹션 — 예식장에서 화환을 받지 않는 경우에만 true
  showFlowerNotice: false,

  // ⚠️ 계좌 정보 — 실제 정보로 바꿔주세요. 필요 없는 줄은 지우면 됩니다.
  accounts: {
    groom: [
      { role: "신랑", name: "이예찬", bank: "농협은행", number: "312-5127-0438-51" },
      { role: "신랑 아버지", name: "이광희", bank: "은행명", number: "000-0000-0000-00" },
      { role: "신랑 어머니", name: "육순희", bank: "은행명", number: "000-0000-0000-00" },
    ],
    bride: [
      { role: "신부", name: "함현주", bank: "케이뱅크", number: "100-206-927183" },
      { role: "신부 아버지", name: "함관수", bank: "은행명", number: "000-0000-0000-00" },
      { role: "신부 어머니", name: "정은경", bank: "은행명", number: "000-0000-0000-00" },
    ],
  },

  // 참석 여부 → 구글 시트 연동 주소 (README의 "구글 시트 연결" 참고)
  // 비워두면 폼은 보이지만 제출 시 안내 메시지만 뜹니다.
  rsvpEndpoint: "https://script.google.com/macros/s/AKfycbycLm02_hz7q8JRGwX2lukSc9Imo_f6QHIElKlz--qBxuFNtUpN3Y7xoTOyED-ytLZW/exec",

  // 처음 접속 시 참석 여부 팝업 띄우기
  rsvpPopupOnLoad: true,

  cover: "images/full/01.jpg",
  photos: Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")),
};
