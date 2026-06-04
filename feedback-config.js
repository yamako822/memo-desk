export const feedbackConfig = {
  // Google Form の共有リンクを貼ってください。
  // 例: "https://docs.google.com/forms/d/e/xxxxxxxx/viewform"
  formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSecs-kMgsjYN6RQwNmaLTlNjZ0KdSLV8Uwoy8JW8rnxF9JAIA/viewform?usp=dialog",
};

export function isFeedbackConfigured() {
  const url = feedbackConfig.formUrl.trim();
  return url.startsWith("https://docs.google.com/forms/") || url.startsWith("https://forms.gle/");
}
