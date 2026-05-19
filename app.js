import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const LEGACY_STORAGE_KEY = "memo-desk-notes";

const loginScreen = document.querySelector("#loginScreen");
const appScreen = document.querySelector("#appScreen");
const googleLoginButton = document.querySelector("#googleLoginButton");
const loginHint = document.querySelector("#loginHint");
const loginError = document.querySelector("#loginError");
const userGreeting = document.querySelector("#userGreeting");
const logoutButton = document.querySelector("#logoutButton");

const form = document.querySelector("#memoForm");
const titleInput = document.querySelector("#memoTitle");
const bodyInput = document.querySelector("#memoBody");
const tagsInput = document.querySelector("#memoTags");
const searchInput = document.querySelector("#searchInput");
const memoList = document.querySelector("#memoList");
const memoCount = document.querySelector("#memoCount");
const tagFilter = document.querySelector("#tagFilter");
const clearButton = document.querySelector("#clearButton");
const saveButton = document.querySelector("#saveButton");
const formError = document.querySelector("#formError");
const template = document.querySelector("#memoTemplate");

let auth = null;
let currentUserId = null;
let memos = [];
let editingId = null;
let activeTag = "all";

function getMemoStorageKey() {
  return `memo-desk-notes-${currentUserId}`;
}

function loadMemos() {
  const key = getMemoStorageKey();
  let saved = localStorage.getItem(key);

  if (!saved) {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      localStorage.setItem(key, legacy);
      saved = legacy;
    }
  }

  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function saveMemos() {
  try {
    localStorage.setItem(getMemoStorageKey(), JSON.stringify(memos));
  } catch {
    throw new Error("保存できません。ブラウザの設定でストレージがブロックされていないか確認してください。");
  }
}

function showLoginError(message) {
  loginError.textContent = message;
  loginError.hidden = !message;
}

function clearLoginError() {
  showLoginError("");
}

function showFormError(message) {
  formError.textContent = message;
  formError.hidden = !message;
}

function clearFormError() {
  showFormError("");
}

function setLoginLoading(isLoading) {
  googleLoginButton.disabled = isLoading;
  loginHint.hidden = !isLoading;
}

function showLogin() {
  loginScreen.hidden = false;
  appScreen.hidden = true;
  clearLoginError();
  setLoginLoading(false);
  googleLoginButton.focus();
}

function getDisplayName(user) {
  return user.displayName || user.email?.split("@")[0] || "ユーザー";
}

function enterApp(user) {
  currentUserId = user.uid;
  loginScreen.hidden = true;
  appScreen.hidden = false;
  userGreeting.textContent = `${getDisplayName(user)}さん`;
  memos = loadMemos();
  editingId = null;
  activeTag = "all";
  searchInput.value = "";
  resetForm();
  render();
}

async function logout() {
  if (auth) await signOut(auth);
  currentUserId = null;
  memos = [];
  editingId = null;
  activeTag = "all";
  showLogin();
}

function parseAuthError(error) {
  const code = error?.code ?? "";

  if (code === "auth/popup-blocked") {
    return "ポップアップがブロックされました。ブラウザでこのサイトのポップアップを許可してください。";
  }
  if (code === "auth/unauthorized-domain") {
    return "このドメインは Firebase で許可されていません。FIREBASE_SETUP.md の「承認済みドメイン」を確認してください。";
  }
  if (code === "auth/popup-closed-by-user") {
    return "ログインがキャンセルされました。もう一度お試しください。";
  }

  return error?.message || "ログインに失敗しました。";
}

async function loginWithGoogle() {
  if (!auth) {
    showLoginError("Firebase の設定がまだ完了していません。firebase-config.js を編集してください。");
    return;
  }

  clearLoginError();
  setLoginLoading(true);

  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (error) {
    showLoginError(parseAuthError(error));
    setLoginLoading(false);
  }
}

function parseTags(text) {
  return text
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
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
    return matchesKeyword && matchesTag;
  });
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
      render();
    });
    tagFilter.append(button);
  });
}

function renderMemos() {
  const filteredMemos = getFilteredMemos();
  memoList.innerHTML = "";
  memoCount.textContent = `${memos.length}件`;

  if (filteredMemos.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "表示できるメモがありません";
    memoList.append(empty);
    return;
  }

  filteredMemos.forEach((memo) => {
    const item = template.content.cloneNode(true);
    const card = item.querySelector(".memo-card");
    const title = item.querySelector("h3");
    const time = item.querySelector("time");
    const body = item.querySelector(".memo-body");
    const tags = item.querySelector(".memo-tags");
    const editButton = item.querySelector(".edit-button");
    const deleteButton = item.querySelector(".delete-button");

    title.textContent = memo.title;
    time.textContent = formatDate(memo.updatedAt);
    time.dateTime = memo.updatedAt;
    body.textContent = memo.body;
    tags.innerHTML = "";

    memo.tags.forEach((tag) => {
      const tagItem = document.createElement("span");
      tagItem.textContent = tag;
      tags.append(tagItem);
    });

    editButton.addEventListener("click", () => startEditing(memo.id));
    deleteButton.addEventListener("click", () => deleteMemo(memo.id));
    memoList.append(card);
  });
}

function render() {
  renderTags();
  renderMemos();
}

function resetForm() {
  form.reset();
  editingId = null;
  saveButton.textContent = "保存する";
  clearFormError();
  if (!appScreen.hidden) titleInput.focus();
}

function startEditing(id) {
  const memo = memos.find((item) => item.id === id);
  if (!memo) return;

  editingId = id;
  titleInput.value = memo.title;
  bodyInput.value = memo.body;
  tagsInput.value = memo.tags.join(", ");
  saveButton.textContent = "更新する";
  titleInput.focus();
}

function deleteMemo(id) {
  const memo = memos.find((item) => item.id === id);
  if (!memo) return;

  const ok = confirm(`「${memo.title}」を削除しますか？`);
  if (!ok) return;

  memos = memos.filter((item) => item.id !== id);
  if (editingId === id) resetForm();
  saveMemos();
  render();
}

function initFirebase() {
  if (!isFirebaseConfigured()) {
    showLoginError(
      "firebase-config.js が未設定です。FIREBASE_SETUP.md の手順に従って YOUR_... を置き換えてください。",
    );
    googleLoginButton.disabled = true;
    showLogin();
    return;
  }

  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  onAuthStateChanged(auth, (user) => {
    setLoginLoading(false);

    if (user) {
      enterApp(user);
    } else {
      currentUserId = null;
      showLogin();
    }
  });
}

googleLoginButton.addEventListener("click", loginWithGoogle);
logoutButton.addEventListener("click", logout);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearFormError();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    showFormError("タイトルを入力してください。");
    titleInput.focus();
    return;
  }

  if (!body) {
    showFormError("本文を入力してください。");
    bodyInput.focus();
    return;
  }

  const now = new Date().toISOString();
  const memo = {
    id: editingId ?? crypto.randomUUID(),
    title,
    body,
    tags: parseTags(tagsInput.value),
    updatedAt: now,
  };

  try {
    if (editingId) {
      memos = memos.map((item) => (item.id === editingId ? memo : item));
    } else {
      memos = [memo, ...memos];
    }

    saveMemos();
    resetForm();
    render();
  } catch (error) {
    showFormError(error.message || "保存に失敗しました。");
  }
});

[titleInput, bodyInput].forEach((input) => {
  input.addEventListener("input", clearFormError);
});

searchInput.addEventListener("input", renderMemos);
clearButton.addEventListener("click", resetForm);

initFirebase();
