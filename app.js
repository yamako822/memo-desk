import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";
import { feedbackConfig, isFeedbackConfigured } from "./feedback-config.js";

const FIREBASE_VERSION = "11.6.0";
const LEGACY_STORAGE_KEY = "memo-desk-notes";
const DISPLAY_SETTINGS_KEY = "memo-desk-display-settings";
const SORT_SETTING_KEY = "memo-desk-sort-setting";
const LOCAL_MODE_KEY = "memo-desk-local-mode";
const LOCAL_ENTRY_KEY = "memo-desk-local-entry";
const LOCAL_MEMOS_KEY = "memo-desk-local-memos";
const LOCAL_DISPLAY_NAME_KEY = "memo-desk-local-display-name";
const DRAFT_KEY = "memo-desk-draft";
const CUSTOM_COLORS_KEY = "memo-desk-custom-colors";
const LAYOUT_SETTING_KEY = "memo-desk-layout-setting";
const LAST_OPEN_MEMO_KEY = "memo-desk-last-open-memo";
const OUTLOOK_REMINDER_SETTING_KEY = "memo-desk-outlook-reminder-minutes";

const loginScreen = document.querySelector("#loginScreen");
const appScreen = document.querySelector("#appScreen");
const appLoading = document.querySelector("#appLoading");
const googleLoginButton = document.querySelector("#googleLoginButton");
const emailAuthForm = document.querySelector("#emailAuthForm");
const emailInput = document.querySelector("#emailInput");
const passwordInput = document.querySelector("#passwordInput");
const emailSubmitButton = document.querySelector("#emailSubmitButton");
const emailSignInTab = document.querySelector("#emailSignInTab");
const emailSignUpTab = document.querySelector("#emailSignUpTab");
const localModeButton = document.querySelector("#localModeButton");
const loginHint = document.querySelector("#loginHint");
const loginError = document.querySelector("#loginError");
const userGreeting = document.querySelector("#userGreeting");
const usernameForm = document.querySelector("#usernameForm");
const usernameInput = document.querySelector("#usernameInput");
const usernameSaveButton = document.querySelector("#usernameSaveButton");
const feedbackButton = document.querySelector("#feedbackButton");
const logoutButton = document.querySelector("#logoutButton");

const form = document.querySelector("#memoForm");
const titleInput = document.querySelector("#memoTitle");
const bodyInput = document.querySelector("#memoBody");
const tagsInput = document.querySelector("#memoTags");
const tagSuggestList = document.querySelector("#tagSuggestList");
const reminderInput = document.querySelector("#memoReminder");
const autoTagButton = document.querySelector("#autoTagButton");
const autoTagStatus = document.querySelector("#autoTagStatus");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const memoList = document.querySelector("#memoList");
const memoCount = document.querySelector("#memoCount");
const tagFilterButton = document.querySelector("#tagFilterButton");
const tagFilterDialog = document.querySelector("#tagFilterDialog");
const tagFilterDialogCloseButton = document.querySelector("#tagFilterDialogCloseButton");
const tagFilterStatus = document.querySelector("#tagFilterStatus");
const tagFilter = document.querySelector("#tagFilter");
const pagination = document.querySelector("#pagination");
const favoriteFilterButton = document.querySelector("#favoriteFilterButton");
const darkModeToggle = document.querySelector("#darkModeToggle");
const brightnessInput = document.querySelector("#brightnessInput");
const brightnessValue = document.querySelector("#brightnessValue");
const clearButton = document.querySelector("#clearButton");
const saveButton = document.querySelector("#saveButton");
const formError = document.querySelector("#formError");
const template = document.querySelector("#memoTemplate");
const memoDialog = document.querySelector("#memoDialog");
const memoDialogTitle = document.querySelector("#memoDialogTitle");
const memoDialogTime = document.querySelector("#memoDialogTime");
const memoDialogBody = document.querySelector("#memoDialogBody");
const memoDialogTags = document.querySelector("#memoDialogTags");
const memoDialogReminder = document.querySelector("#memoDialogReminder");
const memoDialogCloseButton = document.querySelector("#memoDialogCloseButton");
const memoDialogPinButton = document.querySelector("#memoDialogPinButton");
const memoDialogFavoriteButton = document.querySelector("#memoDialogFavoriteButton");
const memoDialogEditButton = document.querySelector("#memoDialogEditButton");
const memoDialogDeleteButton = document.querySelector("#memoDialogDeleteButton");
const memoDialogOutlookButton = document.querySelector("#memoDialogOutlookButton");
const settingsButton = document.querySelector("#settingsButton");
const settingsDialog = document.querySelector("#settingsDialog");
const settingsDialogCloseButton = document.querySelector("#settingsDialogCloseButton");
const outlookReminderSelect = document.querySelector("#outlookReminderSelect");
const autoSaveToggle = document.querySelector("#autoSaveToggle");
const settingsClearLocalButton = document.querySelector("#settingsClearLocalButton");
const brightnessResetButton = document.querySelector("#brightnessResetButton");
const accentColorInput = document.querySelector("#accentColorInput");
const bgColorInput = document.querySelector("#bgColorInput");
const textColorInput = document.querySelector("#textColorInput");
const cardBgColorInput = document.querySelector("#cardBgColorInput");
const colorResetButton = document.querySelector("#colorResetButton");
const layoutGridRadio = document.querySelector("#layoutGridRadio");
const layoutListRadio = document.querySelector("#layoutListRadio");
const helpButton = document.querySelector("#helpButton");
const helpPanel = document.querySelector("#helpPanel");
const newMemoButton = document.querySelector("#newMemoButton");
const confirmDialog = document.querySelector("#confirmDialog");
const confirmCancel = document.querySelector("#confirmCancel");
const confirmOk = document.querySelector("#confirmOk");
const confirmDialogMessage = document.querySelector('#confirmDialogMessage');

const isLoginPage = Boolean(loginScreen);
const isMemoPage = Boolean(appScreen);
const MEMOS_PER_PAGE = 8;
const TITLE_MAX_LENGTH = 120;
const BODY_MAX_LENGTH = 10000;
const TAG_MAX_COUNT = 10;
const TAG_MAX_LENGTH = 24;
const AUTO_TAG_LIMIT = 5;
const OUTLOOK_EVENT_DURATION_MINUTES = 30;
const DEFAULT_OUTLOOK_REMINDER_MINUTES = 15;
const OUTLOOK_REMINDER_OPTIONS = new Set([0, 5, 15, 30, 60, 1440]);
const ICS_LINE_BYTE_LIMIT = 72;
const DEFAULT_SORT_MODE = "updatedDesc";
const SORT_MODES = new Set(["updatedDesc", "updatedAsc", "titleAsc", "titleDesc"]);
const DEFAULT_LIGHT_COLORS = {
  accent: "#0f766e",
  bg: "#f7f5f0",
  text: "#202124",
  cardBg: "#fffefb",
};
const DEFAULT_DARK_COLORS = {
  accent: "#4cc9b8",
  bg: "#111715",
  text: "#eef3f1",
  cardBg: "#17211e",
};
const AUTO_TAG_DICTIONARY = [
  { tag: "仕事", keywords: ["仕事", "業務", "会議", "打合せ", "打ち合わせ", "mtg", "見積", "依頼", "タスク", "todo", "締切", "顧客", "案件"] },
  { tag: "アイデア", keywords: ["アイデア", "案", "企画", "発想", "改善", "ネタ", "試したい"] },
  { tag: "勉強", keywords: ["勉強", "学習", "講座", "資格", "復習", "読書", "教材"] },
  { tag: "買い物", keywords: ["買い物", "購入", "注文", "欲しい", "ストア", "スーパー"] },
  { tag: "予定", keywords: ["予定", "予約", "日程", "カレンダー", "イベント", "アポ"] },
  { tag: "重要", keywords: ["重要", "至急", "急ぎ", "優先", "忘れない", "要確認"] },
  { tag: "開発", keywords: ["開発", "コード", "実装", "バグ", "テスト", "deploy", "api", "css", "html", "javascript"] },
  { tag: "デザイン", keywords: ["デザイン", "配色", "レイアウト", "ui", "ux", "画面"] },
  { tag: "資料", keywords: ["資料", "ドキュメント", "議事録", "メモ", "まとめ", "共有"] },
  { tag: "メール", keywords: ["メール", "返信", "送信", "連絡", "問い合わせ"] },
  { tag: "健康", keywords: ["健康", "病院", "薬", "運動", "睡眠", "体調"] },
  { tag: "旅行", keywords: ["旅行", "出張", "ホテル", "航空券", "移動", "旅程"] },
];
const AUTO_TAG_STOP_WORDS = new Set([
  "する",
  "した",
  "して",
  "です",
  "ます",
  "これ",
  "それ",
  "ため",
  "こと",
  "もの",
  "メモ",
  "memo",
  "the",
  "and",
  "for",
  "with",
  "from",
]);

