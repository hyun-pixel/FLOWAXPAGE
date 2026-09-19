// 가격·연락처·포트폴리오는 이 파일에서 수정합니다. 비밀정보는 넣지 마세요.
export const site = {
 name: 'FLOWAX-PAGE',
 prices: { reference: 500000, custom: 1500000 },
 contacts: { kakao: '', email: 'mnwlsgus1005@gmail.com', phone: '010-5768-1840' },
 pagination: { initial: 7, step: 6 },
 projects: [
  {
    "id": "flowax-dermatology",
    "name": "FLOWAX 피부과",
    "description": "플로럴 이미지와 여백으로 완성한 부드러운 인상",
    "type": "피부과",
    "url": "https://homepagehospital.vercel.app/",
    "cover": "./assets/portfolio/hospital.webp",
    "coverSmall": "./assets/portfolio/hospital-small.webp",
    "coverWidth": 1440,
    "coverHeight": 1000,
    "video": "",
    "startingPrice": null
  },
  {
    "id": "flowax-watchbox",
    "name": "FLOWAX WATCHBOX",
    "description": "레이싱의 정밀함을 담은 시계 컬렉션",
    "type": "상품 브랜드 · 시계",
    "url": "https://homepagebrand.vercel.app/",
    "cover": "./assets/portfolio/watch.webp",
    "coverSmall": "./assets/portfolio/watch-small.webp",
    "coverWidth": 1600,
    "coverHeight": 1000,
    "video": "",
    "startingPrice": null
  },
  {
    "id": "flowax-stay",
    "name": "FLOWAX 제주 펜션",
    "description": "공간의 분위기를 전하는 영상과 객실 탐색",
    "type": "숙박 · 펜션",
    "url": "https://homepagehotel.vercel.app/",
    "featured": true,
    "cover": "./assets/portfolio/stay.webp",
    "coverSmall": "./assets/portfolio/stay-small.webp",
    "coverWidth": 1600,
    "coverHeight": 820,
    "video": "",
    "startingPrice": null
  },
  {
    "id": "flowax-space",
    "name": "FLOWAX SPACE",
    "description": "우주 탐사의 이야기를 따라가는 몰입형 화면",
    "type": "연구소 · 기술",
    "url": "https://homepagelab-three.vercel.app/",
    "cover": "./assets/portfolio/space.webp",
    "coverSmall": "./assets/portfolio/space-small.webp",
    "coverWidth": 1600,
    "coverHeight": 1000,
    "video": "",
    "startingPrice": null
  },
  {
    "id": "flowax-travel",
    "name": "FLOWAX TRAVEL",
    "description": "여행의 기대감에서 코스 탐색으로 이어지는 구성",
    "type": "여행사",
    "url": "https://flowaxtravel.vercel.app/",
    "cover": "./assets/portfolio/travel.webp",
    "coverSmall": "./assets/portfolio/travel-small.webp",
    "coverWidth": 1600,
    "coverHeight": 1000,
    "video": "",
    "startingPrice": null
  },
  {
    "id": "flowax-tattoo",
    "name": "FLOWAX TATTOO",
    "description": "먹과 선의 질감을 살린 디자인 아카이브",
    "type": "타투 스튜디오",
    "url": "https://homepagetatto.vercel.app/",
    "cover": "./assets/portfolio/tattoo.webp",
    "coverSmall": "./assets/portfolio/tattoo-small.webp",
    "coverWidth": 1600,
    "coverHeight": 1000,
    "video": "",
    "startingPrice": null
  },
  {
    "id": "flowax-rent",
    "name": "FLOWAX 렌트카",
    "description": "주행 영상으로 시작하는 프리미엄 차량 소개",
    "type": "렌트카",
    "url": "https://homepagerent.vercel.app/",
    "cover": "./assets/portfolio/rent.webp",
    "coverSmall": "./assets/portfolio/rent-small.webp",
    "coverWidth": 1600,
    "coverHeight": 1000,
    "video": "",
    "startingPrice": null
  }
],
 capabilities: [
  [
    "회사와 서비스 소개",
    [
      "소개 페이지와 내용 추가",
      "회사·팀 소개",
      "서비스 자세히 소개",
      "회사 연혁 소개",
      "채용 안내",
      "자료 내려받기"
    ]
  ],
  [
    "눈길을 끄는 화면과 움직임",
    [
      "스크롤에 맞춰 움직이는 화면",
      "마우스에 반응하는 효과",
      "페이지가 바뀔 때의 효과",
      "움직이는 글자",
      "배경에 영상 넣기",
      "제품을 돌려 보는 3D 화면"
    ]
  ],
  [
    "문의와 상담받기",
    [
      "문의 내용 남기기",
      "견적 요청하기",
      "문의할 때 파일 첨부",
      "카카오톡으로 바로 연결",
      "실시간 채팅 상담",
      "상담 신청"
    ]
  ],
  [
    "예약과 일정 관리",
    [
      "날짜와 시간 선택",
      "원하는 담당자 예약",
      "예약 가능한 자리 확인",
      "예약 변경·취소",
      "일정표로 예약 확인"
    ]
  ],
  [
    "상품 판매와 주문 관리",
    [
      "상품 등록",
      "색상·크기 등 옵션 선택",
      "장바구니",
      "주문서 작성",
      "남은 재고 확인",
      "배송 상태 확인",
      "할인 쿠폰 사용"
    ]
  ],
  [
    "결제와 정기 구독",
    [
      "카드·간편결제로 결제",
      "예약금 결제",
      "정해진 주기마다 자동 결제",
      "결제 내역 확인",
      "취소·환불 처리"
    ]
  ],
  [
    "회원가입과 회원 관리",
    [
      "회원가입·로그인",
      "카카오·네이버 등으로 로그인",
      "내 정보와 이용 내역 확인",
      "회원 등급 설정",
      "회원에게만 내용 공개",
      "회원별로 볼 수 있는 메뉴 설정"
    ]
  ],
  [
    "공지·후기·게시판",
    [
      "공지사항 올리기",
      "블로그 글 쓰기",
      "후기와 댓글 남기기",
      "질문하고 답변하기",
      "사진 모아 보기",
      "게시글 신고·승인 관리"
    ]
  ],
  [
    "직접 수정하는 관리 화면",
    [
      "글과 사진 직접 수정",
      "상품·예약·회원 관리",
      "문의 처리 여부 확인",
      "직원별로 관리할 메뉴 설정",
      "통계 한눈에 보기"
    ]
  ],
  [
    "정보 검색과 매장 찾기",
    [
      "사이트 안에서 검색",
      "가격·종류 등 조건으로 좁혀 찾기",
      "원하는 순서로 정렬",
      "매장과 지점 찾기",
      "지도에서 위치 확인",
      "가까운 곳 찾기",
      "마음에 드는 항목 저장"
    ]
  ],
  [
    "견적 계산과 상품 비교",
    [
      "선택한 옵션에 따라 예상 견적 계산",
      "이용 요금 미리 계산",
      "상품끼리 비교",
      "원하는 옵션 조합",
      "질문에 답하면 맞는 상품 추천"
    ]
  ],
  [
    "강의·행사 신청",
    [
      "수강 신청",
      "강의 목록 보기",
      "어디까지 수강했는지 확인",
      "퀴즈 풀기",
      "행사 참가 신청",
      "참석 여부 확인",
      "대기 신청 관리"
    ]
  ],
  [
    "파일과 문서 관리",
    [
      "파일 올리기·내려받기",
      "신청서 출력",
      "견적서·PDF 만들기",
      "엑셀 자료 가져오기·내려받기"
    ]
  ],
  [
    "여러 언어로 안내하기",
    [
      "원하는 언어로 바꾸기",
      "언어별로 별도 페이지 제공",
      "번역한 글 직접 관리",
      "나라별 연락처와 안내 표시"
    ]
  ],
  [
    "알림과 반복 업무 줄이기",
    [
      "접수 확인 이메일 자동 발송",
      "예약일 미리 알려주기",
      "문자·카카오 알림톡 보내기",
      "담당자에게 새 문의 알리기",
      "처리 상태가 바뀌면 알리기",
      "정기적으로 보고서 만들기"
    ]
  ],
  [
    "지금 쓰는 서비스와 연결",
    [
      "예약을 캘린더와 연결",
      "엑셀·구글시트에 신청 내역 모으기",
      "고객 관리 프로그램과 연결",
      "배송 서비스와 연결",
      "공개된 자료를 가져와 보여주기"
    ]
  ],
  [
    "AI로 고객 응대와 글쓰기",
    [
      "등록한 자료를 바탕으로 질문에 답하기",
      "챗봇으로 고객 상담",
      "긴 문서 요약",
      "소개글과 안내 문구 작성 돕기",
      "번역 돕기",
      "고객에게 맞는 상품 추천"
    ]
  ],
  [
    "방문자와 광고 효과 확인",
    [
      "방문자 수 확인",
      "방문 후 문의·구매로 이어진 수 확인",
      "어디에서 방문했는지 확인",
      "광고를 보고 들어온 고객 확인",
      "검색에 필요한 사이트 기본 정보 설정"
    ]
  ],
  [
    "실시간 대화와 현황 확인",
    [
      "실시간 채팅",
      "현재 상황을 바로 보여주는 화면",
      "새 소식 알림",
      "주문·예약 상태 바로 확인",
      "여러 사람이 함께 작업"
    ]
  ],
  [
    "휴대폰에서 앱처럼 사용",
    [
      "휴대폰 홈 화면에 추가",
      "인터넷 없이 일부 기능 이용",
      "지원되는 기기에서 알림 받기"
    ]
  ]
]
};
