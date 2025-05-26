// src/i18n/i18n.ts
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

// Define the shape of translation resources
interface TranslationResources {
  [language: string]: {
    [namespace: string]: {
      [key: string]: string;
    };
  };
}

// Define translation resources
const resources: TranslationResources = {
  en: {
    translation: {
      dashboard_title: 'Provider Dashboard',
      dashboard_subtitle: 'Monitor your patients and manage their nutrition.',
      dashboard_error_load: 'Failed to load dashboard. Check your network or server.',
      dashboard_loading: 'Loading dashboard...',
      session_expired: 'Your session has expired. Please log in again.',
      patients: 'Patients',
      recent_logs: 'Recent Logs',
      messages: 'Messages',
      recent_food_logs: 'Recent Food Logs',
      recent_messages: 'Recent Messages',
      quick_actions: 'Quick Actions',
      no_logs: 'No recent logs.',
      no_messages: 'No recent messages.',
      date_unavailable: 'Date unavailable',
      view_patients: 'View All Patients',
      view_recent_logs: 'See Logs',
      view_messages: 'View Messages',
      manage_patients: 'Manage Patients',
      add_resource: 'Add Resource',
      send_message: 'Send Message',
      retry: 'Retry',
    },
  },
  am: { // Amharic
    translation: {
      dashboard_title: 'የአቅራቢ ዳሽቦርድ',
      dashboard_subtitle: 'ታካሚዎችዎን ይከታተሉ እና የአመጋገብ እንክብካቤ ያድርጉ።',
      dashboard_error_load: 'ዳሽቦርድ መጫን አልተሳካም። እባክዎ ኔትወርክዎን ወይም ሰርቨርዎን ይፈትሹ።',
      dashboard_loading: 'ዳሽቦርድ በመጫን ላይ...',
      session_expired: 'የእርስዎ ጊዜ ገቢያ አልፏል። እባክዎ እንደገና ይግቡ።',
      patients: 'ታካሚዎች',
      recent_logs: 'የቅርብ ጊዜ መዝገቦች',
      messages: 'መልእክቶች',
      recent_food_logs: 'የቅርብ ጊዜ የምግብ መዝገቦች',
      recent_messages: 'የቅርብ ጊዜ መልእክቶች',
      quick_actions: 'ፈጣን ተግባራት',
      no_logs: 'ምንም የቅርብ ጊዜ መዝገቦች የሉም።',
      no_messages: 'ምንም የቅርብ ጊዜ መልእክቶች የሉም።',
      date_unavailable: 'ቀን አይገኝም',
      view_patients: 'ሁሉንም ታካሚዎች ይመልከቱ',
      view_recent_logs: 'መዝገቦችን ይመልከቱ',
      view_messages: 'መልእክቶችን ይመልከቱ',
      manage_patients: 'ታካሚዎችን ያስተዳድሩ',
      add_resource: 'መረጃ ያክሉ',
      send_message: 'መልእክት ይላኩ',
      retry: 'እንደገና ይሞክሩ',
    },
  },
  om: { // Afaan Oromo
    translation: {
      dashboard_title: 'Daashboordii Qaamaa',
      dashboard_subtitle: 'Bu’aa buufattoota keessan hordofaa fi nyaata isaanii taphachaa.',
      dashboard_error_load: 'Daashboordiin hin argamne. Network ykn server keessan hubadhaa.',
      dashboard_loading: 'Daashboordiin socho’aa jira...',
      session_expired: 'Seeshini keessan darbeera. Mee irra deebi’aa galmaa’a.',
      patients: 'Bu’aa buufattoota',
      recent_logs: 'Qabiyyee Haaraa',
      messages: 'Ergaa',
      recent_food_logs: 'Qabiyyee Nyaata Haaraa',
      recent_messages: 'Ergaa Haaraa',
      quick_actions: 'Gochaawwan Gabaabaa',
      no_logs: 'Qabiyyee haaraa hin jiru.',
      no_messages: 'Ergaa haaraa hin jiru.',
      date_unavailable: 'Guyyaa hin jiru',
      view_patients: 'Bu’aa buufattoota hunda ilaalaa',
      view_recent_logs: 'Qabiyyee ilaalaa',
      view_messages: 'Ergaa ilaalaa',
      manage_patients: 'Bu’aa buufattoota bulchaa',
      add_resource: 'Beekumsa dabalaa',
      send_message: 'Ergaa ergadhaa',
      retry: 'Irra deebi’aa yaalaa',
    },
  },
  ti: { // Tigrinya
    translation: {
      dashboard_title: 'ዳሽቦርድ ናይ መለለዪ',
      dashboard_subtitle: 'ሕሙማትካ ተከታተልን መግቢ ኣመጻጽኣን።',
      dashboard_error_load: 'ዳሽቦርድ ንምጽዓን ኣይተኻእለን። ነትወርክ ወይ ሰርቨርካ መርምር።',
      dashboard_loading: 'ዳሽቦርድ ይጽዕን ኣሎ...',
      session_expired: 'ሰሴሽንካ ግዜኡ ስለዘብቅዐ ዳግማይ ተመዝገብ።',
      patients: 'ሕሙማት',
      recent_logs: 'ሓደሽቲ መዝገባት',
      messages: 'መልእኽትታት',
      recent_food_logs: 'ሓደሽቲ መዝገባት መግቢ',
      recent_messages: 'ሓደሽቲ መልእኽትታት',
      quick_actions: 'ቅልጡፍ ተግባራት',
      no_logs: 'ሓደሽቲ መዝገባት የለዉን።',
      no_messages: 'ሓደሽቲ መልእኽትታት የለዉን።',
      date_unavailable: 'ዕለት የለን',
      view_patients: 'ኩሎም ሕሙማት ርኣ',
      view_recent_logs: 'መዝገባት ርኣ',
      view_messages: 'መልእኽትታት ርኣ',
      manage_patients: 'ሕሙማት ኣመሓድር',
      add_resource: 'ሓበሬታ ወስኽ',
      send_message: 'መልእኽቲ ስደድ',
      retry: 'ዳግማይ ፈትን',
    },
  },
};

i18next
  .use(initReactI18next) // Bind i18next to React
  .use(resourcesToBackend((language: string, namespace: string) => {
    return resources[language][namespace];
  }))
  .init({
    lng: 'en', // Default language
    fallbackLng: 'en', // Fallback language
    debug: __DEV__, // Enable debug logs in development
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18next;