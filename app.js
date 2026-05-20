import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
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
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const LEGACY_STORAGE_KEY = "memo-desk-notes";

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
let db = null;
let currentUser = null;
let unsubscribeMemos = null;
let memos = [];
let editingId = null;
let activeTag = "all";
let emailAuthMode = "signin";

function memosCollectionRef(uid) {
  return collection(db, "users", uid, "memos");
}

function memoDocRef(uid, memoId) {
  return doc(db, "users", uid, "memos", memoId);
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

function setAuthLoading(isLoading) {
  googleLoginButton.disabled = isLoading;
  emailSubmitButton.disabled = isLoading;
  emailSignInTab.disabled = isLoading;
  emailSignUpTab.disabled = isLoading;
  loginHint.hidden = !isLoading;
}

function setAppLoading(isLoading) {
  appLoading.hidden = !isLoading;
}

function showLogin() {
  stopMemoSubscription();
  currentUser = null;
  memos = [];
  loginScreen.hidden = false;
  appScreen.hidden = true;
  clearLoginError();
  setAuthLoading(false);
  setAppLoading(false);
  googleLoginButton.focus();
}

function getDisplayName(user) {
  return user.displayName || user.email?.split("@")[0] || "ユーザー";
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
      memos = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));
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
    });
  });
  await batch.commit();
}

async function enterApp(user) {
  currentUser = user;
  loginScreen.hidden = true;
  appScreen.hidden = false;
  userGreeting.textContent = `${getDisplayName(user)}さん`;
  editingId = null;
  activeTag = "all";
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

async function logout() {
  stopMemoSubscription();
  if (auth) await signOut(auth);
  memos = [];
  editingId = null;
  activeTag = "all";
  showLogin();
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
    empty.textContent = appLoading.hidden === false ? "読み込み中…" : "表示できるメモがありません";
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
  if (!appScreen.hidden && appLoading.hidden) titleInput.focus();
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

async function deleteMemo(id) {
  const memo = memos.find((item) => item.id === id);
  if (!memo || !currentUser) return;

  const ok = confirm(`「${memo.title}」を削除しますか？`);
  if (!ok) return;

  try {
    await deleteDoc(memoDocRef(currentUser.uid, id));
    if (editingId === id) resetForm();
  } catch {
    showFormError("削除に失敗しました。");
  }
}

async function saveMemoToFirestore(memo) {
  if (!currentUser) return;
  await setDoc(memoDocRef(currentUser.uid, memo.id), {
    title: memo.title,
    body: memo.body,
    tags: memo.tags,
    updatedAt: memo.updatedAt,
  });
}

function initFirebase() {
  if (!isFirebaseConfigured()) {
    showLoginError("firebase-config.js が未設定です。FIREBASE_SETUP.md を参照してください。");
    googleLoginButton.disabled = true;
    emailSubmitButton.disabled = true;
    showLogin();
    return;
  }

  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  onAuthStateChanged(auth, (user) => {
    setAuthLoading(false);

    if (user) {
      enterApp(user);
    } else {
      showLogin();
    }
  });
}

googleLoginButton.addEventListener("click", loginWithGoogle);
emailAuthForm.addEventListener("submit", loginWithEmail);
emailSignInTab.addEventListener("click", () => setEmailAuthMode("signin"));
emailSignUpTab.addEventListener("click", () => setEmailAuthMode("signup"));
logoutButton.addEventListener("click", logout);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearFormError();

  if (!currentUser) return;

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

  const memo = {
    id: editingId ?? crypto.randomUUID(),
    title,
    body,
    tags: parseTags(tagsInput.value),
    updatedAt: new Date().toISOString(),
  };

  saveButton.disabled = true;

  try {
    await saveMemoToFirestore(memo);
    resetForm();
  } catch {
    showFormError("保存に失敗しました。Firestore の設定を確認してください。");
  } finally {
    saveButton.disabled = false;
  }
});

[titleInput, bodyInput].forEach((input) => {
  input.addEventListener("input", clearFormError);
});

[emailInput, passwordInput].forEach((input) => {
  input.addEventListener("input", clearLoginError);
});

searchInput.addEventListener("input", renderMemos);
clearButton.addEventListener("click", resetForm);

setEmailAuthMode("signin");
initFirebase();
