// 課室位置圖：S + 樓層 + 欄號(01-13)
export const layout = {
  "7/F": [
    { col: 1, code: "S701", name: "會議室" }, { col: 2, code: "S702", name: "1E" },
    { col: 3, code: "S703", name: "1D" }, { col: 4, code: "S704", name: "1C" },
    { col: 5, code: "S705", name: "1B" }, { col: 6, code: "S706", name: "1A" },
    { col: 9, code: "S709", name: "教員室" },
  ],
  "6/F": [
    { col: 1, code: "S601", name: "多媒體學習室" }, { col: 2, code: "S602", name: "電腦室" },
    { col: 4, code: "S604", name: "STEM Lab" }, { col: 7, code: "S607", name: "物理實驗室" },
    { col: 8, code: "S608", name: "化學實驗室" },
  ],
  "5/F": [
    { col: 1, code: "S501", name: "分班用班房" }, { col: 2, code: "S502", name: "2E" },
    { col: 3, code: "S503", name: "2D" }, { col: 4, code: "S504", name: "2C" },
    { col: 5, code: "S505", name: "2B" }, { col: 6, code: "S506", name: "2A" },
    { col: 9, code: "S509", name: "生物科技教研室" }, { col: 11, code: "S511", name: "綜合科學實驗室" },
  ],
  "4/F": [
    { col: 1, code: "S401", name: "分班用班房" }, { col: 2, code: "S402", name: "3A" },
    { col: 3, code: "S403", name: "3B" }, { col: 4, code: "S404", name: "3C" },
    { col: 5, code: "S405", name: "3D" }, { col: 6, code: "S406", name: "3E" },
    { col: 9, code: "S409", name: "生物實驗室" }, { col: 10, code: "S410", name: "地理室" },
  ],
  "3/F": [
    { col: 1, code: "S301", name: "6A" }, { col: 2, code: "S302", name: "6B" },
    { col: 3, code: "S303", name: "4A" }, { col: 4, code: "S304", name: "4B" },
    { col: 5, code: "S305", name: "4C" }, { col: 6, code: "S306", name: "4D" },
    { col: 9, code: "S309", name: "綜合人文科教學室" }, { col: 11, code: "S311", name: "數學室" },
  ],
  "2/F": [
    { col: 1, code: "S201", name: "6C" }, { col: 2, code: "S202", name: "6D" },
    { col: 3, code: "S203", name: "5A" }, { col: 4, code: "S204", name: "5B" },
    { col: 5, code: "S205", name: "5C" }, { col: 6, code: "S206", name: "5D" },
    { col: 9, code: "S209", name: "音樂室" }, { col: 10, code: "S210", name: "視覺藝術室" },
    { col: 11, code: "S211", name: "演講廳" },
  ],
  "1/F": [
    { col: 1, code: "S101", name: "輔導組/後備班房" },
    { col: 5, code: "S105", name: "多用途活動室" },
    { col: 6, code: "S106", name: "家政室" },
    { col: 7, code: "S107", name: "Band Room" }, { col: 8, code: "S108", name: "健身室及英語角" },
    { col: 9, code: "S109", name: "多用途活動室/後備課室" },
  ],
  "G/F": [],
};

