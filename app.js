const USER_KEY = "memo-desk-user";
const LEGACY_STORAGE_KEY = "memo-desk-notes";

const loginScreen = document.querySelector("#loginScreen");
const appScreen = document.querySelector("#appScreen");
const loginForm = document.querySelector("#loginForm");
const userNameInput = document.querySelector("#userName");
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

let currentUser = null;
let memos = [];
let editingId = null;
let activeTag = "all";

function getMemoStorageKey() {
  return `memo-desk-notes-${currentUser}`;
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

function showLogin() {
  loginScreen.hidden = false;
  appScreen.hidden = true;
  loginForm.reset();
  clearLoginError();
  userNameInput.focus();
}

function enterApp(name) {
  currentUser = name;
  localStorage.setItem(USER_KEY, name);
  loginScreen.hidden = true;
  appScreen.hidden = false;
  userGreeting.textContent = `${name}さん`;
  memos = loadMemos();
  editingId = null;
  activeTag = "all";
  searchInput.value = "";
  resetForm();
  render();
}

function logout() {
  localStorage.removeItem(USER_KEY);
  currentUser = null;
  memos = [];
  editingId = null;
  activeTag = "all";
  showLogin();
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

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearLoginError();

  const name = userNameInput.value.trim();
  if (!name) {
    showLoginError("名前を入力してください。");
    userNameInput.focus();
    return;
  }

  enterApp(name);
});

userNameInput.addEventListener("input", clearLoginError);
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

const savedUser = localStorage.getItem(USER_KEY);
if (savedUser) {
  enterApp(savedUser);
} else {
  showLogin();
}
