// Multilingual support for the AI module
// Privacy-first: all translations are local

export type Language = 'en' | 'es' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'gu';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', direction: 'ltr' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', direction: 'ltr' },
];

// Translation keys
type TranslationKey = 
  | 'disclaimer'
  | 'notMedicalAdvice'
  | 'privacyNote'
  | 'engagementScore'
  | 'driftLevel'
  | 'trend'
  | 'improving'
  | 'stable'
  | 'declining'
  | 'none'
  | 'mild'
  | 'moderate'
  | 'significant'
  | 'nudgeTitle'
  | 'planMode'
  | 'fullPlan'
  | 'reducedPlan'
  | 'lightPlan'
  | 'safetyTasksNote'
  | 'viewDetails'
  | 'dismiss'
  | 'logNow'
  | 'adjustPlan'
  | 'exportData'
  | 'behavioralInsights'
  | 'weeklyTrend'
  | 'adaptivePlan'
  | 'yourNudges'
  | 'noNudges'
  | 'lastUpdated'
  | 'daysAnalyzed'
  | 'tasksActive'
  | 'autoRestore';

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    disclaimer: 'This is not medical advice',
    notMedicalAdvice: 'For informational purposes only. Always consult your healthcare provider.',
    privacyNote: 'Your data stays on your device. Nothing is shared.',
    engagementScore: 'Engagement Score',
    driftLevel: 'Pattern Status',
    trend: 'Trend',
    improving: 'Improving',
    stable: 'Stable',
    declining: 'Declining',
    none: 'On Track',
    mild: 'Slight Change',
    moderate: 'Noticeable Change',
    significant: 'Needs Attention',
    nudgeTitle: 'Gentle Reminders',
    planMode: 'Care Plan Mode',
    fullPlan: 'Full Plan',
    reducedPlan: 'Balanced Mode',
    lightPlan: 'Light Mode',
    safetyTasksNote: 'Safety tasks are never reduced',
    viewDetails: 'View Details',
    dismiss: 'Dismiss',
    logNow: 'Log Now',
    adjustPlan: 'Adjust Plan',
    exportData: 'Export Data',
    behavioralInsights: 'Behavioral Insights',
    weeklyTrend: 'Weekly Trend',
    adaptivePlan: 'Adaptive Care Plan',
    yourNudges: 'Your Nudges',
    noNudges: 'No nudges right now. Great job!',
    lastUpdated: 'Last updated',
    daysAnalyzed: 'days analyzed',
    tasksActive: 'tasks active',
    autoRestore: 'Auto-restore check',
  },
  es: {
    disclaimer: 'Esto no es consejo médico',
    notMedicalAdvice: 'Solo con fines informativos. Siempre consulte a su médico.',
    privacyNote: 'Sus datos permanecen en su dispositivo. Nada se comparte.',
    engagementScore: 'Puntuación de Compromiso',
    driftLevel: 'Estado del Patrón',
    trend: 'Tendencia',
    improving: 'Mejorando',
    stable: 'Estable',
    declining: 'Disminuyendo',
    none: 'En Camino',
    mild: 'Cambio Leve',
    moderate: 'Cambio Notable',
    significant: 'Necesita Atención',
    nudgeTitle: 'Recordatorios Suaves',
    planMode: 'Modo del Plan',
    fullPlan: 'Plan Completo',
    reducedPlan: 'Modo Equilibrado',
    lightPlan: 'Modo Ligero',
    safetyTasksNote: 'Las tareas de seguridad nunca se reducen',
    viewDetails: 'Ver Detalles',
    dismiss: 'Descartar',
    logNow: 'Registrar Ahora',
    adjustPlan: 'Ajustar Plan',
    exportData: 'Exportar Datos',
    behavioralInsights: 'Información de Comportamiento',
    weeklyTrend: 'Tendencia Semanal',
    adaptivePlan: 'Plan de Cuidado Adaptativo',
    yourNudges: 'Tus Recordatorios',
    noNudges: 'Sin recordatorios ahora. ¡Buen trabajo!',
    lastUpdated: 'Última actualización',
    daysAnalyzed: 'días analizados',
    tasksActive: 'tareas activas',
    autoRestore: 'Verificación de restauración automática',
  },
  hi: {
    disclaimer: 'यह चिकित्सा सलाह नहीं है',
    notMedicalAdvice: 'केवल जानकारी के लिए। हमेशा अपने डॉक्टर से परामर्श लें।',
    privacyNote: 'आपका डेटा आपके डिवाइस पर रहता है। कुछ भी साझा नहीं किया जाता।',
    engagementScore: 'सहभागिता स्कोर',
    driftLevel: 'पैटर्न स्थिति',
    trend: 'रुझान',
    improving: 'सुधार हो रहा है',
    stable: 'स्थिर',
    declining: 'कम हो रहा है',
    none: 'सही राह पर',
    mild: 'हल्का बदलाव',
    moderate: 'ध्यान देने योग्य बदलाव',
    significant: 'ध्यान देने की जरूरत',
    nudgeTitle: 'कोमल याद दिलाना',
    planMode: 'देखभाल योजना मोड',
    fullPlan: 'पूर्ण योजना',
    reducedPlan: 'संतुलित मोड',
    lightPlan: 'हल्का मोड',
    safetyTasksNote: 'सुरक्षा कार्य कभी कम नहीं होते',
    viewDetails: 'विवरण देखें',
    dismiss: 'खारिज करें',
    logNow: 'अभी लॉग करें',
    adjustPlan: 'योजना समायोजित करें',
    exportData: 'डेटा निर्यात करें',
    behavioralInsights: 'व्यवहार संबंधी जानकारी',
    weeklyTrend: 'साप्ताहिक रुझान',
    adaptivePlan: 'अनुकूली देखभाल योजना',
    yourNudges: 'आपके रिमाइंडर',
    noNudges: 'अभी कोई रिमाइंडर नहीं। बहुत बढ़िया!',
    lastUpdated: 'अंतिम अपडेट',
    daysAnalyzed: 'दिन विश्लेषित',
    tasksActive: 'कार्य सक्रिय',
    autoRestore: 'ऑटो-रिस्टोर जांच',
  },
  ta: {
    disclaimer: 'இது மருத்துவ ஆலோசனை அல்ல',
    notMedicalAdvice: 'தகவல் நோக்கங்களுக்கு மட்டுமே. எப்போதும் உங்கள் மருத்துவரை அணுகவும்.',
    privacyNote: 'உங்கள் தரவு உங்கள் சாதனத்தில் இருக்கும். எதுவும் பகிரப்படாது.',
    engagementScore: 'ஈடுபாட்டு மதிப்பெண்',
    driftLevel: 'முறை நிலை',
    trend: 'போக்கு',
    improving: 'மேம்படுகிறது',
    stable: 'நிலையான',
    declining: 'குறைகிறது',
    none: 'சரியான பாதையில்',
    mild: 'சிறிய மாற்றம்',
    moderate: 'குறிப்பிடத்தக்க மாற்றம்',
    significant: 'கவனம் தேவை',
    nudgeTitle: 'மென்மையான நினைவூட்டல்கள்',
    planMode: 'பராமரிப்பு திட்ட முறை',
    fullPlan: 'முழு திட்டம்',
    reducedPlan: 'சமநிலை முறை',
    lightPlan: 'இலகு முறை',
    safetyTasksNote: 'பாதுகாப்பு பணிகள் குறைக்கப்படாது',
    viewDetails: 'விவரங்களைக் காண்க',
    dismiss: 'நிராகரிக்க',
    logNow: 'இப்போது பதிவு செய்',
    adjustPlan: 'திட்டத்தை சரிசெய்',
    exportData: 'தரவை ஏற்றுமதி செய்',
    behavioralInsights: 'நடத்தை நுண்ணறிவுகள்',
    weeklyTrend: 'வாராந்திர போக்கு',
    adaptivePlan: 'தகவமைப்பு பராமரிப்பு திட்டம்',
    yourNudges: 'உங்கள் நினைவூட்டல்கள்',
    noNudges: 'இப்போது நினைவூட்டல்கள் இல்லை. நல்ல வேலை!',
    lastUpdated: 'கடைசியாக புதுப்பிக்கப்பட்டது',
    daysAnalyzed: 'நாட்கள் பகுப்பாய்வு செய்யப்பட்டன',
    tasksActive: 'பணிகள் செயலில்',
    autoRestore: 'தானியங்கி மீட்டமைப்பு சரிபார்ப்பு',
  },
  te: {
    disclaimer: 'ఇది వైద్య సలహా కాదు',
    notMedicalAdvice: 'సమాచార ప్రయోజనాల కోసం మాత్రమే. ఎల్లప్పుడూ మీ వైద్యుడిని సంప్రదించండి.',
    privacyNote: 'మీ డేటా మీ పరికరంలో ఉంటుంది. ఏమీ షేర్ చేయబడదు.',
    engagementScore: 'నిమగ్నత స్కోర్',
    driftLevel: 'నమూనా స్థితి',
    trend: 'ధోరణి',
    improving: 'మెరుగుపడుతోంది',
    stable: 'స్థిరంగా',
    declining: 'తగ్గుతోంది',
    none: 'సరైన మార్గంలో',
    mild: 'స్వల్ప మార్పు',
    moderate: 'గమనించదగిన మార్పు',
    significant: 'దృష్టి అవసరం',
    nudgeTitle: 'మృదువైన రిమైండర్లు',
    planMode: 'సంరక్షణ ప్లాన్ మోడ్',
    fullPlan: 'పూర్తి ప్లాన్',
    reducedPlan: 'సమతుల్య మోడ్',
    lightPlan: 'తేలికపాటి మోడ్',
    safetyTasksNote: 'భద్రతా పనులు ఎప్పుడూ తగ్గించబడవు',
    viewDetails: 'వివరాలు చూడండి',
    dismiss: 'తీసివేయండి',
    logNow: 'ఇప్పుడు లాగ్ చేయండి',
    adjustPlan: 'ప్లాన్ సవరించండి',
    exportData: 'డేటా ఎగుమతి చేయండి',
    behavioralInsights: 'ప్రవర్తన అంతర్దృష్టులు',
    weeklyTrend: 'వారపు ధోరణి',
    adaptivePlan: 'అనుకూల సంరక్షణ ప్లాన్',
    yourNudges: 'మీ రిమైండర్లు',
    noNudges: 'ఇప్పుడు రిమైండర్లు లేవు. మంచి పని!',
    lastUpdated: 'చివరిగా నవీకరించబడింది',
    daysAnalyzed: 'రోజులు విశ్లేషించబడ్డాయి',
    tasksActive: 'పనులు చురుకుగా ఉన్నాయి',
    autoRestore: 'ఆటో-పునరుద్ధరణ తనిఖీ',
  },
  bn: {
    disclaimer: 'এটি চিকিৎসা পরামর্শ নয়',
    notMedicalAdvice: 'শুধুমাত্র তথ্যের উদ্দেশ্যে। সবসময় আপনার ডাক্তারের সাথে পরামর্শ করুন।',
    privacyNote: 'আপনার ডেটা আপনার ডিভাইসে থাকে। কিছুই শেয়ার করা হয় না।',
    engagementScore: 'এনগেজমেন্ট স্কোর',
    driftLevel: 'প্যাটার্ন স্ট্যাটাস',
    trend: 'প্রবণতা',
    improving: 'উন্নতি হচ্ছে',
    stable: 'স্থিতিশীল',
    declining: 'হ্রাস পাচ্ছে',
    none: 'সঠিক পথে',
    mild: 'সামান্য পরিবর্তন',
    moderate: 'লক্ষণীয় পরিবর্তন',
    significant: 'মনোযোগ প্রয়োজন',
    nudgeTitle: 'মৃদু অনুস্মারক',
    planMode: 'কেয়ার প্ল্যান মোড',
    fullPlan: 'সম্পূর্ণ পরিকল্পনা',
    reducedPlan: 'ভারসাম্য মোড',
    lightPlan: 'হালকা মোড',
    safetyTasksNote: 'নিরাপত্তা কাজ কখনো কমানো হয় না',
    viewDetails: 'বিস্তারিত দেখুন',
    dismiss: 'বাতিল',
    logNow: 'এখনই লগ করুন',
    adjustPlan: 'পরিকল্পনা সামঞ্জস্য করুন',
    exportData: 'ডেটা এক্সপোর্ট করুন',
    behavioralInsights: 'আচরণগত অন্তর্দৃষ্টি',
    weeklyTrend: 'সাপ্তাহিক প্রবণতা',
    adaptivePlan: 'অভিযোজিত কেয়ার প্ল্যান',
    yourNudges: 'আপনার অনুস্মারক',
    noNudges: 'এখন কোনো অনুস্মারক নেই। চমৎকার কাজ!',
    lastUpdated: 'সর্বশেষ আপডেট',
    daysAnalyzed: 'দিন বিশ্লেষণ করা হয়েছে',
    tasksActive: 'কাজ সক্রিয়',
    autoRestore: 'অটো-রিস্টোর চেক',
  },
  mr: {
    disclaimer: 'हा वैद्यकीय सल्ला नाही',
    notMedicalAdvice: 'केवळ माहितीसाठी। नेहमी आपल्या डॉक्टरांचा सल्ला घ्या।',
    privacyNote: 'तुमचा डेटा तुमच्या डिव्हाइसवर राहतो। काहीही शेअर केले जात नाही।',
    engagementScore: 'सहभाग स्कोअर',
    driftLevel: 'पॅटर्न स्थिती',
    trend: 'कल',
    improving: 'सुधारत आहे',
    stable: 'स्थिर',
    declining: 'कमी होत आहे',
    none: 'योग्य मार्गावर',
    mild: 'किंचित बदल',
    moderate: 'लक्षणीय बदल',
    significant: 'लक्ष देणे आवश्यक',
    nudgeTitle: 'सौम्य स्मरणपत्रे',
    planMode: 'केअर प्लॅन मोड',
    fullPlan: 'पूर्ण योजना',
    reducedPlan: 'संतुलित मोड',
    lightPlan: 'हलका मोड',
    safetyTasksNote: 'सुरक्षा कार्ये कधीही कमी केली जात नाहीत',
    viewDetails: 'तपशील पहा',
    dismiss: 'डिसमिस करा',
    logNow: 'आता लॉग करा',
    adjustPlan: 'योजना समायोजित करा',
    exportData: 'डेटा एक्सपोर्ट करा',
    behavioralInsights: 'वर्तणूक अंतर्दृष्टी',
    weeklyTrend: 'साप्ताहिक कल',
    adaptivePlan: 'अनुकूल केअर प्लॅन',
    yourNudges: 'तुमची स्मरणपत्रे',
    noNudges: 'आता स्मरणपत्रे नाहीत। छान काम!',
    lastUpdated: 'शेवटचे अद्यतन',
    daysAnalyzed: 'दिवस विश्लेषित',
    tasksActive: 'कार्ये सक्रिय',
    autoRestore: 'ऑटो-रिस्टोर तपासणी',
  },
  gu: {
    disclaimer: 'આ તબીબી સલાહ નથી',
    notMedicalAdvice: 'માત્ર માહિતી માટે। હંમેશા તમારા ડૉક્ટરની સલાહ લો।',
    privacyNote: 'તમારો ડેટા તમારા ડિવાઇસ પર રહે છે। કંઈ શેર થતું નથી।',
    engagementScore: 'સહભાગિતા સ્કોર',
    driftLevel: 'પેટર્ન સ્થિતિ',
    trend: 'વલણ',
    improving: 'સુધારો થઈ રહ્યો છે',
    stable: 'સ્થિર',
    declining: 'ઘટી રહ્યો છે',
    none: 'સાચા માર્ગ પર',
    mild: 'થોડો ફેરફાર',
    moderate: 'નોંધપાત્ર ફેરફાર',
    significant: 'ધ્યાન આપવાની જરૂર',
    nudgeTitle: 'નરમ યાદ અપાવવાઓ',
    planMode: 'કેર પ્લાન મોડ',
    fullPlan: 'સંપૂર્ણ યોજના',
    reducedPlan: 'સંતુલિત મોડ',
    lightPlan: 'હળવો મોડ',
    safetyTasksNote: 'સલામતી કાર્યો ક્યારેય ઘટાડવામાં આવતા નથી',
    viewDetails: 'વિગતો જુઓ',
    dismiss: 'રદ કરો',
    logNow: 'હમણાં લોગ કરો',
    adjustPlan: 'યોજના સમાયોજિત કરો',
    exportData: 'ડેટા નિકાસ કરો',
    behavioralInsights: 'વર્તન આંતરદૃષ્ટિ',
    weeklyTrend: 'સાપ્તાહિક વલણ',
    adaptivePlan: 'અનુકૂલનશીલ કેર પ્લાન',
    yourNudges: 'તમારા રીમાઇન્ડર્સ',
    noNudges: 'હમણાં કોઈ રીમાઇન્ડર્સ નથી। સરસ કામ!',
    lastUpdated: 'છેલ્લે અપડેટ',
    daysAnalyzed: 'દિવસો વિશ્લેષિત',
    tasksActive: 'કાર્યો સક્રિય',
    autoRestore: 'ઓટો-રિસ્ટોર તપાસ',
  },
};

// Translation function
export function t(key: TranslationKey, language: Language = 'en'): string {
  return translations[language]?.[key] || translations['en'][key] || key;
}

// Get all translations for a language
export function getAllTranslations(language: Language): Record<TranslationKey, string> {
  return translations[language] || translations['en'];
}

// Check if language is supported
export function isLanguageSupported(code: string): code is Language {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
}

// Get language info
export function getLanguageInfo(code: Language): LanguageInfo | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}
