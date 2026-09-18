# MY LEARNING ROOM

GitHub Pages에서 바로 실행할 수 있는 Three.js 기반 교육용 3D 미니룸 웹앱입니다.

## 주요 기능

- 학생 학번/이름 입력
- 여러 작품 생성 및 불러오기
- 3D 미니룸
- 미니미/가구/시설/학습자료/키워드/움직이는 요소 추가
- 마우스·터치 기반 자유 이동
- 회전, 확대/축소, 복제, 삭제
- 반복·부유·왕복 이동 애니메이션
- 애니메이션 재생/정지/속도 변경
- 2D 말풍선 작성, 이동, 캐릭터 연결
- 일반/생각/질문/강조 말풍선 4종
- 지도·그래프·포스터 등 벽면 오브젝트 배치
- 바닥/왼쪽 벽/뒷벽 간 배치 면 전환
- 미션 결과 요약 카드
- 자동 저장 및 새로고침 후 복원
- 30단계 Undo/Redo
- 방 테마 변경
- 결과 화면
- PNG 저장
- 반응형 PC/태블릿/스마트폰 UI

## 폴더 구조

```text
my-learning-room/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    ├── app.js
    ├── assets.js
    ├── bubbles.js
    ├── config.js
    ├── history.js
    ├── room3d.js
    └── storage.js
```

## GitHub Pages 배포

1. GitHub에서 새 저장소를 생성합니다.
2. 이 폴더 안의 파일과 폴더를 저장소 루트에 그대로 업로드합니다.
3. 저장소 `Settings` → `Pages`로 이동합니다.
4. `Build and deployment`에서 `Deploy from a branch`를 선택합니다.
5. Branch를 `main`, Folder를 `/(root)`로 지정하고 저장합니다.
6. 잠시 후 `https://사용자이름.github.io/저장소이름/` 주소로 접속합니다.

## 로컬 테스트

ES Module을 사용하므로 HTML 파일을 직접 더블클릭하는 방식보다 간단한 로컬 웹 서버를 권장합니다.

Python이 설치되어 있다면:

```bash
python -m http.server 8000
```

브라우저에서 `http://localhost:8000`으로 접속합니다.

GitHub Pages에서는 별도의 서버 설정 없이 실행됩니다.

## 학습 미션 수정

`js/config.js`의 `mission`을 수정합니다.

```js
mission: {
  title: "도시의 인구가 증가한 이유",
  description: "사람들이 이 도시로 이동한 이유를 3D 미니룸으로 표현하세요.",
  requirements: {
    character: 2,
    facility: 3,
    education: 3,
    bubble: 3,
    keyword: 3
  }
}
```

## 새 3D 요소 추가

현재 기본 버전은 외부 GLB 파일 없이도 즉시 실행되도록 Three.js Geometry로 3D 요소를 생성합니다.

새 요소는 `js/assets.js`의 `ASSETS` 배열에 등록합니다.

```js
{
  id: "newItem",
  name: "새 학습 요소",
  category: "education",
  icon: "📦",
  kind: "card",
  label: "학습 내용",
  color: 0x88aaff
}
```

`kind`에 맞는 모델 생성 로직은 `js/room3d.js`의 `createVisual()`에서 관리합니다.

## GLB 모델로 확장하기

이 배포본은 GitHub 업로드 즉시 동작하는 것을 우선하여 기본 요소를 코드 기반 3D 모델로 구현했습니다.
실제 GLB 모델을 사용하려면 다음 구조를 추가할 수 있습니다.

```text
models/
├── characters/
├── furniture/
├── animated/
└── education/
```

Three.js의 `GLTFLoader`로 상대 경로의 `.glb` 파일을 불러온 뒤 현재 `createVisual()`의 procedural mesh 대신 반환하도록 확장하면 됩니다.

예시:

```js
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
loader.load("./models/furniture/desk01.glb", gltf => {
  scene.add(gltf.scene);
});
```

## 자동 저장

모든 작품 데이터는 브라우저 LocalStorage의 다음 키에 저장됩니다.

```text
learningRoom_projects_v1
```

저장되는 주요 데이터:

- 학생 정보
- 프로젝트 제목
- 방 테마
- 모든 3D 요소의 위치/회전/크기
- 애니메이션 상태
- 말풍선 내용/위치/연결 대상
- 생성 및 수정 시각

## 조작법

- 3D 객체 클릭/터치: 선택
- 선택한 객체 드래그: 바닥 위 이동
- 빈 공간 드래그: 카메라 회전
- 마우스 휠/핀치: 확대·축소
- 오른쪽 도구 패널: 회전/크기/복제/삭제
- 움직이는 객체 더블클릭: 상호작용
- 말풍선 드래그: 이동
- 말풍선 더블클릭/더블탭: 내용 수정
- Ctrl+Z: 실행 취소
- Ctrl+Shift+Z: 다시 실행

## 참고

Three.js는 jsDelivr CDN에서 불러옵니다. 따라서 최초 접속 시 인터넷 연결이 필요합니다.
완전한 오프라인 버전이 필요하면 Three.js 모듈을 저장소 내부 `vendor/three/`에 포함하도록 변경할 수 있습니다.


## v2 개선 사항

이 버전은 학생 결과를 서버나 교사 계정으로 수집하는 기능을 넣지 않았습니다. 저장은 학생 기기의 브라우저 LocalStorage에서만 수행됩니다.

개선된 기능:

- 학습자료의 벽면 자유 배치
- 선택 객체의 배치 면 변경
- 벽 오브젝트의 세로/가로 자유 이동
- 말풍선 4종
- 기본 에셋 확대
- 식물, 시민, 연구원, 상업시설, 그래프, 포스터 추가
- 결과 화면에 구성 요소 요약
- 선택/배치 UI 개선
- 모바일 화면 대응 강화

## 개인정보와 저장

이 앱은 별도 서버로 학번, 이름 또는 결과물을 전송하지 않습니다.
학생 데이터는 해당 브라우저의 LocalStorage에만 저장됩니다.
브라우저 데이터가 삭제되면 저장 작품도 삭제될 수 있으므로 결과물은 PNG로 별도 저장하는 것을 권장합니다.
