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
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const memoList = document.querySelector("#memoList");
const memoCount = document.querySelector("#memoCount");
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
const memoDialogCloseButton = document.querySelector("#memoDialogCloseButton");
const memoDialogPinButton = document.querySelector("#memoDialogPinButton");
const memoDialogFavoriteButton = document.querySelector("#memoDialogFavoriteButton");
const memoDialogEditButton = document.querySelector("#memoDialogEditButton");
const memoDialogDeleteButton = document.querySelector("#memoDialogDeleteButton");
const settingsButton = document.querySelector("#settingsButton");
const settingsDialog = document.querySelector("#settingsDialog");
const settingsDialogCloseButton = document.querySelector("#settingsDialogCloseButton");
const autoSaveToggle = document.querySelector("#autoSaveToggle");
const settingsClearLocalButton = document.querySelector("#settingsClearLocalButton");
const brightnessResetButton = document.querySelector("#brightnessResetButton");
const accentColorInput = document.querySelector("#accentColorInput");
const bgColorInput = document.querySelector("#bgColorInput");
const textColorInput = document.querySelector("#textColorInput");
const cardBgColorInput = document.querySelector("#cardBgColorInput");
const colorResetButton = document.querySelector("#colorResetButton");
const helpButton = document.querySelector("#helpButton");
const helpPanel = document.querySelector("#helpPanel");
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
const DEFAULT_SORT_MODE = "updatedDesc";
const SORT_MODES = new Set(["updatedDesc", "updatedAsc", "titleAsc", "titleDesc"]);

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
      accent: saved?.accent || "#0f766e",
      bg: saved?.bg || "#f7f5f0",
      text: saved?.text || "#202124",
      cardBg: saved?.cardBg || "#fffefb",
    };
  } catch {
    return {
      accent: "#0f766e",
      bg: "#f7f5f0",
      text: "#202124",
      cardBg: "#fffefb",
    };
  }
}

function saveCustomColors(colors) {
  try {
    localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(colors));
  } catch {}
}

function applyCustomColors(colors) {
  const root = document.documentElement;
  root.style.setProperty("--accent", colors.accent);
  root.style.setProperty("--bg", colors.bg);
  root.style.setProperty("--text", colors.text);
  root.style.setProperty("--card-bg", colors.cardBg);
  if (accentColorInput) accentColorInput.value = colors.accent;
  if (bgColorInput) bgColorInput.value = colors.bg;
  if (textColorInput) textColorInput.value = colors.text;
  if (cardBgColorInput) cardBgColorInput.value = colors.cardBg;
}

let displaySettings = readDisplaySettings();
let customColors = readCustomColors();
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
  if (logoutButton) logoutButton.textContent = useLocalOnlyEntry() ? "入口へ戻る" : "モード選択へ";
  editingId = null;
  activeTag = "all";
  showFavoritesOnly = false;
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
      memo.tags.some((tag) => tag.toLowerCase().includes(keyword));
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

  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.textContent = "すべて";
  allButton.classList.toggle("active", activeTag === "all");
  allButton.addEventListener("click", () => {
    activeTag = "all";
    resetPagination();
    render();
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
    });
    tagFilter.append(button);
  });
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

function render() {
  renderFavoriteFilter();
  renderSortControl();
  renderTags();
  renderMemos();
}

function resetForm() {
  form.reset();
  editingId = null;
  saveButton.textContent = "保存する";
  clearFormError();
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
}

function openMemoDialog(id) {
  if (!memoDialog) return;

  openMemoId = id;
  memoDialog.hidden = false;
  document.body.classList.add("dialog-open");
  updateMemoDialog(id);
  memoDialogCloseButton.focus();
}

function closeMemoDialog() {
  if (!memoDialog || memoDialog.hidden) return;

  memoDialog.hidden = true;
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
    const tags = parseTags(tagsInput.value);
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
      updatedAt: new Date().toISOString(),
      favorite: memos.find((item) => item.id === editingId)?.favorite ?? false,
      pinned: memos.find((item) => item.id === editingId)?.pinned ?? false,
    };

    saveButton.disabled = true;

    try {
      await saveMemo(memo);
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

  [titleInput, bodyInput, usernameInput].forEach((input) => {
    input.addEventListener("input", clearFormError);
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
  clearButton.addEventListener("click", resetForm);

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
  memoDialogEditButton.addEventListener("click", () => {
    if (openMemoId) startEditing(openMemoId);
  });
  memoDialogDeleteButton.addEventListener("click", () => {
    if (openMemoId) deleteMemo(openMemoId);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
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
      customColors = {
        accent: "#0f766e",
        bg: "#f7f5f0",
        text: "#202124",
        cardBg: "#fffefb",
      };
      applyCustomColors(customColors);
      saveCustomColors(customColors);
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
}

if (isLoginPage) bindLoginPage();
if (isMemoPage) bindMemoPage();
initFirebase();

// Auto-save and draft helpers
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
  draftInputHandler = function () {
    try {
      const draft = {
        id: editingId,
        title: titleInput.value || "",
        body: bodyInput.value || "",
        tags: tagsInput.value || "",
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      // ignore
    }
  };
  [titleInput, bodyInput, tagsInput].forEach((el) => {
    el?.addEventListener('input', draftInputHandler);
  });
}

function detachDraftInputHandlers() {
  [titleInput, bodyInput, tagsInput].forEach((el) => {
    if (draftInputHandler) el?.removeEventListener('input', draftInputHandler);
  });
  draftInputHandler = null;
}

function saveDraft() {
  try {
    const draft = {
      id: editingId,
      title: titleInput.value || "",
      body: bodyInput.value || "",
      tags: tagsInput.value || "",
      updatedAt: new Date().toISOString(),
    };
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
    const should = confirm('下書きが見つかりました。編集中の内容を復元しますか？');
    if (!should) return;
    editingId = draft.id || null;
    titleInput.value = draft.title || '';
    bodyInput.value = draft.body || '';
    tagsInput.value = draft.tags || '';
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