// 設備清單 (1 = 需要安裝, 0 = 不需要安裝)
export const equipment = {
  S701: { wb: 0, pa: 0, socket: 1, remark: "已裝電子白板" },
  S702: { wb: 1, pa: 1, socket: 1, remark: "" },
  S703: { wb: 1, pa: 1, socket: 1, remark: "" },
  S704: { wb: 1, pa: 1, socket: 1, remark: "" },
  S705: { wb: 1, pa: 1, socket: 1, remark: "" },
  S706: { wb: 1, pa: 1, socket: 1, remark: "" },
  S709: { wb: 0, pa: 0, socket: 1, remark: "" },
  S601: { wb: 0, pa: 0, socket: 1, remark: "已裝電子白板，已有可靠PA" },
  S602: { wb: 0, pa: 1, socket: 1, remark: "已裝電子白板" },
  S604: { wb: 0, pa: 0, socket: 1, remark: "已裝電子白板，已有可靠PA" },
  S607: { wb: 0, pa: 1, socket: 1, remark: "已裝電子白板" },
  S608: { wb: 0, pa: 1, socket: 1, remark: "未計劃裝電子白板" },
  S501: { wb: 1, pa: 1, socket: 1, remark: "" },
  S502: { wb: 1, pa: 1, socket: 1, remark: "" },
  S503: { wb: 1, pa: 1, socket: 1, remark: "" },
  S504: { wb: 1, pa: 1, socket: 1, remark: "" },
  S505: { wb: 1, pa: 1, socket: 1, remark: "" },
  S506: { wb: 1, pa: 1, socket: 1, remark: "" },
  S509: { wb: 0, pa: 1, socket: 1, remark: "已裝電子白板" },
  S511: { wb: 0, pa: 0, socket: 1, remark: "已裝電子白板，已有可靠PA" },
  S401: { wb: 1, pa: 1, socket: 1, remark: "" },
  S402: { wb: 1, pa: 1, socket: 1, remark: "" },
  S403: { wb: 1, pa: 1, socket: 1, remark: "" },
  S404: { wb: 1, pa: 1, socket: 1, remark: "" },
  S405: { wb: 1, pa: 1, socket: 1, remark: "" },
  S406: { wb: 1, pa: 1, socket: 1, remark: "" },
  S409: { wb: 0, pa: 1, socket: 1, remark: "已裝電子白板" },
  S410: { wb: 0, pa: 1, socket: 1, remark: "已裝電子白板" },
  S301: { wb: 1, pa: 1, socket: 1, remark: "" },
  S302: { wb: 1, pa: 1, socket: 1, remark: "" },
  S303: { wb: 1, pa: 1, socket: 1, remark: "" },
  S304: { wb: 1, pa: 1, socket: 1, remark: "" },
  S305: { wb: 1, pa: 1, socket: 1, remark: "" },
  S306: { wb: 1, pa: 1, socket: 1, remark: "" },
  S309: { wb: 0, pa: 1, socket: 0, remark: "已裝電子白板" },
  S311: { wb: 0, pa: 1, socket: 1, remark: "已裝電子白板" },
  S201: { wb: 1, pa: 1, socket: 1, remark: "" },
  S202: { wb: 1, pa: 1, socket: 1, remark: "" },
  S203: { wb: 1, pa: 1, socket: 1, remark: "" },
  S204: { wb: 1, pa: 1, socket: 1, remark: "" },
  S205: { wb: 1, pa: 1, socket: 1, remark: "" },
  S206: { wb: 1, pa: 1, socket: 1, remark: "" },
  S209: { wb: 0, pa: 1, socket: 1, remark: "未計劃裝電子白板" },
  S210: { wb: 0, pa: 1, socket: 1, remark: "未計劃裝電子白板" },
  S211: { wb: 0, pa: 0, socket: 1, remark: "" },
  S101: { wb: 1, pa: 1, socket: 1, remark: "" },
  S105: { wb: 0, pa: 0, socket: 1, remark: "" },
  S106: { wb: 0, pa: 0, socket: 1, remark: "已有新PA" },
  S109: { wb: 1, pa: 0, socket: 1, remark: "已有新PA" },
  S108: { wb: 0, pa: 0, socket: 1, remark: "" },
  S107: { wb: 0, pa: 0, socket: 1, remark: "" },
};

export const purposeColors = {
  "補課": "#f59e0b",
  "SEN試升": "#ef4444",
  "學業試升": "#8b5cf6",
  "STEM ELITE TEAM": "#0ea5e9",
  "試升班會議": "#ec4899",
  "PEX 急救": "#14b8a6",
  "行政用": "#64748b",
  "PEX 急救考試": "#0d9488",
  "派書": "#d946ef",
};

