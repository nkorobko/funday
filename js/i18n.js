// Locale packs, category display names, and region→language mapping.

export const I18N = {
  he: {
    dir: "rtl", lang: "he", locale: "he-IL", currency: "₪",
    tagline: "מתכננים יום כיף לצוות? הזינו פעילות, אזור, תקציב וגודל קבוצה — וקבלו הצעות מספקים",
    category: "סוג פעילות", city: "עיר / אזור", budget: "תקציב כולל (₪)", group: "גודל קבוצה",
    search: "חיפוש 🔍", results: "תוצאות", myPlans: "⭐ הימים שלי", print: "🖨️ הדפסה / שיתוף",
    all: "הכל", found: n => `${n} פעילויות נמצאו`, perPerson: "לאדם", participants: "משתתפים",
    inBudget: "✓ בתקציב", overBy: x => `חורג ב־${x}`, groupTotal: "סה״כ לקבוצה", details: "פרטים והזמנה",
    save: "⭐ שמירה", saved: "⭐ נשמר", noResults: "לא נמצאו פעילויות מתאימות 🙁<br>נסו להגדיל תקציב, לשנות אזור או לבחור ״הכל״",
    provider: "ספק", ratingLbl: "דירוג", priceLbl: "מחיר", groupRange: "גודל קבוצה",
    website: "🔗 אתר הפעילות", reviews: "⭐ ביקורות בגוגל",
    bookWa: "הזמנה ב־WhatsApp 💬", bookMail: "בקשת הזמנה במייל ✉️",
    ctaNote: "שליחת בקשת הזמנה ישירות לספק — עם פרטי הפעילות והקבוצה",
    waMsg: (a, g, b) => `שלום! אשמח להזמין את "${a.name}" ליום כיף${g ? ` לקבוצה של ${g} משתתפים` : ""}${b ? ` (תקציב: ₪${b})` : ""}. אפשר פרטים וזמינות?`,
    mailSubject: a => `בקשת הזמנה — ${a.name} (FunDay)`,
    budgetPh: "לדוגמה: 5000", groupPh: "לדוגמה: 15",
    remove: "הסרה ✕", groupOf: g => `קבוצה של ${g}`, budgetCtx: b => `תקציב ${b}`,
    closeTitle: "הצעות קרובות 👀",
    noExact: "לא נמצאו התאמות מדויקות — אבל אולי אחת מאלה תתאים:",
    missCity: c => `📍 בעיר אחרת: ${c}`,
    missCategory: c => `קטגוריה: ${c}`,
    missGroup: (mn, mx) => `מתאים ל־${mn}–${mx} משתתפים`,
    loadError: "טעינת הקטלוג נכשלה — בדקו את החיבור ונסו שוב",
    retry: "ניסיון חוזר 🔄",
    footerNote: "הקטלוג נטען מ־data/activities.json — עדכון דרך עמוד הניהול",
    adminTitle: "ניהול קטלוג — FunDay", adminAdd: "הוספת פעילות",
    adminDownload: "הורדת activities.json מעודכן", adminErrors: "שגיאות:",
    adminAdded: n => `נוספו ${n} פעילויות בטיוטה`
  },
  en: {
    dir: "ltr", lang: "en", locale: "en-US", currency: "$",
    tagline: "Planning a team fun day? Pick an activity, area, budget and group size — get matching offers from providers",
    category: "Activity type", city: "City / Area", budget: "Total budget ($)", group: "Group size",
    search: "Search 🔍", results: "Results", myPlans: "⭐ My plans", print: "🖨️ Print / Share",
    all: "All", found: n => `${n} activities found`, perPerson: "per person", participants: "participants",
    inBudget: "✓ In budget", overBy: x => `Over by ${x}`, groupTotal: "Group total", details: "Details & booking",
    save: "⭐ Save", saved: "⭐ Saved", noResults: "No matching activities 🙁<br>Try a bigger budget, another area, or \"All\"",
    provider: "Provider", ratingLbl: "Rating", priceLbl: "Price", groupRange: "Group size",
    website: "🔗 Activity website", reviews: "⭐ Google reviews",
    bookWa: "Book via WhatsApp 💬", bookMail: "Request by email ✉️",
    ctaNote: "Sends a booking request straight to the provider — with your activity and group details",
    waMsg: (a, g, b) => `Hi! I'd like to book "${a.name}" for a company fun day${g ? ` for a group of ${g}` : ""}${b ? ` (budget: $${b})` : ""}. Could you share details and availability?`,
    mailSubject: a => `Booking request — ${a.name} (FunDay)`,
    budgetPh: "e.g. 3000", groupPh: "e.g. 15",
    remove: "Remove ✕", groupOf: g => `Group of ${g}`, budgetCtx: b => `Budget ${b}`,
    closeTitle: "Close suggestions 👀",
    noExact: "No exact matches — but one of these might work:",
    missCity: c => `📍 Different city: ${c}`,
    missCategory: c => `Category: ${c}`,
    missGroup: (mn, mx) => `Fits ${mn}–${mx} participants`,
    loadError: "Failed to load the catalog — check your connection and try again",
    retry: "Retry 🔄",
    footerNote: "Catalog loads from data/activities.json — update via the admin page",
    adminTitle: "Catalog admin — FunDay", adminAdd: "Add activity",
    adminDownload: "Download updated activities.json", adminErrors: "Errors:",
    adminAdded: n => `${n} draft activities added`
  }
};

export const CATEGORY_NAMES = {
  escape_room: { he: "חדר בריחה", en: "Escape room" },
  workshop:    { he: "סדנה", en: "Workshop" },
  outdoor:     { he: "אקסטרים ושטח", en: "Outdoor & extreme" },
  food:        { he: "אוכל וקולינריה", en: "Food & culinary" },
  games:       { he: "באולינג ומשחקים", en: "Bowling & games" },
  boat:        { he: "שייט", en: "Boat cruise" },
  karaoke:     { he: "קריוקי ומוזיקה", en: "Karaoke & music" },
  tour:        { he: "סיור מודרך", en: "Guided tour" },
  sports:      { he: "ספורט", en: "Sports" }
};

export const REGION_LANG = { il: "he", dallas: "en" };
