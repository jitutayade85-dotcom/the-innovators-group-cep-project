// English strings — the source dictionary. Every other language file must
// match this shape exactly (enforced by the `Dict` type).
const en = {
  appName: "Surakshit Digital",
  tabHome: "Home",
  tabLearn: "Learn",
  tabCheck: "Check",
  tabAlerts: "Alerts",

  greeting: "Stay safe online",
  greetingSub: "Learn simple tricks to beat online fraud",
  language: "Language",

  sosTitle: "Cyber fraud? Call 1930",
  sosCall: "Call Now",

  quickCheckTitle: "Is this message a scam?",
  quickCheckSub: "Paste any SMS or WhatsApp message",
  quickCheckBtn: "Check Now",

  tileLearn: "Learn Safety",
  tileLearnSub: "Short lessons with pictures",
  tileAlerts: "Scam Alerts",
  tileAlertsSub: "Latest frauds near you",
  tileCheck: "Check Message",
  tileCheckSub: "Is it a scam?",
  tileHelp: "Helplines",
  tileHelpSub: "Numbers that help you",

  all: "All",
  minutes: "min",
  startLesson: "Start",
  completedMark: "Done",

  learnTitle: "Safety Lessons",
  learnSub: "Pick a lesson to start",
  catOtp: "OTP Fraud",
  catUpi: "UPI Fraud",
  catWhatsapp: "WhatsApp",
  catPassword: "Passwords",
  catSocial: "Social Media",
  catJob: "Job Fraud",

  whatToDo: "What to do",
  takeQuiz: "Take Quiz",
  quizTitle: "Quick Quiz",
  correct: "Correct! Well done",
  wrong: "Oops! Try again",
  finishQuiz: "Finish",
  scoreTitle: "Your Score",
  wellDone: "Well done! Lesson complete",
  retry: "Try Again",
  backToLessons: "More Lessons",

  checkTitle: "Check a Message",
  checkSub: "Paste SMS or WhatsApp text below",
  inputPlaceholder: "Paste the suspicious message here…",
  tryExample: "Or try an example:",
  exBankOtp: "Bank OTP message",
  exLottery: "Lottery win message",
  exKyc: "KYC expiring message",
  exBankOtpText:
    "Dear customer your ATM card is blocked. Share your OTP to reactivate now. - BANK",
  exLotteryText:
    "CONGRATULATIONS! You won Rs 25,00,000 lottery. Send Rs 2,000 fee to claim your prize.",
  exKycText:
    "Your PayTM KYC expired. Account will close in 2 hours. Click this link to update.",
  checkBtn: "Check Now",
  checking: "Checking…",
  verdictSafe: "Mostly Safe",
  verdictSuspicious: "Be Careful",
  verdictScam: "Scam!",
  whatToDoNow: "What to do now",
  confidence: "Confidence",
  emptyMessage: "Type or paste a message first",
  checkError: "Could not check now. Try again.",

  alertsTitle: "Scam Alerts",
  alertsSub: "New fraud tricks going around",
  highRisk: "High Risk",
  mediumRisk: "Medium Risk",
  lowRisk: "Low Risk",
  share: "Share",

  helpTitle: "Helplines",
  helpSub: "Tap a card to call",
  aboutLine: "Free help, available 24x7",

  loading: "Loading…",
  retryBtn: "Retry",
  errorGeneric: "Something went wrong",
  noConnection: "You are offline. Showing saved content.",
};

// The shared shape all language files must follow.
export type Dict = typeof en;
export default en;
