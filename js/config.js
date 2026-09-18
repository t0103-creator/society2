export const APP_CONFIG = {
  storageKey: "learningRoom_projects_v1",
  roomBounds: { minX: -4.8, maxX: 4.8, minZ: -4.8, maxZ: 4.8 },
  scale: { min: 0.5, max: 2.0 },
  historyLimit: 30,
  mission: {
    title: "도시의 인구가 증가한 이유",
    description: "사람들이 이 도시로 이동한 이유를 3D 미니룸으로 표현하세요.",
    requirements: { character: 2, facility: 3, education: 3, bubble: 3, keyword: 3 },
    keywords: ["일자리","교통","교육","상업","주거","의료"]
  }
};

export const ROOM_THEMES = {
  mint: { floor: 0xcfeee2, left: 0xe7f7f1, right: 0xd9f2ea },
  peach: { floor: 0xf6dfcf, left: 0xffefe4, right: 0xf4d8c8 },
  lavender: { floor: 0xded8f5, left: 0xf1edff, right: 0xe4def7 },
  sky: { floor: 0xd9ecf6, left: 0xeaf7ff, right: 0xddeef8 }
};
