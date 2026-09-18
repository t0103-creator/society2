export const ASSETS = [
  {id:"studentA",name:"학생 A",category:"character",icon:"🧑‍🎓",kind:"person",color:0x6d5fe8,animated:true,animType:"bob",placement:"floor"},
  {id:"studentB",name:"학생 B",category:"character",icon:"👩‍🎓",kind:"person",color:0xe881a6,animated:true,animType:"bob",placement:"floor"},
  {id:"teacher",name:"교사",category:"character",icon:"🧑‍🏫",kind:"person",color:0x4f92a8,animated:true,animType:"bob",placement:"floor"},
  {id:"citizen",name:"시민",category:"character",icon:"🧑",kind:"person",color:0x6ea66c,animated:true,animType:"bob",placement:"floor"},
  {id:"researcher",name:"연구원",category:"character",icon:"🥼",kind:"person",color:0xb56fb4,animated:true,animType:"bob",placement:"floor"},

  {id:"desk",name:"책상",category:"furniture",icon:"🪵",kind:"desk",color:0xb67d4c,placement:"floor"},
  {id:"chair",name:"의자",category:"furniture",icon:"🪑",kind:"chair",color:0xcf8f5e,placement:"floor"},
  {id:"sofa",name:"소파",category:"furniture",icon:"🛋️",kind:"sofa",color:0x7db3c9,placement:"floor"},
  {id:"bookshelf",name:"책장",category:"furniture",icon:"📚",kind:"bookshelf",color:0x9c6e49,placement:"floor"},
  {id:"plant",name:"화분",category:"furniture",icon:"🪴",kind:"plant",color:0x67a878,placement:"floor"},

  {id:"school",name:"학교",category:"facility",icon:"🏫",kind:"building",color:0xe4a55a,placement:"floor"},
  {id:"hospital",name:"병원",category:"facility",icon:"🏥",kind:"building",color:0xe87f7f,placement:"floor"},
  {id:"station",name:"교통시설",category:"facility",icon:"🚉",kind:"building",color:0x6aa0c9,placement:"floor"},
  {id:"shop",name:"상업시설",category:"facility",icon:"🏬",kind:"building",color:0xd28fc0,placement:"floor"},

  {id:"globe",name:"회전 지구본",category:"education",icon:"🌍",kind:"globe",color:0x57a7c7,animated:true,animType:"spin",placement:"floor"},
  {id:"mapBoard",name:"지도 자료",category:"education",icon:"🗺️",kind:"board",label:"MAP",color:0x8fcf9e,placement:"backWall"},
  {id:"question",name:"질문 카드",category:"education",icon:"❓",kind:"card",label:"왜 이동했을까?",color:0xf4c96d,placement:"backWall"},
  {id:"graph",name:"그래프",category:"education",icon:"📊",kind:"board",label:"GRAPH",color:0x7ba7da,placement:"backWall"},
  {id:"poster",name:"포스터",category:"education",icon:"📝",kind:"card",label:"학습 포스터",color:0xe5a86d,placement:"leftWall"},

  {id:"keywordJob",name:"일자리",category:"keyword",icon:"💼",kind:"keyword",label:"일자리",color:0xf3b742,animated:true,animType:"float",placement:"floor"},
  {id:"keywordTraffic",name:"교통",category:"keyword",icon:"🚌",kind:"keyword",label:"교통",color:0x5da6d8,animated:true,animType:"float",placement:"floor"},
  {id:"keywordEdu",name:"교육",category:"keyword",icon:"📘",kind:"keyword",label:"교육",color:0x7868d8,animated:true,animType:"float",placement:"floor"},
  {id:"keywordHouse",name:"주거",category:"keyword",icon:"🏠",kind:"keyword",label:"주거",color:0x7bbd86,animated:true,animType:"float",placement:"floor"},
  {id:"keywordMedical",name:"의료",category:"keyword",icon:"🩺",kind:"keyword",label:"의료",color:0xdf7e88,animated:true,animType:"float",placement:"floor"},

  {id:"dog",name:"강아지",category:"animated",icon:"🐶",kind:"animal",color:0xd39255,animated:true,animType:"patrol",placement:"floor"},
  {id:"cat",name:"고양이",category:"animated",icon:"🐱",kind:"animal",color:0x8e8b97,animated:true,animType:"patrol",placement:"floor"},
  {id:"car",name:"자동차",category:"animated",icon:"🚗",kind:"car",color:0xe45e5e,animated:true,animType:"patrol",placement:"floor"},
  {id:"drone",name:"드론",category:"animated",icon:"🚁",kind:"drone",color:0x626875,animated:true,animType:"hover",placement:"floor"},
  {id:"fan",name:"선풍기",category:"animated",icon:"🌀",kind:"fan",color:0x9fbac7,animated:true,animType:"spinPart",placement:"floor"}
];

export const CATEGORIES = [
  ["all","전체"],["character","미니미"],["furniture","가구"],["facility","시설"],
  ["education","학습"],["keyword","키워드"],["animated","움직임"]
];