// 每日佔用：t = 使用人, p = 性質
export const occupancy = {
  "2025-07-20": { label: "7月20日 (一)", rooms: {
    S201:{t:"YWS/TCL",p:"SEN試升"}, S202:{t:"MSK",p:"補課"}, S203:{t:"LYN/FYK",p:"補課"},
    S204:{t:"HCF/WYC",p:"補課"}, S205:{t:"CKH/TLN",p:"補課"}, S206:{t:"LYS",p:"補課"},
    S210:{t:"LUY",p:"補課"}, S302:{t:"HCF",p:"補課"}, S304:{t:"LYF",p:"補課"},
    S309:{t:"CKC",p:"補課"}, S311:{t:"TMC",p:"補課"}, S601:{t:"YWS/TCL",p:"SEN試升"},
    S602:{t:"YWS/TCL",p:"SEN試升"}, S703:{t:"TTC",p:"學業試升"}, S704:{t:"TTC",p:"學業試升"},
    S705:{t:"TTC",p:"學業試升"}, S706:{t:"TTC",p:"學業試升"},
  }},
  "2025-07-21": { label: "7月21日 (二)", rooms: {
    S106:{t:"MSW",p:"補課"}, S201:{t:"YWS/TCL",p:"SEN試升"}, S203:{t:"YLP/MSW",p:"補課"},
    S204:{t:"LHW/LKR",p:"補課"}, S205:{t:"SCM/LSH",p:"補課"}, S206:{t:"YMY/LWS",p:"補課"}, S210:{t:"SYS",p:"補課"},
    S302:{t:"TLN",p:"補課"}, S303:{t:"WYC",p:"補課"}, S305:{t:"WCK",p:"補課"},
    S601:{t:"YWS/TCL",p:"SEN試升"}, S602:{t:"YWS/TCL",p:"SEN試升"},
    S604:{t:"CKH/SCY/FCE",p:"STEM ELITE TEAM"}, S703:{t:"TTC",p:"學業試升"},
    S704:{t:"TTC",p:"學業試升"}, S705:{t:"TTC",p:"學業試升"}, S706:{t:"TTC",p:"學業試升"},
  }},
  "2025-07-22": { label: "7月22日 (三)", rooms: {
    S201:{t:"YWS/TCL",p:"SEN試升"}, S202:{t:"FSY",p:"補課"}, S203:{t:"CSK/SMY",p:"補課"},
    S204:{t:"LLN/FSY",p:"補課"}, S205:{t:"TKH/LYG",p:"補課"}, S206:{t:"CCU/CCN",p:"補課"},
    S302:{t:"TLN",p:"補課"}, S303:{t:"WYC",p:"補課"}, S305:{t:"WCK",p:"補課"}, S306:{t:"LYG",p:"補課"}, S311:{t:"TMC",p:"補課"},
    S601:{t:"YWS/TCL",p:"SEN試升"}, S602:{t:"YWS/TCL",p:"SEN試升"},
    S701:{t:"TTC/LYF",p:"試升班會議"}, S703:{t:"TTC",p:"學業試升"}, S704:{t:"TTC",p:"學業試升"},
    S705:{t:"TTC",p:"學業試升"}, S706:{t:"TTC",p:"學業試升"},
  }},
  "2025-07-23": { label: "7月23日 (四)", rooms: {
    S202:{t:"MSK",p:"補課"}, S203:{t:"FYK/LYN",p:"補課"}, S204:{t:"WYC/HCF",p:"補課"},
    S205:{t:"TLN/CKH",p:"補課"}, S206:{t:"LYS",p:"補課"}, S304:{t:"HCF/LYF/KKC",p:"補課"},
    S306:{t:"YCH",p:"補課"}, S309:{t:"CKC",p:"補課"}, S311:{t:"TMC",p:"補課"},
    S604:{t:"CKH/SCY/FCE",p:"STEM ELITE TEAM"},
  }},
  "2025-07-24": { label: "7月24日 (五)", rooms: {
    S204:{t:"KKC",p:"補課"}, S206:{t:"YCH/LWS",p:"補課"}, S309:{t:"FSY",p:"補課"},
    S311:{t:"TMC",p:"補課"}, S601:{t:"LKR",p:"補課"},
  }},
  "2025-07-27": { label: "7月27日 (一)", rooms: {
    S105:{t:"WCY",p:"PEX 急救"}, S309:{t:"FSY/CKC",p:"補課"}, S311:{t:"HCF",p:"補課"},
    S601:{t:"LKR",p:"補課"},
  }},
  "2025-07-28": { label: "7月28日 (二)", rooms: {
    S105:{t:"WCY",p:"PEX 急救"}, S309:{t:"CKC",p:"補課"}, S601:{t:"LKR",p:"補課"},
    S604:{t:"CKH/SCY/FCE",p:"STEM ELITE TEAM"}, S607:{t:"CKH",p:"補課"}, S608:{t:"LYF",p:"補課"},
  }},
  "2025-07-29": { label: "7月29日 (三)", rooms: {
    S105:{t:"WCY",p:"PEX 急救"}, S309:{t:"FSY",p:"補課"}, S311:{t:"TMC",p:"補課"},
  }},
  "2025-07-30": { label: "7月30日 (四)", rooms: {
    S105:{t:"WCY",p:"PEX 急救"}, S309:{t:"FSY",p:"補課"}, S311:{t:"HCF",p:"補課"},
    S607:{t:"CKH",p:"補課"},
  }},
  "2025-07-31": { label: "7月31日 (五)", rooms: {} },
  "2025-08-03": { label: "8月3日 (一)", rooms: {} },
  "2025-08-04": { label: "8月4日 (二)", rooms: {} },
  "2025-08-05": { label: "8月5日 (三)", rooms: {} },
  "2025-08-06": { label: "8月6日 (四)", rooms: {} },
  "2025-08-07": { label: "8月7日 (五)", rooms: {} },
  "2025-08-10": { label: "8月10日 (一)", rooms: {} },
  "2025-08-11": { label: "8月11日 (二)", rooms: {} },
  "2025-08-12": { label: "8月12日 (三)", rooms: {} },
  "2025-08-13": { label: "8月13日 (四)", rooms: {} },
  "2025-08-14": { label: "8月14日 (五)", rooms: {
    S105:{t:"Office",p:"行政用"}, S109:{t:"WCY",p:"PEX 急救考試"}, S211:{t:"CYK",p:"派書"},
  } },
};

// 額外的手動保留 (日期 -> 房號陣列)
export const manualReservations = {
  "2025-07-20": ["S106"],
  "2025-08-10": ["S105", "S109", "S211"],
  "2025-08-11": ["S105", "S109", "S211"],
  "2025-08-12": ["S105", "S109", "S211"],
  "2025-08-13": ["S105", "S109", "S211"],
  "2025-08-14": [], // Aug 14 has specific occupancy records
};

export const dateList = Object.keys(occupancy);
