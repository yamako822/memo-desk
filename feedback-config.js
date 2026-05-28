export const feedbackConfig = {
  // Google Form の共有リンクを貼ってください。
  // 例: "https://docs.google.com/forms/d/e/xxxxxxxx/viewform"
  formUrl: "",
};

export function isFeedbackConfigured() {
  const url = feedbackConfig.formUrl.trim();
  return url.startsWith("https://docs.google.com/forms/") || url.startsWith("https://forms.gle/");
}
