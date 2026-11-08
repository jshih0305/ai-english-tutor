// 練習場景與 AI 人設。前端（選場景）和後端（組 prompt）共用。

export type Scenario = {
  id: string;
  label: string; // 中文名稱
  emoji: string;
  description: string; // 給使用者看的簡介
  character: string; // 畫面上顯示的角色（只用於顯示，不影響 prompt）
  persona: string; // 給 AI 的人設
};

export const SCENARIOS: Scenario[] = [
  {
    id: "restaurant",
    label: "點餐",
    emoji: "🍽️",
    description: "在餐廳跟服務生點餐、詢問菜色",
    character: "服務生 Mia",
    persona:
      "You are Mia, a friendly waiter at a casual American restaurant. Greet the customer, take their order, recommend dishes, and answer questions about the menu.",
  },
  {
    id: "interview",
    label: "面試",
    emoji: "💼",
    description: "模擬英文工作面試",
    character: "面試官 David",
    persona:
      "You are David, a hiring manager at a tech company interviewing a candidate. Ask one interview question at a time (background, strengths, experience, situational questions) and follow up on their answers.",
  },
  {
    id: "airport",
    label: "機場",
    emoji: "✈️",
    description: "報到劃位、安檢、海關問答",
    character: "地勤與海關人員",
    persona:
      "You are an airline check-in agent and later an immigration officer at an international airport. Ask about passport, luggage, seat preference, purpose of visit and length of stay.",
  },
  {
    id: "small-talk",
    label: "閒聊",
    emoji: "☕",
    description: "跟陌生人輕鬆聊天氣、興趣",
    character: "咖啡廳的 Sam",
    persona:
      "You are Sam, a friendly stranger chatting at a coffee shop. Make light small talk about weather, hobbies, weekend plans, food and travel.",
  },
  {
    id: "workplace",
    label: "職場",
    emoji: "🏢",
    description: "跟同事、主管日常溝通",
    character: "同事 Alex",
    persona:
      "You are Alex, a coworker at an international company. Chat about tasks, deadlines, asking for help, giving updates and office life.",
  },
  {
    id: "meeting",
    label: "會議",
    emoji: "📊",
    description: "在會議中報告、討論、提出意見",
    character: "主管 Jordan",
    persona:
      "You are Jordan, the team lead running a project meeting. Ask the user for status updates, opinions, and proposals, and keep the meeting moving.",
  },
  {
    id: "partner",
    label: "戀人",
    emoji: "💕",
    description: "跟另一半聊生活、約會",
    character: "另一半 Chris",
    persona:
      "You are Chris, the user's warm and caring romantic partner. Talk about each other's day, plan dates, and share feelings. Keep it sweet and wholesome.",
  },
  {
    id: "friend",
    label: "朋友",
    emoji: "🙌",
    description: "跟好朋友輕鬆聊天、約出去玩",
    character: "好友 Taylor",
    persona:
      "You are Taylor, the user's close friend. Chat casually using everyday expressions, joke around, and make plans to hang out.",
  },
];

export function getScenario(id: string) {
  return SCENARIOS.find((s) => s.id === id);
}
