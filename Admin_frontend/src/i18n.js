import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            admin: {
                navbar: {
                    brand: "Ankese Birhan Senbet Sunday School",
                    home: "Home",
                    contact: "Contact",
                    messages: "Messages",
                    users: "User Management",
                    news: "Information",
                    profile: "Profile",
                    signIn: "Sign In",
                    logout: "Logout"
                },
                home: {
                    title: "Admin Dashboard",
                    subtitle: "Ankese Birhan Senbet Sunday School Management",
                    stats: {
                        students: "Total Students",
                        teachers: "Total Teachers",
                        classes: "Active Classes"
                    }
                },
                contact: {
                    title: "Contact Support",
                    subtitle: "Send us a message for technical support or inquiries",
                    name: "Name",
                    email: "Email",
                    message: "Message",
                    namePlaceholder: "Your Name",
                    emailPlaceholder: "admin@example.com",
                    messagePlaceholder: "How can we help?",
                    send: "Send Message",
                    sending: "Sending...",
                    successMessage: "Message sent successfully!",
                    errorMessage: "Failed to send message. Please try again."
                },
                signin: {
                    title: "Admin Sign In",
                    email: "Email",
                    password: "Password",
                    button: "Sign In"
                },
                messages: {
                    title: "Messages Inbox",
                    subtitle: "Manage feedback and inquiries from users",
                    name: "From",
                    email: "Email",
                    date: "Date",
                    status: "Status",
                    action: "Action",
                    read: "Read",
                    unread: "Unread",
                    markRead: "Mark as Read",
                    noMessages: "No messages found.",
                    source: "Source"
                },
                usermanagement: {
                    title: "User Management",
                    subtitle: "Manage Sunday School registrations",
                    placeholder: {
                        search: "Search by name or email..."
                    },
                    table: {
                        name: "Name",
                        christianName: "Christian Name",
                        contact: "Contact",
                        regDate: "Reg. Date",
                        status: "Status",
                        actions: "Actions"
                    }
                },
                profile: {
                    title: "Profile",
                    subtitle: "Manage your account security and info",
                    accountInfo: "Account Details",
                    email: "Email",
                    updateInfo: "Save Changes",
                    changePassword: "Change Password",
                    currentPassword: "Current Password",
                    newPassword: "New Password",
                    confirmPassword: "Confirm Password",
                    updatePassword: "Update Password",
                    successInfo: "Profile updated successfully!",
                    successPassword: "Password changed successfully!",
                    passwordMismatch: "Passwords do not match!"
                }
            }
        }
    },
    am: {
        translation: {
            admin: {
                navbar: {
                    brand: "አንቀፀ ብርሃን ሰንበት ት/ቤት",
                    home: "ዋና ገጽ",
                    contact: "ያግኙን",
                    messages: "መልዕክቶች",
                    users: "የተጠቃሚዎች አስተዳደር",
                    news: "መረጃዎች",
                    profile: "መገለጫ",
                    signIn: "ይግቡ",
                    logout: "ውጣ"
                },
                home: {
                    title: "የአስተዳዳሪ ዳሽቦርድ",
                    subtitle: "የአንቀፀ ብርሃን ሰንበት ትምህርት ቤት አስተዳደር",
                    stats: {
                        students: "ጠቅላላ ተማሪዎች",
                        teachers: "ጠቅላላ መምህራን",
                        classes: "ንቁ ክፍሎች"
                    }
                },
                contact: {
                    title: "ድጋፍ ያግኙ",
                    subtitle: "ለቴክኒክ ድጋፍ ወይም ለጥያቄዎች መልዕክት ይላኩልን",
                    name: "ስም",
                    email: "ኢሜይል",
                    message: "መልዕክት",
                    namePlaceholder: "ስምዎ",
                    emailPlaceholder: "admin@example.com",
                    messagePlaceholder: "እንዴት እንረዳዎ?",
                    send: "መልዕክት ይላኩ",
                    sending: "በመላክ ላይ...",
                    successMessage: "መልዕክት በተሳካ ሁኔታ ተልኳል!",
                    errorMessage: "መልዕክት መላክ አልተሳካም። እባክዎ እንደገና ይሞክሩ።"
                },
                signin: {
                    title: "የአስተዳዳሪ መግቢያ",
                    email: "ኢሜይል",
                    password: "የይለፍ ቃል",
                    button: "ይግቡ"
                },
                messages: {
                    title: "የመልዕክት ሳጥን",
                    subtitle: "ከተጠቃሚዎች የሚመጡ አስተያየቶችን እና ጥያቄዎችን ያስተዳድሩ",
                    name: "ከ",
                    email: "ኢሜይል",
                    date: "ቀን",
                    status: "ሁኔታ",
                    action: "ተግባር",
                    read: "የተነበበ",
                    unread: "ያልተነበበ",
                    markRead: "እንደተነበበ ምልክት አድርግ",
                    noMessages: "ምንም መልዕክት የለም።",
                    source: "ምንጭ"
                },
                usermanagement: {
                    title: "የተጠቃሚዎች አስተዳደር",
                    subtitle: "የሰንበት ትምህርት ቤት ምዝገባዎችን ያስተዳድሩ",
                    placeholder: {
                        search: "በስም ወይም በኢሜይል ይፈልጉ..."
                    },
                    table: {
                        name: "ስም",
                        christianName: "ክርስትና ስም",
                        contact: "አድራሻ",
                        regDate: "የምዝገባ ቀን",
                        status: "ሁኔታ",
                        actions: "ተግባራት"
                    }
                },
                profile: {
                    title: "መገለጫ",
                    subtitle: "የመለያዎን ደህንነት እና መረጃ ያስተዳድሩ",
                    accountInfo: "የመለያ ዝርዝሮች",
                    email: "ኢሜይል",
                    updateInfo: "ለውጦችን አስቀምጥ",
                    changePassword: "የይለፍ ቃል ይቀይሩ",
                    currentPassword: "የአሁኑ የይለፍ ቃል",
                    newPassword: "አዲስ የይለፍ ቃል",
                    confirmPassword: "የይለፍ ቃል ያረጋግጡ",
                    updatePassword: "የይለፍ ቃል አዘምን",
                    successInfo: "መገለጫ በተሳካ ሁኔታ ተዘምኗል!",
                    successPassword: "የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል!",
                    passwordMismatch: "የይለፍ ቃላቱ አይጣጣሙም!"
                }
            }
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
