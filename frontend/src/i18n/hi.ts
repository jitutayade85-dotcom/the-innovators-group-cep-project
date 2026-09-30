// Hindi strings — mirrors en.ts (Dict type keeps every key in sync).
import type { Dict } from "./en";

const hi: Dict = {
  appName: "सुरक्षित डिजिटल",
  tabHome: "होम",
  tabLearn: "सीखें",
  tabCheck: "जाँच",
  tabAlerts: "अलर्ट",

  greeting: "ऑनलाइन सुरक्षित रहें",
  greetingSub: "ऑनलाइन ठगी से बचने के आसान तरीके",
  language: "भाषा",

  sosTitle: "साइबर ठगी? 1930 पर कॉल करें",
  sosCall: "अभी कॉल करें",

  quickCheckTitle: "क्या यह मैसेज ठगी है?",
  quickCheckSub: "कोई भी SMS या WhatsApp मैसेज पेस्ट करें",
  quickCheckBtn: "अभी जाँचें",

  tileLearn: "सीखें सुरक्षा",
  tileLearnSub: "तस्वीरों वाले छोटे पाठ",
  tileAlerts: "ठगी अलर्ट",
  tileAlertsSub: "आसपास की नई ठगी",
  tileCheck: "मैसेज जाँचें",
  tileCheckSub: "यह ठगी है या नहीं?",
  tileHelp: "हेल्पलाइन",
  tileHelpSub: "मदद के नंबर",

  all: "सभी",
  minutes: "मिनट",
  startLesson: "शुरू करें",
  completedMark: "पूरा हुआ",

  learnTitle: "सुरक्षा पाठ",
  learnSub: "सीखने के लिए पाठ चुनें",
  catOtp: "OTP ठगी",
  catUpi: "UPI ठगी",
  catWhatsapp: "WhatsApp",
  catPassword: "पासवर्ड",
  catSocial: "सोशल मीडिया",
  catJob: "नौकरी ठगी",

  whatToDo: "क्या करें",
  takeQuiz: "क्विज़ खेलें",
  quizTitle: "छोटी क्विज़",
  correct: "सही! शाबाश",
  wrong: "फिर सोचें, दोबारा चुनें",
  finishQuiz: "पूरा करें",
  scoreTitle: "आपका स्कोर",
  wellDone: "शाबाश! पाठ पूरा हुआ",
  retry: "फिर कोशिश करें",
  backToLessons: "और पाठ",

  checkTitle: "मैसेज जाँचें",
  checkSub: "नीचे SMS या WhatsApp का text पेस्ट करें",
  inputPlaceholder: "संदिग्ध मैसेज यहाँ पेस्ट करें…",
  tryExample: "या उदाहरण आज़माएँ:",
  exBankOtp: "बैंक OTP मैसेज",
  exLottery: "लॉटरी वाला मैसेज",
  exKyc: "KYC वाला मैसेज",
  exBankOtpText:
    "जैसे: प्रिय ग्राहक, आपका ATM कार्ड ब्लॉक है। OTP भेजें, तुरंत चालू होगा। - BANK",
  exLotteryText:
    "जैसे: बधाई हो! आपने 25 लाख रुपये लॉटरी जीते। इनाम के लिए 2,000 रुपये भेजें।",
  exKycText:
    "जैसे: आपकी KYC समाप्त होगी। खाता 2 घंटे में बंद। इस लिंक से अपडेट करें।",
  checkBtn: "अभी जाँचें",
  checking: "जाँच हो रही है…",
  verdictSafe: "ज़्यादातर सुरक्षित",
  verdictSuspicious: "सावधान रहें",
  verdictScam: "ठगी है!",
  whatToDoNow: "अब क्या करें",
  confidence: "कितना पक्का",
  emptyMessage: "पहले मैसेज लिखें या पेस्ट करें",
  checkError: "अभी जाँच नहीं हो सकी। फिर कोशिश करें।",

  alertsTitle: "ठगी अलर्ट",
  alertsSub: "आसपास फैली नई ठगी",
  highRisk: "ज़्यादा खतरा",
  mediumRisk: "सावधान",
  lowRisk: "थोड़ा खतरा",
  share: "शेयर करें",

  helpTitle: "हेल्पलाइन",
  helpSub: "कॉल के लिए कार्ड दबाएँ",
  aboutLine: "मुफ़्त मदद, 24 घंटे उपलब्ध",

  // Onboarding + profile
  continue: "आगे बढ़ें",
  onbLangTitle: "अपनी भाषा चुनें",
  onbLangSub: "इसे बाद में सेटिंग में बदल सकते हैं",
  profileTitle: "अपने बारे में बताएँ",
  profileSub: "सिर्फ नाम और भाषा ज़रूरी है",
  nameLabel: "आपका नाम",
  namePlaceholder: "अपना नाम लिखें",
  ageLabel: "उम्र (वैकल्पिक)",
  agePlaceholder: "जैसे 25",
  placeLabel: "गाँव / शहर (वैकल्पिक)",
  placePlaceholder: "जैसे वाई",
  addPhoto: "फोटो जोड़ें",
  changePhoto: "फोटो बदलें",
  saveProfile: "सेव करें और आगे बढ़ें",
  nameRequired: "कृपया अपना नाम लिखें",
  savingProfile: "सेव हो रहा है…",
  hello: "नमस्ते",

  // Home tiles (Phase 1)
  tileScamCheck: "ठगी जाँच",
  tileScamCheckSub: "क्या यह मैसेज सुरक्षित है?",
  tileLearnPlay: "सीखें और खेलें",
  tileLearnPlaySub: "पाठ और क्विज़",
  tileProgress: "मेरी प्रगति",
  tileProgressSub: "देखें आपने क्या सीखा",
  tileTests: "टेस्ट",
  tileTestsSub: "अपना ज्ञान जाँचें",
  tileSos: "SOS मदद",
  tileSosSub: "ठगी हो गई? तुरंत करें",
  comingSoon: "जल्द आ रहा है",
  settings: "सेटिंग",

  // Settings
  settingsTitle: "सेटिंग",
  settingsLanguage: "ऐप की भाषा",
  settingsEditProfile: "प्रोफ़ाइल बदलें",
  settingsSmsScan: "SMS की ठगी जाँच",
  settingsSmsScanSub: "सिर्फ Android, ऐप इंस्टॉल ज़रूरी",

  // SMS permission
  smsExplainTitle: "SMS की ठगी जाँच करें?",
  smsExplainBody:
    "हम आपके फोन के आने वाले SMS सिर्फ ठगी से आगाह करने के लिए पढ़ते हैं। आपके मैसेज कहीं नहीं भेजे जाते।",
  smsEnableBtn: "अनुमति दें और चालू करें",
  smsCancel: "अभी नहीं",
  smsActiveMsg: "SMS जाँच चालू है",
  smsDeniedMsg: "अनुमति नहीं मिली। फोन सेटिंग में इसे चालू करें।",
  smsUnsupportedMsg: "यह सिर्फ इंस्टॉल किए Android ऐप में चलता है।",
  smsFlagTitle: "संभावित ठगी SMS",

  // Check screen (offline + AI)
  offlineQuickTitle: "झटपट जाँच (ऑफलाइन)",
  aiCheckTitle: "AI जाँच",
  offlineOnlyNote: "आप ऑफलाइन हैं — सिर्फ झटपट जाँच दिखा रहे हैं।",
  checkingAi: "AI से पूछ रहे हैं…",

  // SOS
  sosScreenTitle: "SOS — अभी यह करें",
  sosScreenSub: "अगर ठगी हुई है तो तुरंत करें",
  sosStepsTitle: "एक-एक कदम",
  sosStep1: "बैंक को कॉल करें और कार्ड / UPI ब्लॉक करें",
  sosStep2: "मैसेज और पेमेंट के स्क्रीनशॉट लें",
  sosStep3: "अपने पासवर्ड और UPI PIN बदलें",
  sosStep4: "1930 और cybercrime.gov.in पर शिकायत करें",
  sosPortalTitle: "ऑनलाइन शिकायत",
  sosPortalBtn: "cybercrime.gov.in खोलें",

  loading: "लोड हो रहा है…",
  retryBtn: "फिर कोशिश करें",
  errorGeneric: "कुछ गड़बड़ हो गई",
  noConnection: "आप ऑफलाइन हैं। सेव किया हुआ दिखा रहे हैं।",
};

export default hi;