let auth = null;
let db = null;
let initializeApp = null;
let createUserWithEmailAndPassword = null;
let getAuth = null;
let GoogleAuthProvider = null;
let onAuthStateChanged = null;
let signInWithEmailAndPassword = null;
let signInWithPopup = null;
let signOut = null;
let updateProfile = null;
let collection = null;
let deleteDoc = null;
let doc = null;
let getDocs = null;
let getFirestore = null;
let onSnapshot = null;
let orderBy = null;
let query = null;
let setDoc = null;
let writeBatch = null;
let currentUser = null;
let unsubscribeMemos = null;
let memos = [];
let dataMode = "cloud";
let editingId = null;
let activeTag = "all";
let emailAuthMode = "signin";
let showFavoritesOnly = false;
let openMemoId = null;
let currentPage = 1;
let sortMode = readSortMode();
let hasTriedRestoreOpenMemo = false;

function readDisplaySettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(DISPLAY_SETTINGS_KEY));
    return {
      dark: Boolean(saved?.dark),
      brightness: Number(saved?.brightness) || 100,
    };
  } catch {
    return { dark: false, brightness: 100 };
  }
}

function readCustomColors() {
  try {
    const saved = JSON.parse(localStorage.getItem(CUSTOM_COLORS_KEY));
    return {
      accent: saved?.accent || DEFAULT_LIGHT_COLORS.accent,
      bg: saved?.bg || DEFAULT_LIGHT_COLORS.bg,
      text: saved?.text || DEFAULT_LIGHT_COLORS.text,
      cardBg: saved?.cardBg || DEFAULT_LIGHT_COLORS.cardBg,
    };
  } catch {
    return { ...DEFAULT_LIGHT_COLORS };
  }
}

function saveCustomColors(colors) {
  try {
    localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(colors));
  } catch {}
}

function applyCustomColors(colors) {
  const root = document.documentElement;
  const resolvedColors = displaySettings.dark ? DEFAULT_DARK_COLORS : colors;
  root.style.setProperty("--accent", resolvedColors.accent);
  root.style.setProperty("--bg", resolvedColors.bg);
  root.style.setProperty("--text", resolvedColors.text);
  root.style.setProperty("--card-bg", resolvedColors.cardBg);
  if (accentColorInput) accentColorInput.value = colors.accent;
  if (bgColorInput) bgColorInput.value = colors.bg;
  if (textColorInput) textColorInput.value = colors.text;
  if (cardBgColorInput) cardBgColorInput.value = colors.cardBg;
}

function getPopularTags() {
  const tagCounts = {};
  memos.forEach((memo) => {
    let tags = [];
    if (Array.isArray(memo.tags)) {
      tags = memo.tags;
    } else if (typeof memo.tags === 'string') {
      tags = memo.tags.split(",").map((t) => t.trim()).filter((t) => t);
    }
    tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag);
}

function showTagSuggestions() {
  if (!tagSuggestList || !tagsInput) return;
  const currentTags = tagsInput.value.split(",").map((t) => t.trim()).filter((t) => t);
  const lastTag = currentTags[currentTags.length - 1] || "";
  const popularTags = getPopularTags();
  const filtered = popularTags.filter(
    (tag) => tag.toLowerCase().includes(lastTag.toLowerCase()) && !currentTags.includes(tag)
  );
  tagSuggestList.innerHTML = "";
  if (filtered.length > 0) {
    filtered.forEach((tag) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = tag;
      btn.style.cssText = "display:block;width:100%;padding:8px 12px;text-align:left;border:none;background:transparent;cursor:pointer;color:var(--text);border-bottom:1px solid var(--soft);font-size:14px;";
      btn.addEventListener("mouseover", () => {
        btn.style.background = "var(--soft)";
      });
      btn.addEventListener("mouseout", () => {
        btn.style.background = "transparent";
      });
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const tags = tagsInput.value.split(",").map((t) => t.trim()).filter((t) => t);
        tags[tags.length - 1] = tag;
        tagsInput.value = tags.join(", ") + ", ";
        tagsInput.focus();
        showTagSuggestions();
      });
      tagSuggestList.appendChild(btn);
    });
    tagSuggestList.style.display = filtered.length > 0 ? "block" : "none";
  } else {
    tagSuggestList.style.display = "none";
  }
}

function hideTagSuggestions() {
  if (tagSuggestList) tagSuggestList.style.display = "none";
}

function hideAutoTagStatus() {
  if (!autoTagStatus) return;
  autoTagStatus.hidden = true;
  autoTagStatus.textContent = "";
}

function showAutoTagStatus(message) {
  if (!autoTagStatus) return;
  autoTagStatus.textContent = message;
  autoTagStatus.hidden = false;
}

