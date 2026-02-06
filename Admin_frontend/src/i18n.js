import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            admin: {
                navbar: {
                    brand: "Ankese Birhan Senbet Sunday School",
                    home: "Home",
                    about: "About",
                    contact: "Contact",
                    messages: "Messages",
                    users: "User Management",
                    attendance: "Attendance",
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
                        actions: "Actions",
                        view: "View Detail",
                        import: "Import from External",
                        deleteAll: "Delete all user",
                        delete: "Delete"
                    },
                    filter: {
                        all: "All Status",
                        pending: "Pending",
                        approved: "Approved",
                        rejected: "Rejected"
                    },
                    details: {
                        title: "Student Details",
                        name: "Full Name",
                        christianName: "Christian Name",
                        email: "Email Address",
                        phone: "Phone Number",
                        sex: "Sex",
                        nationalId: "National ID",
                        dob: "Date of Birth",
                        serviceStatus: "Previous Service",
                        previousChurch: "Previous Church",
                        regDate: "Registration Date",
                        close: "Close"
                    },
                    import: {
                        selecting: "Selecting file...",
                        uploading: "Importing members...",
                        success: "Successfully imported {{count}} members!",
                        error: "Import failed. Please check the file format."
                    },
                    delete: {
                        all: "Delete All Students",
                        single: "Delete Student",
                        confirm: "Are you sure you want to delete ALL registered students? This action cannot be undone.",
                        confirmSingle: "Are you sure you want to delete {{name}}? This action cannot be undone.",
                        success: "All students have been successfully deleted.",
                        successSingle: "Student has been successfully deleted.",
                        error: "Failed to delete all students.",
                        errorSingle: "Failed to delete student."
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
                },
                attendance: {
                    title: "Attendance Management",
                    subtitle: "Record and track student attendance",
                    markAttendance: "Mark Attendance",
                    date: "Select Date",
                    studentName: "Student Name",
                    christianName: "Christian Name",
                    status: "Status",
                    present: "Present",
                    absent: "Absent",
                    permission: "Permission",
                    save: "Save Attendance",
                    success: "Attendance recorded successfully!",
                    error: "Failed to record attendance."
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
                    about: "ስለ እኛ",
                    contact: "ያግኙን",
                    messages: "መልዕክቶች",
                    users: "የተጠቃሚዎች አስተዳደር",
                    attendance: "የአባላት ክትትል",
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
                        actions: "ተግባራት",
                        view: "ዝርዝር ተመልከት",
                        import: "ከፋይል አስገባ",
                        deleteAll: "ሁሉንም ተጠቃሚዎች አጥፋ",
                        delete: "አጥፋ"
                    },
                    filter: {
                        all: "ሁሉም ሁኔታ",
                        pending: "በጥበቃ ላይ",
                        approved: "የጸደቀ",
                        rejected: "ውድቅ የተደረገ"
                    },
                    details: {
                        title: "የተማሪ ዝርዝር መረጃ",
                        name: "ሙሉ ስም",
                        christianName: "የክርስትና ስም",
                        email: "የኢሜይል አድራሻ",
                        phone: "ስልክ ቁጥር",
                        sex: "ጾታ",
                        nationalId: "ብሄራዊ መታወቂያ",
                        dob: "የትውልድ ቀን",
                        serviceStatus: "የቀድሞ አገልግሎት",
                        previousChurch: "የቀድሞው ቤተክርስቲያን",
                        regDate: "የምዝገባ ቀን",
                        close: "ዝጋ"
                    },
                    import: {
                        selecting: "ፋይል እየተመረጠ ነው...",
                        uploading: "አባላትን በማስገባት ላይ...",
                        success: "በተሳካ ሁኔታ {{count}} አባላት ገብተዋል!",
                        error: "ማስገባት አልተቻለም። እባክዎ የፋይል ቅርጸቱን ያረጋግጡ።"
                    },
                    delete: {
                        all: "ሁሉንም ተማሪዎች አጥፋ",
                        single: "ተማሪውን አጥፋ",
                        confirm: "እርግጠኛ ነዎት ሁሉንም የተመዘገቡ ተማሪዎችን ማጥፋት ይፈልጋሉ? ይህ ድርጊት ሊመለስ አይችልም።",
                        confirmSingle: "እርግጠኛ ነዎት {{name}}ን ማጥፋት ይፈልጋሉ? ይህ ድርጊት ሊመለስ አይችልም።",
                        success: "ሁሉም ተማሪዎች በተሳካ ሁኔታ ተጥፈዋል።",
                        successSingle: "ተማሪው በተሳካ ሁኔታ ተሰርዙዋል።",
                        error: "ሁሉንም ተማሪዎች ማጥፋት አልተቻለም።",
                        errorSingle: "ተማሪውን ማጥፋት አልተቻለም።"
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
                },
                attendance: {
                    title: "የአባላት ክትትል አስተዳደር",
                    subtitle: "የተማሪዎችን ክትትል ይመዝግቡ እና ይከታተሉ",
                    markAttendance: "ክትትል ይሙሉ",
                    date: "ቀን ይምረጡ",
                    studentName: "የተማሪ ስም",
                    christianName: "ክርስትና ስም",
                    status: "ሁኔታ",
                    present: "ተገኝቷል",
                    absent: "አልተገኘም",
                    permission: "ፈቃድ",
                    save: "ክትትል አስቀምጥ",
                    success: "ክትትል በተሳካ ሁኔታ ተመዝግቧል!",
                    error: "ክትትል መመዝገብ አልተሳካም።"
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
