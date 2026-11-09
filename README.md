# 예찬 · 현주 모바일 청첩장

빌드 과정 없는 정적 페이지입니다. GitHub Pages(`https://ycl0828.github.io/wedding/`)로 배포됩니다.

## 파일 구성

| 파일 | 내용 |
| --- | --- |
| `config.js` | 이름, 일시, 장소, 교통, 인사말, 계좌, RSVP 주소 등 **내용은 전부 여기서** 수정 |
| `index.html` | 화면 구조. 카톡 미리보기용 `og:` 태그는 여기서 직접 수정 |
| `style.css` | 디자인 |
| `app.js` | 동작 (달력, 갤러리, 지도 링크, 복사/공유, RSVP 전송) |
| `apps-script/Code.gs` | 참석 여부를 구글 시트에 저장하는 Apps Script |
| `images/full`, `images/thumb` | 원본 사진 / 정사각 썸네일 (같은 파일명 쌍) |
| `images/og.jpg` | 카톡·문자 공유 미리보기 이미지 (1200×630) |

## 구글 시트 연결 (참석 여부)

1. 구글 시트를 만들고 **확장 프로그램 → Apps Script** 를 엽니다.
2. `apps-script/Code.gs` 내용을 붙여넣고 저장합니다.
3. **배포 → 새 배포 → 웹 앱**, 실행 계정은 *나*, 액세스 권한은 *모든 사용자* 로 배포합니다.
4. 나온 `/exec` 주소를 `config.js` 의 `rsvpEndpoint` 에 넣습니다.

## 카톡 미리보기가 안 바뀔 때

카카오는 미리보기를 캐시합니다. `og:` 태그나 `og.jpg` 를 바꾼 뒤에는
[카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에서 URL 캐시를 초기화하세요.