function cleanAutoTag(tag) {
  return String(tag || "")
    .trim()
    .replace(/^[#＃]+/, "")
    .replace(/\s+/g, " ");
}

function addAutoTagScore(scores, tag, score) {
  const cleaned = cleanAutoTag(tag);
  const lower = cleaned.toLowerCase();
  if (
    !cleaned ||
    cleaned.length < 2 ||
    cleaned.length > TAG_MAX_LENGTH ||
    AUTO_TAG_STOP_WORDS.has(lower)
  ) {
    return;
  }

  scores.set(cleaned, (scores.get(cleaned) || 0) + score);
}

function generateAutoTags(title, body) {
  const source = `${title || ""}\n${body || ""}`.trim();
  if (!source) return [];

  const lowerSource = source.toLowerCase();
  const scores = new Map();

  getPopularTags().forEach((tag, index) => {
    if (lowerSource.includes(tag.toLowerCase())) {
      addAutoTagScore(scores, tag, 42 - index);
    }
  });

  AUTO_TAG_DICTIONARY.forEach(({ tag, keywords }) => {
    const matched = keywords.some((keyword) => lowerSource.includes(keyword.toLowerCase()));
    if (matched) addAutoTagScore(scores, tag, 30);
  });

  const hashTags = [...source.matchAll(/[#＃]([\p{L}\p{N}_-]{2,24})/gu)].map((match) => match[1]);
  hashTags.forEach((tag) => addAutoTagScore(scores, tag, 36));

  source
    .split(/[\s,、。．，.!?！？:：;；()[\]{}<>「」『』【】《》\/\\|]+/u)
    .map((token) => token.trim())
    .filter(Boolean)
    .forEach((token) => {
      const inTitle = title?.toLowerCase().includes(token.toLowerCase());
      addAutoTagScore(scores, token, inTitle ? 12 : 5);
    });

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja-JP"))
    .slice(0, AUTO_TAG_LIMIT)
    .map(([tag]) => tag);
}

function applyAutoTags({ silent = false, onlyWhenEmpty = false } = {}) {
  if (!tagsInput) return [];

  const existingTags = parseTags(tagsInput.value);
  if (onlyWhenEmpty && existingTags.length > 0) return existingTags;

  const generatedTags = generateAutoTags(titleInput.value, bodyInput.value);
  const mergedTags = [...existingTags];

  generatedTags.forEach((tag) => {
    const exists = mergedTags.some((item) => item.toLowerCase() === tag.toLowerCase());
    if (!exists && mergedTags.length < TAG_MAX_COUNT) mergedTags.push(tag);
  });

  if (mergedTags.length > existingTags.length) {
    tagsInput.value = mergedTags.join(", ");
    if (!silent) showAutoTagStatus(`${mergedTags.length - existingTags.length}件のタグを追加しました。`);
  } else if (!silent) {
    showAutoTagStatus("追加できるタグ候補が見つかりませんでした。");
  }

  showTagSuggestions();
  return mergedTags;
}

function readLayoutSetting() {
  const saved = localStorage.getItem(LAYOUT_SETTING_KEY);
  return (saved === "list") ? "list" : "grid";
}

function saveLayoutSetting(layout) {
  try {
    localStorage.setItem(LAYOUT_SETTING_KEY, layout);
  } catch {}
}

function applyLayoutSetting(layout) {
  if (memoList) {
    memoList.classList.toggle("list-view", layout === "list");
  }
  if (layoutGridRadio) layoutGridRadio.checked = layout === "grid";
  if (layoutListRadio) layoutListRadio.checked = layout === "list";
}

function padDatePart(value) {
  return String(value).padStart(2, "0");
}

function toReminderDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  if (typeof value === "object") {
    if (typeof value.toDate === "function") {
      const date = value.toDate();
      return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
    }

    const seconds = value.seconds ?? value._seconds;
    if (Number.isFinite(seconds)) {
      const milliseconds = seconds * 1000 + Math.floor((value.nanoseconds ?? value._nanoseconds ?? 0) / 1000000);
      const date = new Date(milliseconds);
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeReminderAt(value) {
  const date = toReminderDate(value);
  if (!date) return "";
  return date.toISOString();
}

function toDatetimeLocalValue(value) {
  const date = toReminderDate(value);
  if (!date) return "";
  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-") + `T${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
}

function formatReminderDate(value) {
  const date = toReminderDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getReminderState(value) {
  const date = toReminderDate(value);
  if (!date) return "";
  return date.getTime() < Date.now() ? "due" : "upcoming";
}

function readOutlookReminderMinutes() {
  const raw = localStorage.getItem(OUTLOOK_REMINDER_SETTING_KEY);
  if (raw === null) return DEFAULT_OUTLOOK_REMINDER_MINUTES;
  const saved = Number(raw);
  return OUTLOOK_REMINDER_OPTIONS.has(saved) ? saved : DEFAULT_OUTLOOK_REMINDER_MINUTES;
}

function saveOutlookReminderMinutes(minutes) {
  localStorage.setItem(OUTLOOK_REMINDER_SETTING_KEY, String(minutes));
}

function applyOutlookReminderSetting(minutes) {
  outlookReminderMinutes = OUTLOOK_REMINDER_OPTIONS.has(minutes)
    ? minutes
    : DEFAULT_OUTLOOK_REMINDER_MINUTES;
  if (outlookReminderSelect) outlookReminderSelect.value = String(outlookReminderMinutes);
}

function formatIcsDate(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcsText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldIcsLine(line) {
  if (typeof TextEncoder === "undefined") return line;

  const encoder = new TextEncoder();
  const chunks = [];
  let current = "";
  let currentBytes = 0;

  for (const char of line) {
    const charBytes = encoder.encode(char).length;
    if (current && currentBytes + charBytes > ICS_LINE_BYTE_LIMIT) {
      chunks.push(current);
      current = char;
      currentBytes = charBytes;
    } else {
      current += char;
      currentBytes += charBytes;
    }
  }

  if (current) chunks.push(current);
  return chunks.map((chunk, index) => (index === 0 ? chunk : ` ${chunk}`)).join("\r\n");
}

function formatIcsTrigger(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return "PT0M";
  if (minutes % 1440 === 0) return `-P${minutes / 1440}D`;
  if (minutes % 60 === 0) return `-PT${minutes / 60}H`;
  return `-PT${minutes}M`;
}

function sanitizeFileName(value) {
  const cleaned = String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 60);
  return cleaned || "memo-reminder";
}

function buildOutlookIcs(memo) {
  const start = toReminderDate(memo?.reminderAt);
  if (!start) return "";

  const end = new Date(start.getTime() + OUTLOOK_EVENT_DURATION_MINUTES * 60 * 1000);
  const title = memo.title?.trim() || "Memo Desk リマインダー";
  const description = [
    memo.body?.trim(),
    memo.tags?.length ? `タグ: ${memo.tags.join(", ")}` : "",
  ].filter(Boolean).join("\n\n") || title;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Memo Desk//Memo Reminder//JA",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:memo-desk-${memo.id || crypto.randomUUID()}@memo-desk.local`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
  ];

  if (memo.tags?.length) {
    lines.push(`CATEGORIES:${memo.tags.map(escapeIcsText).join(",")}`);
  }

  lines.push(
    "BEGIN:VALARM",
    `TRIGGER:${formatIcsTrigger(outlookReminderMinutes)}`,
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcsText(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  );

  return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
}

function downloadOutlookIcs(memo) {
  const content = buildOutlookIcs(memo);
  if (!content) return;

  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFileName(memo.title)}.ics`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function rememberOpenMemo(id) {
  if (!id || !currentUser) return;
  try {
    localStorage.setItem(
      LAST_OPEN_MEMO_KEY,
      JSON.stringify({
        id,
        dataMode,
        uid: currentUser.uid,
        openedAt: new Date().toISOString(),
      }),
    );
  } catch {}
}

function clearRememberedOpenMemo(id = null) {
  try {
    if (!id) {
      localStorage.removeItem(LAST_OPEN_MEMO_KEY);
      return;
    }

    const saved = JSON.parse(localStorage.getItem(LAST_OPEN_MEMO_KEY));
    if (saved?.id === id) localStorage.removeItem(LAST_OPEN_MEMO_KEY);
  } catch {
    localStorage.removeItem(LAST_OPEN_MEMO_KEY);
  }
}

function resetOpenMemoRestore() {
  hasTriedRestoreOpenMemo = false;
}

function restoreLastOpenMemoIfNeeded() {
  if (hasTriedRestoreOpenMemo || appLoading?.hidden === false || !currentUser) return;
  hasTriedRestoreOpenMemo = true;
  if (editingId || titleInput.value.trim() || bodyInput.value.trim() || tagsInput.value.trim()) return;

  try {
    const saved = JSON.parse(localStorage.getItem(LAST_OPEN_MEMO_KEY));
    if (!saved?.id) return;

    const isSameScope = saved.dataMode === dataMode && saved.uid === currentUser.uid;
    if (!isSameScope) {
      localStorage.removeItem(LAST_OPEN_MEMO_KEY);
      return;
    }

    const memo = memos.find((item) => item.id === saved.id);
    if (!memo) {
      localStorage.removeItem(LAST_OPEN_MEMO_KEY);
      return;
    }

    openMemoDialog(memo.id);
  } catch {
    localStorage.removeItem(LAST_OPEN_MEMO_KEY);
  }
}

let displaySettings = readDisplaySettings();
let customColors = readCustomColors();
let layoutSetting = readLayoutSetting();
let outlookReminderMinutes = readOutlookReminderMinutes();
let autoSaveIntervalId = null;
let autoSaveDebounceTimer = null;
let draftInputHandler = null;
let confirmAction = null;
let pendingDeleteMemoId = null;

async function loadFirebaseModules() {
  if (initializeApp) return;

  const [appModule, authModule, firestoreModule] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`),
  ]);

  ({ initializeApp } = appModule);
  ({
    createUserWithEmailAndPassword,
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
  } = authModule);
  ({
    collection,
    deleteDoc,
    doc,
    getDocs,
    getFirestore,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    writeBatch,
  } = firestoreModule);
}

function pageUrl(fileName) {
  const url = new URL(window.location.href);
  url.pathname = url.pathname.replace(/[^/]*$/, fileName);
  url.search = "";
  url.hash = "";
  return url.href;
}

function goToLogin() {
  window.location.replace(pageUrl("index.html"));
}

function goToLocalStart() {
  window.location.replace(pageUrl("local.html"));
}

function goToMemos() {
  window.location.replace(pageUrl("memo.html"));
}

function isLocalModeEnabled() {
  return localStorage.getItem(LOCAL_MODE_KEY) === "true";
}

function enableLocalMode() {
  localStorage.setItem(LOCAL_MODE_KEY, "true");
}

function disableLocalMode() {
  localStorage.removeItem(LOCAL_MODE_KEY);
}

function useLocalOnlyEntry() {
  return localStorage.getItem(LOCAL_ENTRY_KEY) === "true";
}

function disableLocalOnlyEntry() {
  localStorage.removeItem(LOCAL_ENTRY_KEY);
}

function memosCollectionRef(uid) {
  return collection(db, "users", uid, "memos");
}

function memoDocRef(uid, memoId) {
  return doc(db, "users", uid, "memos", memoId);
}

function showLoginError(message) {
  if (!loginError) return;
  loginError.textContent = message;
  loginError.hidden = !message;
}

function clearLoginError() {
  showLoginError("");
}

function showFormError(message) {
  if (!formError) return;
  formError.textContent = message;
  formError.hidden = !message;
}

function clearFormError() {
  showFormError("");
}

function setAuthLoading(isLoading) {
  if (!isLoginPage) return;
  googleLoginButton.disabled = isLoading;
  emailSubmitButton.disabled = isLoading;
  emailSignInTab.disabled = isLoading;
  emailSignUpTab.disabled = isLoading;
  loginHint.hidden = !isLoading;
}

function setAppLoading(isLoading) {
  if (appLoading) appLoading.hidden = !isLoading;
}

function setUsernameSaving(isSaving) {
  if (!isMemoPage) return;
  usernameInput.disabled = isSaving;
  usernameSaveButton.disabled = isSaving;
}

function normalizeMemo(data, fallbackId = crypto.randomUUID()) {
  return {
    id: data?.id || fallbackId,
    title: data?.title ?? "",
    body: data?.body ?? "",
    tags: Array.isArray(data?.tags) ? data.tags : [],
    reminderAt: normalizeReminderAt(data?.reminderAt),
    updatedAt: data?.updatedAt ?? new Date().toISOString(),
    favorite: Boolean(data?.favorite),
    pinned: Boolean(data?.pinned),
  };
}

function sortMemos(items) {
  return [...items].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function readSortMode() {
  const saved = localStorage.getItem(SORT_SETTING_KEY);
  return SORT_MODES.has(saved) ? saved : DEFAULT_SORT_MODE;
}

function saveSortMode() {
  localStorage.setItem(SORT_SETTING_KEY, sortMode);
}

function compareTitle(a, b) {
  return a.title.localeCompare(b.title, "ja-JP", { numeric: true, sensitivity: "base" });
}

function compareUpdatedAt(a, b) {
  return new Date(a.updatedAt) - new Date(b.updatedAt);
}

function sortVisibleMemos(items) {
  return [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;

    if (sortMode === "updatedAsc") return compareUpdatedAt(a, b);
    if (sortMode === "titleAsc") return compareTitle(a, b) || compareUpdatedAt(b, a);
    if (sortMode === "titleDesc") return compareTitle(b, a) || compareUpdatedAt(b, a);
    return compareUpdatedAt(b, a);
  });
}

function readJsonArray(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function loadLocalMemos() {
  const savedMemos = readJsonArray(LOCAL_MEMOS_KEY);
  if (savedMemos.length > 0) {
    return sortMemos(savedMemos.map((memo) => normalizeMemo(memo)));
  }

  const legacyMemos = readJsonArray(LEGACY_STORAGE_KEY);
  if (legacyMemos.length > 0) {
    const normalized = sortMemos(legacyMemos.map((memo) => normalizeMemo(memo)));
    localStorage.setItem(LOCAL_MEMOS_KEY, JSON.stringify(normalized));
    return normalized;
  }

  return [];
}

function saveLocalMemos() {
  localStorage.setItem(LOCAL_MEMOS_KEY, JSON.stringify(sortMemos(memos)));
}

function showLogin() {
  stopMemoSubscription();
  currentUser = null;
  memos = [];
  if (loginScreen) loginScreen.hidden = false;
  clearLoginError();
  setAuthLoading(false);
  googleLoginButton?.focus();
}

function getDisplayName(user) {
  return user.displayName || user.email?.split("@")[0] || "ユーザー";
}

function updateUserDisplay(user) {
  if (!isMemoPage) return;
  const displayName = getDisplayName(user);
  userGreeting.textContent = `${displayName}さん`;
  usernameInput.value = displayName;
}

function normalizeBrightness(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 100;
  return Math.min(120, Math.max(80, number));
}

function saveDisplaySettings() {
  localStorage.setItem(DISPLAY_SETTINGS_KEY, JSON.stringify(displaySettings));
}

function applyDisplaySettings() {
  if (!isMemoPage) return;

  displaySettings = {
    dark: Boolean(displaySettings.dark),
    brightness: normalizeBrightness(displaySettings.brightness),
  };

  document.documentElement.dataset.theme = displaySettings.dark ? "dark" : "light";
  document.documentElement.style.setProperty("--app-brightness", `${displaySettings.brightness}%`);
  darkModeToggle.checked = displaySettings.dark;
  brightnessInput.value = String(displaySettings.brightness);
  brightnessValue.textContent = `${displaySettings.brightness}%`;
  applyCustomColors(customColors);
}

function stopMemoSubscription() {
  if (unsubscribeMemos) {
    unsubscribeMemos();
    unsubscribeMemos = null;
  }
}

function startMemoSubscription(user) {
  stopMemoSubscription();

  const q = query(memosCollectionRef(user.uid), orderBy("updatedAt", "desc"));

  unsubscribeMemos = onSnapshot(
    q,
    (snapshot) => {
      memos = snapshot.docs.map((document) => {
        const data = document.data();
        return {
          id: document.id,
          title: data.title ?? "",
          body: data.body ?? "",
          tags: Array.isArray(data.tags) ? data.tags : [],
          reminderAt: normalizeReminderAt(data.reminderAt),
          updatedAt: data.updatedAt ?? new Date().toISOString(),
          favorite: Boolean(data.favorite),
          pinned: Boolean(data.pinned),
        };
      });
      setAppLoading(false);
      render();
    },
    (error) => {
      console.error(error);
      setAppLoading(false);
      showFormError("メモの読み込みに失敗しました。Firestore の設定を確認してください。");
    },
  );
}

async function migrateLocalMemosIfNeeded(uid) {
  const keys = [LEGACY_STORAGE_KEY, `memo-desk-notes-${uid}`];
  let localMemos = [];

  for (const key of keys) {
    const saved = localStorage.getItem(key);
    if (!saved) continue;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        localMemos = parsed;
        break;
      }
    } catch {
      // ignore
    }
  }

  if (localMemos.length === 0) return;

  const existing = await getDocs(memosCollectionRef(uid));
  if (!existing.empty) return;

  const batch = writeBatch(db);
  localMemos.forEach((memo) => {
    const id = memo.id || crypto.randomUUID();
    batch.set(memoDocRef(uid, id), {
      title: memo.title ?? "",
      body: memo.body ?? "",
      tags: Array.isArray(memo.tags) ? memo.tags : [],
      reminderAt: normalizeReminderAt(memo.reminderAt),
      updatedAt: memo.updatedAt ?? new Date().toISOString(),
      favorite: Boolean(memo.favorite),
      pinned: Boolean(memo.pinned),
    });
  });
  await batch.commit();
}

async function enterApp(user) {
  dataMode = "cloud";
  currentUser = user;
  if (appScreen) appScreen.hidden = false;
  updateUserDisplay(user);
  editingId = null;
  activeTag = "all";
  showFavoritesOnly = false;
  resetOpenMemoRestore();
  resetPagination();
  searchInput.value = "";
  setAppLoading(true);
  clearFormError();
  resetForm();

  try {
    await migrateLocalMemosIfNeeded(user.uid);
    startMemoSubscription(user);
  } catch (error) {
    console.error(error);
    setAppLoading(false);
    showFormError("メモの準備に失敗しました。");
  }
}

function enterLocalApp() {
  dataMode = "local";
  currentUser = {
    uid: "local",
    displayName: localStorage.getItem(LOCAL_DISPLAY_NAME_KEY) || "ローカル",
  };
  if (appScreen) appScreen.hidden = false;
  updateUserDisplay(currentUser);
  if (logoutButton) logoutButton.textContent = useLocalOnlyEntry() ? "ログイン画面に戻る" : "モード選択へ";
  editingId = null;
  activeTag = "all";
  showFavoritesOnly = false;
  resetOpenMemoRestore();
  resetPagination();
  searchInput.value = "";
  memos = loadLocalMemos();
  setAppLoading(false);
  clearFormError();
  resetForm();
  render();
}

async function logout() {
  stopMemoSubscription();
  if (dataMode === "cloud" && auth) await signOut(auth);
  const shouldReturnToLocalStart = dataMode === "local" && useLocalOnlyEntry();
  if (dataMode === "local") disableLocalMode();
  memos = [];
  dataMode = "cloud";
  editingId = null;
  activeTag = "all";
  showFavoritesOnly = false;
  openMemoId = null;
  resetPagination();
  if (shouldReturnToLocalStart) {
    goToLocalStart();
    return;
  }
  goToLogin();
}

function openFeedbackForm() {
  if (!isFeedbackConfigured()) {
    showFormError("要望フォームURLが未設定です。FEEDBACK_SETUP.md を参照してください。");
    return;
  }

  window.open(feedbackConfig.formUrl.trim(), "_blank", "noopener,noreferrer");
}

async function updateUsername(event) {
  event.preventDefault();
  if (!currentUser) return;

  const displayName = usernameInput.value.trim().replace(/\s+/g, " ");
  if (!displayName) {
    showFormError("ユーザー名を入力してください。");
    usernameInput.focus();
    return;
  }

  clearFormError();
  setUsernameSaving(true);

  try {
    if (dataMode === "local") {
      localStorage.setItem(LOCAL_DISPLAY_NAME_KEY, displayName);
      currentUser.displayName = displayName;
    } else {
      await updateProfile(currentUser, { displayName });
    }
    updateUserDisplay({ ...currentUser, displayName });
  } catch (error) {
    console.error(error);
    showFormError("ユーザー名の変更に失敗しました。");
  } finally {
    setUsernameSaving(false);
  }
}

function parseAuthError(error) {
  const code = error?.code ?? "";
  const messages = {
    "auth/popup-blocked": "ポップアップがブロックされました。ブラウザで許可してください。",
    "auth/unauthorized-domain": "このドメインは Firebase で許可されていません。",
    "auth/popup-closed-by-user": "ログインがキャンセルされました。",
    "auth/email-already-in-use": "このメールアドレスはすでに登録されています。ログインしてください。",
    "auth/invalid-email": "メールアドレスの形式が正しくありません。",
    "auth/weak-password": "パスワードは6文字以上にしてください。",
    "auth/user-not-found": "アカウントが見つかりません。新規登録してください。",
    "auth/wrong-password": "パスワードが違います。",
    "auth/invalid-credential": "メールアドレスまたはパスワードが正しくありません。",
    "auth/too-many-requests": "試行回数が多すぎます。しばらく待ってから再度お試しください。",
  };

  return messages[code] || error?.message || "ログインに失敗しました。";
}

async function loginWithGoogle() {
  if (!auth) return;

  clearLoginError();
  setAuthLoading(true);

  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (error) {
    showLoginError(parseAuthError(error));
    setAuthLoading(false);
  }
}

async function loginWithEmail(event) {
  event.preventDefault();
  if (!auth) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email) {
    showLoginError("メールアドレスを入力してください。");
    return;
  }

  if (password.length < 6) {
    showLoginError("パスワードは6文字以上にしてください。");
    return;
  }

  clearLoginError();
  setAuthLoading(true);

  try {
    if (emailAuthMode === "signup") {
      await createUserWithEmailAndPassword(auth, email, password);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (error) {
    showLoginError(parseAuthError(error));
    setAuthLoading(false);
  }
}

function setEmailAuthMode(mode) {
  if (!isLoginPage) return;
  emailAuthMode = mode;
  const isSignIn = mode === "signin";
  emailSignInTab.classList.toggle("active", isSignIn);
  emailSignUpTab.classList.toggle("active", !isSignIn);
  emailSignInTab.setAttribute("aria-selected", String(isSignIn));
  emailSignUpTab.setAttribute("aria-selected", String(!isSignIn));
  emailSubmitButton.textContent = isSignIn ? "メールでログイン" : "アカウントを作成";
  passwordInput.autocomplete = isSignIn ? "current-password" : "new-password";
}

function parseTags(text) {
  return text
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function validateMemoInput(title, body, tags) {
  if (!title) {
    return { message: "タイトルを入力してください。", target: titleInput };
  }

  if (title.length > TITLE_MAX_LENGTH) {
    return { message: `タイトルは${TITLE_MAX_LENGTH}文字以内にしてください。`, target: titleInput };
  }

  if (!body) {
    return { message: "本文を入力してください。", target: bodyInput };
  }

  if (body.length > BODY_MAX_LENGTH) {
    return { message: `本文は${BODY_MAX_LENGTH}文字以内にしてください。`, target: bodyInput };
  }

  if (tags.length > TAG_MAX_COUNT) {
    return { message: `タグは${TAG_MAX_COUNT}個以内にしてください。`, target: tagsInput };
  }

  const longTag = tags.find((tag) => tag.length > TAG_MAX_LENGTH);
  if (longTag) {
    return { message: `タグは1つ${TAG_MAX_LENGTH}文字以内にしてください。`, target: tagsInput };
  }

  return null;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getFilteredMemos() {
  const keyword = searchInput.value.trim().toLowerCase();

  return memos.filter((memo) => {
    const matchesKeyword =
      memo.title.toLowerCase().includes(keyword) ||
      memo.body.toLowerCase().includes(keyword) ||
      memo.tags.some((tag) => tag.toLowerCase().includes(keyword)) ||
      formatReminderDate(memo.reminderAt).toLowerCase().includes(keyword);
    const matchesTag = activeTag === "all" || memo.tags.includes(activeTag);
    const matchesFavorite = !showFavoritesOnly || memo.favorite;
    return matchesKeyword && matchesTag && matchesFavorite;
  });
}

function resetPagination() {
  currentPage = 1;
}

function getTotalPages(totalItems) {
  return Math.max(1, Math.ceil(totalItems / MEMOS_PER_PAGE));
}

function renderFavoriteFilter() {
  favoriteFilterButton.classList.toggle("active", showFavoritesOnly);
  favoriteFilterButton.setAttribute("aria-pressed", String(showFavoritesOnly));
}

function renderSortControl() {
  if (sortSelect) sortSelect.value = SORT_MODES.has(sortMode) ? sortMode : DEFAULT_SORT_MODE;
}

function renderPagination(totalItems) {
  const totalPages = getTotalPages(totalItems);
  pagination.innerHTML = "";
  pagination.hidden = totalItems <= MEMOS_PER_PAGE;

  if (pagination.hidden) return;

  const status = document.createElement("span");
  status.className = "pagination-status";
  status.textContent = `${currentPage} / ${totalPages}`;

  const prevButton = document.createElement("button");
  prevButton.type = "button";
  prevButton.className = "secondary";
  prevButton.textContent = "前へ";
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", () => {
    currentPage = Math.max(1, currentPage - 1);
    renderMemos();
  });

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "secondary";
  nextButton.textContent = "次へ";
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener("click", () => {
    currentPage = Math.min(totalPages, currentPage + 1);
    renderMemos();
  });

  pagination.append(prevButton, status, nextButton);
}

function renderTags() {
  const tags = [...new Set(memos.flatMap((memo) => memo.tags))].sort();
  if (activeTag !== "all" && !tags.includes(activeTag)) {
    activeTag = "all";
  }

  tagFilter.innerHTML = "";
  if (tagFilterButton) {
    const label = activeTag === "all" ? "タグ絞り込み" : `タグ: ${activeTag}`;
    tagFilterButton.textContent = label;
    tagFilterButton.classList.toggle("active", activeTag !== "all");
    tagFilterButton.setAttribute("aria-pressed", String(activeTag !== "all"));
  }
  if (tagFilterStatus) {
    tagFilterStatus.textContent =
      activeTag === "all" ? "すべてのメモを表示中" : `「${activeTag}」で絞り込み中`;
  }

  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.textContent = "すべて";
  allButton.classList.toggle("active", activeTag === "all");
  allButton.addEventListener("click", () => {
    activeTag = "all";
    resetPagination();
    render();
    closeTagFilterDialog();
  });
  tagFilter.append(allButton);

  tags.forEach((tag) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = tag;
    button.classList.toggle("active", activeTag === tag);
    button.addEventListener("click", () => {
      activeTag = tag;
      resetPagination();
      render();
      closeTagFilterDialog();
    });
    tagFilter.append(button);
  });
}

function openTagFilterDialog() {
  if (!tagFilterDialog) return;
  tagFilterDialog.hidden = false;
  tagFilterButton?.setAttribute("aria-expanded", "true");
  document.body.classList.add("dialog-open");

  const activeButton = tagFilter.querySelector("button.active");
  activeButton?.focus();
  if (!activeButton) tagFilterDialogCloseButton?.focus();
}

function closeTagFilterDialog() {
  if (!tagFilterDialog || tagFilterDialog.hidden) return;
  tagFilterDialog.hidden = true;
  tagFilterButton?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("dialog-open");
  tagFilterButton?.focus();
}

function renderMemos() {
  const filteredMemos = sortVisibleMemos(getFilteredMemos());
  const totalPages = getTotalPages(filteredMemos.length);
  currentPage = Math.min(currentPage, totalPages);
  const startIndex = (currentPage - 1) * MEMOS_PER_PAGE;
  const pageMemos = filteredMemos.slice(startIndex, startIndex + MEMOS_PER_PAGE);

  memoList.innerHTML = "";
  memoCount.textContent = `${memos.length}件`;
  if (openMemoId) updateMemoDialog(openMemoId);

  if (pageMemos.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = appLoading.hidden === false ? "読み込み中…" : "表示できるメモがありません";
    memoList.append(empty);
    renderPagination(filteredMemos.length);
    return;
  }

  pageMemos.forEach((memo) => {
    const item = template.content.cloneNode(true);
    const card = item.querySelector(".memo-card");
    const title = item.querySelector("h3");
    const time = item.querySelector("time");
    const body = item.querySelector(".memo-body");
    const tags = item.querySelector(".memo-tags");
    const reminder = getOrCreateCardReminder(card);
    const pinButton = item.querySelector(".pin-button");
    const favoriteButton = item.querySelector(".favorite-button");
    const openButton = item.querySelector(".open-button");
    const editButton = item.querySelector(".edit-button");
    const deleteButton = item.querySelector(".delete-button");
    const isFavorite = Boolean(memo.favorite);
    const isPinned = Boolean(memo.pinned);

    title.textContent = memo.title;
    time.textContent = formatDate(memo.updatedAt);
    time.dateTime = memo.updatedAt;
    body.textContent = memo.body;
    const reminderText = formatReminderDate(memo.reminderAt);
    if (reminder) {
      reminder.hidden = !reminderText;
      reminder.textContent = reminderText ? `リマインダー: ${reminderText}` : "";
      reminder.dataset.state = getReminderState(memo.reminderAt);
    }
    card.classList.toggle("is-pinned", isPinned);
    card.classList.toggle("is-favorite", isFavorite);
    pinButton.textContent = isPinned ? "固定中" : "ピン";
    pinButton.setAttribute("aria-pressed", String(isPinned));
    pinButton.setAttribute("aria-label", isPinned ? "ピン留めを外す" : "ピン留めする");
    favoriteButton.textContent = isFavorite ? "★" : "☆";
    favoriteButton.setAttribute("aria-pressed", String(isFavorite));
    favoriteButton.setAttribute("aria-label", isFavorite ? "お気に入りから外す" : "お気に入りに追加");
    tags.innerHTML = "";

    memo.tags.forEach((tag) => {
      const tagItem = document.createElement("span");
      tagItem.textContent = tag;
      tags.append(tagItem);
    });

    openButton.addEventListener("click", () => openMemoDialog(memo.id));
    pinButton.addEventListener("click", () => togglePinnedMemo(memo.id));
    favoriteButton.addEventListener("click", () => toggleFavoriteMemo(memo.id));
    editButton.addEventListener("click", () => startEditing(memo.id));
    deleteButton.addEventListener("click", () => deleteMemo(memo.id));
    card.addEventListener("dblclick", () => openMemoDialog(memo.id));
    memoList.append(card);
  });

  renderPagination(filteredMemos.length);
}

function getOrCreateCardReminder(card) {
  let reminder = card.querySelector(".memo-reminder");
  if (reminder) return reminder;

  reminder = document.createElement("p");
  reminder.className = "memo-reminder";
  reminder.hidden = true;

  const preview = card.querySelector(".memo-preview");
  if (preview) {
    card.insertBefore(reminder, preview);
  } else {
    card.append(reminder);
  }

  return reminder;
}

function render() {
  renderFavoriteFilter();
  renderSortControl();
  renderTags();
  renderMemos();
  restoreLastOpenMemoIfNeeded();
}

function resetForm() {
  form.reset();
  editingId = null;
  saveButton.textContent = "保存する";
  clearFormError();
  hideAutoTagStatus();
  hideTagSuggestions();
  if (!appScreen.hidden && appLoading.hidden) titleInput.focus();
}

function startEditing(id) {
  const memo = memos.find((item) => item.id === id);
  if (!memo) return;

  closeMemoDialog();
  editingId = id;
  titleInput.value = memo.title;
  bodyInput.value = memo.body;
  tagsInput.value = memo.tags.join(", ");
  if (reminderInput) reminderInput.value = toDatetimeLocalValue(memo.reminderAt);
  saveButton.textContent = "更新する";
  titleInput.focus();
}

function renderDialogTags(memo) {
  memoDialogTags.innerHTML = "";

  memo.tags.forEach((tag) => {
    const tagItem = document.createElement("span");
    tagItem.textContent = tag;
    memoDialogTags.append(tagItem);
  });
}

function renderDialogReminder(memo) {
  const reminder = getOrCreateDialogReminder();
  if (!reminder) return;

  const reminderText = formatReminderDate(memo.reminderAt);
  reminder.hidden = !reminderText;
  reminder.textContent = reminderText ? `リマインダー: ${reminderText}` : "";
  reminder.dataset.state = getReminderState(memo.reminderAt);
}

function getOrCreateDialogOutlookButton() {
  if (memoDialogOutlookButton) return memoDialogOutlookButton;
  if (!memoDialog) return null;

  const actions = memoDialog.querySelector(".card-actions");
  if (!actions) return null;

  const existing = actions.querySelector("#memoDialogOutlookButton");
  if (existing) return existing;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary outlook-calendar-button";
  button.id = "memoDialogOutlookButton";
  button.textContent = "Outlook予定に追加";

  const editButton = actions.querySelector("#memoDialogEditButton");
  if (editButton) {
    actions.insertBefore(button, editButton);
  } else {
    actions.append(button);
  }

  return button;
}

function renderDialogOutlookButton(memo) {
  const button = getOrCreateDialogOutlookButton();
  if (!button) return;

  const hasReminder = Boolean(toReminderDate(memo.reminderAt));
  button.disabled = !hasReminder;
  button.title = hasReminder
    ? "通知付きのOutlook予定ファイルを作成します"
    : "リマインダー日時を設定すると予定に追加できます";
}

function getOrCreateDialogReminder() {
  if (memoDialogReminder) return memoDialogReminder;
  if (!memoDialog) return null;

  const panel = memoDialog.querySelector(".memo-dialog-panel");
  if (!panel) return null;

  const existing = panel.querySelector(".memo-dialog-reminder");
  if (existing) return existing;

  const reminder = document.createElement("p");
  reminder.className = "memo-dialog-reminder";
  reminder.id = "memoDialogReminder";
  reminder.hidden = true;

  const tags = panel.querySelector("#memoDialogTags");
  if (tags) {
    panel.insertBefore(reminder, tags);
  } else {
    panel.append(reminder);
  }

  return reminder;
}

function updateMemoDialog(id) {
  if (!memoDialog || memoDialog.hidden) return;

  const memo = memos.find((item) => item.id === id);
  if (!memo) {
    closeMemoDialog();
    return;
  }

  const isFavorite = Boolean(memo.favorite);
  const isPinned = Boolean(memo.pinned);
  memoDialogTitle.textContent = memo.title;
  memoDialogTime.textContent = formatDate(memo.updatedAt);
  memoDialogTime.dateTime = memo.updatedAt;
  memoDialogBody.textContent = memo.body;
  memoDialogPinButton.textContent = isPinned ? "ピン留め解除" : "ピン留め";
  memoDialogPinButton.setAttribute("aria-pressed", String(isPinned));
  memoDialogFavoriteButton.textContent = isFavorite ? "お気に入り解除" : "お気に入り";
  memoDialogFavoriteButton.setAttribute("aria-pressed", String(isFavorite));
  renderDialogTags(memo);
  renderDialogReminder(memo);
  renderDialogOutlookButton(memo);
}

function openMemoDialog(id) {
  if (!memoDialog) return;

  openMemoId = id;
  rememberOpenMemo(id);
  memoDialog.hidden = false;
  document.body.classList.add("dialog-open");
  updateMemoDialog(id);
  memoDialogCloseButton.focus();
}

function closeMemoDialog() {
  if (!memoDialog || memoDialog.hidden) return;

  memoDialog.hidden = true;
  clearRememberedOpenMemo(openMemoId);
  openMemoId = null;
  document.body.classList.remove("dialog-open");
}

async function deleteMemo(id) {
  const memo = memos.find((item) => item.id === id);
  if (!memo || !currentUser) return;

  if (!confirmDialog || !confirmDialogMessage) {
    // fallback to native confirm
    const ok = confirm(`「${memo.title}」を削除しますか？`);
    if (!ok) return;
    try {
      if (dataMode === 'local') {
        memos = memos.filter((item) => item.id !== id);
        saveLocalMemos();
        render();
      } else {
        await deleteDoc(memoDocRef(currentUser.uid, id));
      }
      if (openMemoId === id) closeMemoDialog();
      if (editingId === id) resetForm();
    } catch {
      showFormError('削除に失敗しました。');
    }
    return;
  }

  // open custom confirm dialog
  confirmDialogMessage.textContent = `「${memo.title}」を削除しますか？`;
  confirmAction = async () => {
    try {
      if (dataMode === 'local') {
        memos = memos.filter((item) => item.id !== id);
        saveLocalMemos();
        render();
      } else {
        await deleteDoc(memoDocRef(currentUser.uid, id));
      }
      if (openMemoId === id) closeMemoDialog();
      if (editingId === id) resetForm();
    } catch (e) {
      console.error(e);
      showFormError('削除に失敗しました。');
    }
  };
  pendingDeleteMemoId = id;
  confirmDialog.hidden = false;
  document.body.classList.add('dialog-open');
  confirmCancel?.focus();
}

async function saveMemo(memo) {
  if (!currentUser) return;
  if (dataMode === "local") {
    const index = memos.findIndex((item) => item.id === memo.id);
    if (index >= 0) {
      memos[index] = memo;
    } else {
      memos.push(memo);
    }
    memos = sortMemos(memos);
    saveLocalMemos();
    render();
    return;
  }

  await setDoc(memoDocRef(currentUser.uid, memo.id), {
    title: memo.title,
    body: memo.body,
    tags: memo.tags,
    reminderAt: normalizeReminderAt(memo.reminderAt),
    updatedAt: memo.updatedAt,
    favorite: memo.favorite,
    pinned: memo.pinned,
  });
}

function memoWriteData(memo, changes = {}) {
  return {
    title: memo.title,
    body: memo.body,
    tags: memo.tags,
    reminderAt: normalizeReminderAt(memo.reminderAt),
    updatedAt: memo.updatedAt,
    favorite: Boolean(memo.favorite),
    pinned: Boolean(memo.pinned),
    ...changes,
  };
}

async function togglePinnedMemo(id) {
  const memo = memos.find((item) => item.id === id);
  if (!memo || !currentUser) return;

  try {
    if (dataMode === "local") {
      memo.pinned = !memo.pinned;
      saveLocalMemos();
      render();
    } else {
      await setDoc(
        memoDocRef(currentUser.uid, id),
        memoWriteData(memo, { pinned: !memo.pinned }),
        { merge: true },
      );
    }
  } catch (error) {
    console.error(error);
    showFormError("ピン留めの変更に失敗しました。");
  }
}

async function toggleFavoriteMemo(id) {
  const memo = memos.find((item) => item.id === id);
  if (!memo || !currentUser) return;

  try {
    if (dataMode === "local") {
      memo.favorite = !memo.favorite;
      saveLocalMemos();
      render();
    } else {
      await setDoc(
        memoDocRef(currentUser.uid, id),
        memoWriteData(memo, { favorite: !memo.favorite }),
        { merge: true },
      );
    }
  } catch (error) {
    console.error(error);
    showFormError("お気に入りの変更に失敗しました。");
  }
}

async function initFirebase() {
  if (isLocalModeEnabled()) {
    if (isLoginPage) {
      goToMemos();
    } else {
      enterLocalApp();
    }
    return;
  }

  if (!isFirebaseConfigured()) {
    if (isLoginPage) {
      showLoginError("firebase-config.js が未設定です。FIREBASE_SETUP.md を参照してください。");
      googleLoginButton.disabled = true;
      emailSubmitButton.disabled = true;
      showLogin();
    } else {
      showFormError("firebase-config.js が未設定です。FIREBASE_SETUP.md を参照してください。");
      if (appScreen) appScreen.hidden = false;
    }
    return;
  }

  setAuthLoading(true);

  try {
    await loadFirebaseModules();
  } catch (error) {
    console.error(error);
    if (isLoginPage) {
      showLoginError("Firebase の読み込みに失敗しました。ネットワーク接続を確認するか、ローカルモードを使ってください。");
      setAuthLoading(false);
    } else {
      showFormError("Firebase の読み込みに失敗しました。ネットワーク接続を確認してください。");
      if (appScreen) appScreen.hidden = false;
    }
    return;
  }

  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  onAuthStateChanged(auth, (user) => {
    setAuthLoading(false);

    if (user) {
      if (isLoginPage) {
        goToMemos();
      } else {
        enterApp(user);
      }
      return;
    }

    if (isMemoPage) {
      goToLogin();
    } else {
      showLogin();
    }
  });
}

function bindLoginPage() {
  googleLoginButton.addEventListener("click", loginWithGoogle);
  emailAuthForm.addEventListener("submit", loginWithEmail);
  emailSignInTab.addEventListener("click", () => setEmailAuthMode("signin"));
  emailSignUpTab.addEventListener("click", () => setEmailAuthMode("signup"));
  localModeButton.addEventListener("click", () => {
    disableLocalOnlyEntry();
    enableLocalMode();
    goToMemos();
  });

  [emailInput, passwordInput].forEach((input) => {
    input.addEventListener("input", clearLoginError);
  });

  setEmailAuthMode("signin");
}

function bindMemoPage() {
  usernameForm.addEventListener("submit", updateUsername);
  feedbackButton.addEventListener("click", openFeedbackForm);
  logoutButton.addEventListener("click", logout);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFormError();

    if (!currentUser) return;

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();
    let tags = parseTags(tagsInput.value);
    if (tags.length === 0) {
      tags = applyAutoTags({ silent: true, onlyWhenEmpty: true });
    }
    const existingMemo = memos.find((item) => item.id === editingId);
    const reminderAt = reminderInput
      ? normalizeReminderAt(reminderInput.value)
      : normalizeReminderAt(existingMemo?.reminderAt);
    const validationError = validateMemoInput(title, body, tags);

    if (validationError) {
      showFormError(validationError.message);
      validationError.target.focus();
      return;
    }

    const memo = {
      id: editingId ?? crypto.randomUUID(),
      title,
      body,
      tags,
      reminderAt,
      updatedAt: new Date().toISOString(),
      favorite: existingMemo?.favorite ?? false,
      pinned: existingMemo?.pinned ?? false,
    };

    saveButton.disabled = true;

    try {
      await saveMemo(memo);
      clearDraft();
      resetForm();
    } catch {
      showFormError(
        dataMode === "local"
          ? "保存に失敗しました。ブラウザの保存容量を確認してください。"
          : "保存に失敗しました。Firestore の設定を確認してください。",
      );
    } finally {
      saveButton.disabled = false;
    }
  });

  [titleInput, bodyInput, usernameInput, reminderInput].forEach((input) => {
    input?.addEventListener("input", clearFormError);
  });

  searchInput.addEventListener("input", () => {
    resetPagination();
    renderMemos();
  });
  sortSelect.addEventListener("change", () => {
    sortMode = SORT_MODES.has(sortSelect.value) ? sortSelect.value : DEFAULT_SORT_MODE;
    saveSortMode();
    resetPagination();
    renderMemos();
  });
  favoriteFilterButton.addEventListener("click", () => {
    showFavoritesOnly = !showFavoritesOnly;
    resetPagination();
    render();
  });
  tagFilterButton?.addEventListener("click", openTagFilterDialog);
  tagFilterDialogCloseButton?.addEventListener("click", closeTagFilterDialog);
  tagFilterDialog?.addEventListener("click", (event) => {
    if (event.target === tagFilterDialog) closeTagFilterDialog();
  });
  darkModeToggle.addEventListener("change", () => {
    displaySettings.dark = darkModeToggle.checked;
    applyDisplaySettings();
    saveDisplaySettings();
  });
  brightnessInput.addEventListener("input", () => {
    displaySettings.brightness = normalizeBrightness(brightnessInput.value);
    applyDisplaySettings();
    saveDisplaySettings();
  });
  outlookReminderSelect?.addEventListener("change", () => {
    const minutes = Number(outlookReminderSelect.value);
    applyOutlookReminderSetting(minutes);
    saveOutlookReminderMinutes(outlookReminderMinutes);
  });
  clearButton.addEventListener("click", () => {
    clearDraft();
    clearRememberedOpenMemo();
    resetForm();
  });

  newMemoButton?.addEventListener("click", () => {
    closeMemoDialog();
    clearDraft();
    clearRememberedOpenMemo();
    resetForm();
    document.querySelector(".editor")?.scrollIntoView({ block: "start", behavior: "smooth" });
  });

  // Tag suggestion handlers
  if (tagsInput) {
    tagsInput.addEventListener("focus", showTagSuggestions);
    tagsInput.addEventListener("input", () => {
      hideAutoTagStatus();
      showTagSuggestions();
    });
    tagsInput.addEventListener("blur", () => {
      setTimeout(hideTagSuggestions, 100);
    });
  }

  autoTagButton?.addEventListener("click", () => {
    applyAutoTags();
    tagsInput?.focus();
  });

  memoDialogCloseButton.addEventListener("click", closeMemoDialog);
  memoDialog.addEventListener("click", (event) => {
    if (event.target === memoDialog) closeMemoDialog();
  });
  if (settingsButton && settingsDialog) {
    settingsButton.addEventListener("click", () => {
      settingsDialog.hidden = false;
      document.body.classList.add("dialog-open");
      settingsDialogCloseButton?.focus();
    });

    settingsDialogCloseButton?.addEventListener("click", () => {
      settingsDialog.hidden = true;
      document.body.classList.remove("dialog-open");
      settingsButton.focus();
    });

    settingsDialog.addEventListener("click", (event) => {
      if (event.target === settingsDialog) {
        settingsDialog.hidden = true;
        document.body.classList.remove("dialog-open");
        settingsButton.focus();
      }
    });
  }

  if (helpButton && helpPanel) {
    helpButton.addEventListener("click", () => {
      const show = helpPanel.hidden;
      helpPanel.hidden = !show;
      helpButton.setAttribute("aria-expanded", String(show));
      if (!show) {
        helpButton.focus();
      }
    });
  }
  memoDialogFavoriteButton.addEventListener("click", () => {
    if (openMemoId) toggleFavoriteMemo(openMemoId);
  });
  memoDialogPinButton.addEventListener("click", () => {
    if (openMemoId) togglePinnedMemo(openMemoId);
  });
  getOrCreateDialogOutlookButton()?.addEventListener("click", () => {
    const memo = memos.find((item) => item.id === openMemoId);
    if (memo) downloadOutlookIcs(memo);
  });
  memoDialogEditButton.addEventListener("click", () => {
    if (openMemoId) startEditing(openMemoId);
  });
  memoDialogDeleteButton.addEventListener("click", () => {
    if (openMemoId) deleteMemo(openMemoId);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (tagFilterDialog && !tagFilterDialog.hidden) {
        closeTagFilterDialog();
        return;
      }
      if (memoDialog && !memoDialog.hidden) {
        closeMemoDialog();
        return;
      }
      if (helpPanel && !helpPanel.hidden) {
        helpPanel.hidden = true;
        helpButton?.setAttribute("aria-expanded", "false");
        helpButton?.focus();
        return;
      }
      if (settingsDialog && !settingsDialog.hidden) {
        settingsDialog.hidden = true;
        document.body.classList.remove("dialog-open");
        settingsButton?.focus();
      }
    }
  });

  // Initialize auto-save toggle and behavior
  try {
    const savedAuto = localStorage.getItem("memo-desk-autosave");
    if (autoSaveToggle) autoSaveToggle.checked = savedAuto === "true";
    autoSaveToggle?.addEventListener("change", () => {
      const enabled = autoSaveToggle.checked;
      localStorage.setItem("memo-desk-autosave", enabled ? "true" : "false");
      if (enabled) {
        startAutoSave();
        attachDraftInputHandlers();
      } else {
        stopAutoSave();
        detachDraftInputHandlers();
      }
    });
    if (autoSaveToggle?.checked) { startAutoSave(); attachDraftInputHandlers(); }
  } catch {
    // ignore
  }

  // Brightness reset
  if (brightnessResetButton) {
    brightnessResetButton.addEventListener("click", () => {
      displaySettings.brightness = 100;
      applyDisplaySettings();
      saveDisplaySettings();
    });
  }

  if (accentColorInput) {
    accentColorInput.addEventListener("change", () => {
      customColors.accent = accentColorInput.value;
      applyCustomColors(customColors);
      saveCustomColors(customColors);
    });
  }
  if (bgColorInput) {
    bgColorInput.addEventListener("change", () => {
      customColors.bg = bgColorInput.value;
      applyCustomColors(customColors);
      saveCustomColors(customColors);
    });
  }
  if (textColorInput) {
    textColorInput.addEventListener("change", () => {
      customColors.text = textColorInput.value;
      applyCustomColors(customColors);
      saveCustomColors(customColors);
    });
  }
  if (cardBgColorInput) {
    cardBgColorInput.addEventListener("change", () => {
      customColors.cardBg = cardBgColorInput.value;
      applyCustomColors(customColors);
      saveCustomColors(customColors);
    });
  }
  if (colorResetButton) {
    colorResetButton.addEventListener("click", () => {
      customColors = { ...DEFAULT_LIGHT_COLORS };
      applyCustomColors(customColors);
      saveCustomColors(customColors);
    });
  }

  // Layout radio handlers
  if (layoutGridRadio) {
    layoutGridRadio.addEventListener("change", () => {
      layoutSetting = "grid";
      applyLayoutSetting(layoutSetting);
      saveLayoutSetting(layoutSetting);
    });
  }
  if (layoutListRadio) {
    layoutListRadio.addEventListener("change", () => {
      layoutSetting = "list";
      applyLayoutSetting(layoutSetting);
      saveLayoutSetting(layoutSetting);
    });
  }

  // Clear local data handler: open confirm dialog
  if (settingsClearLocalButton) {
    settingsClearLocalButton.addEventListener("click", () => {
      if (!confirmDialog || !confirmDialogMessage) return;
      confirmDialogMessage.textContent = 'このブラウザに保存されたローカルデータを削除します。よろしいですか？';
      confirmAction = async () => {
        try {
          localStorage.removeItem(LOCAL_MEMOS_KEY);
          localStorage.removeItem(LEGACY_STORAGE_KEY);
          localStorage.removeItem(DRAFT_KEY);
          memos = loadLocalMemos();
          render();
          alert('ローカルデータを削除しました。');
        } catch (error) {
          console.error(error);
          alert('ローカルデータの削除に失敗しました。コンソールを確認してください。');
        }
      };
      confirmDialog.hidden = false;
      document.body.classList.add('dialog-open');
      confirmCancel?.focus();
    });
  }

  if (confirmCancel) {
    confirmCancel.addEventListener("click", () => {
      if (!confirmDialog) return;
      confirmDialog.hidden = true;
      document.body.classList.remove('dialog-open');
      confirmAction = null;
      pendingDeleteMemoId = null;
      settingsClearLocalButton?.focus();
    });
  }

  if (confirmOk) {
    confirmOk.addEventListener('click', async () => {
      try {
        if (typeof confirmAction === 'function') {
          await confirmAction();
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!confirmDialog) return;
        confirmDialog.hidden = true;
        document.body.classList.remove('dialog-open');
        confirmAction = null;
        // if it was a memo deletion, clear selection and re-render
        if (pendingDeleteMemoId) pendingDeleteMemoId = null;
        settingsClearLocalButton?.focus();
      }
    });
  }

  // Try restoring draft if present and autosave enabled
  tryRestoreDraftOnLoad();

  applyDisplaySettings();
  applyCustomColors(customColors);
  applyLayoutSetting(layoutSetting);
  applyOutlookReminderSetting(outlookReminderMinutes);
}

if (isLoginPage) bindLoginPage();
if (isMemoPage) bindMemoPage();
initFirebase();

// Auto-save and draft helpers
function createDraftSnapshot() {
  return {
    id: editingId,
    title: titleInput.value || "",
    body: bodyInput.value || "",
    tags: tagsInput.value || "",
    reminderAt: reminderInput?.value || "",
    updatedAt: new Date().toISOString(),
  };
}

function isDraftEmpty(draft) {
  return !draft.id && !draft.title.trim() && !draft.body.trim() && !draft.tags.trim() && !draft.reminderAt;
}

function startAutoSave() {
  stopAutoSave();
  // save immediately and then every 10s
  saveDraft();
  autoSaveIntervalId = setInterval(() => saveDraft(), 10000);
}

function stopAutoSave() {
  if (autoSaveIntervalId) {
    clearInterval(autoSaveIntervalId);
    autoSaveIntervalId = null;
  }
}

function scheduleSaveDraft() {
  if (autoSaveDebounceTimer) clearTimeout(autoSaveDebounceTimer);
  autoSaveDebounceTimer = setTimeout(() => saveDraft(), 1000);
}

function attachDraftInputHandlers() {
  if (draftInputHandler) detachDraftInputHandlers();
  draftInputHandler = function () {
    saveDraft();
  };
  [titleInput, bodyInput, tagsInput, reminderInput].forEach((el) => {
    el?.addEventListener('input', draftInputHandler);
  });
}

function detachDraftInputHandlers() {
  [titleInput, bodyInput, tagsInput, reminderInput].forEach((el) => {
    if (draftInputHandler) el?.removeEventListener('input', draftInputHandler);
  });
  draftInputHandler = null;
}

function saveDraft() {
  try {
    const draft = createDraftSnapshot();
    if (isDraftEmpty(draft)) {
      clearDraft();
      return;
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (e) {
    // ignore
  }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch {}
}

function tryRestoreDraftOnLoad() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    const autosaveEnabled = localStorage.getItem('memo-desk-autosave') === 'true';
    if (!raw || !autosaveEnabled) return;
    const draft = JSON.parse(raw);
    if (!draft) return;
    if (isDraftEmpty(draft)) return;
    const should = confirm('下書きが見つかりました。編集中の内容を復元しますか？');
    if (!should) return;
    editingId = draft.id || null;
    titleInput.value = draft.title || '';
    bodyInput.value = draft.body || '';
    tagsInput.value = draft.tags || '';
    if (reminderInput) reminderInput.value = draft.reminderAt || '';
    saveButton.textContent = editingId ? "更新する" : "保存する";
  } catch {
    // ignore
  }
}

// Expose helpers for testing/debugging
try {
  window.saveDraft = saveDraft;
  window.startAutoSave = startAutoSave;
  window.attachDraftInputHandlers = attachDraftInputHandlers;
  window.detachDraftInputHandlers = detachDraftInputHandlers;
} catch (e) {
  // ignore in restricted contexts
}
