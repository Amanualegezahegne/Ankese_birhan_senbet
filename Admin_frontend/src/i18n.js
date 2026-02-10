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
                    users: "Student Management",
                    attendance: "Attendance",
                    courses: "Course Management",
                    news: "Information",
                    profile: "Profile",
                    settings: "Settings",
                    results: "Courses and Results",
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
                settings: {
                    title: "Settings",
                    subtitle: "Manage your account and preferences",
                    profileSection: "Profile Settings",
                    preferencesSection: "Preferences",
                    accountInfo: "Account Information",
                    email: "Email",
                    updateInfo: "Update Information",
                    changePassword: "Change Password",
                    currentPassword: "Current Password",
                    newPassword: "New Password",
                    confirmPassword: "Confirm Password",
                    updatePassword: "Update Password",
                    languageLabel: "Language",
                    languageDesc: "Choose your preferred language",
                    themeLabel: "Theme",
                    themeDesc: "Choose between light and dark mode",
                    lightMode: "Light Mode",
                    darkMode: "Dark Mode",
                    successInfo: "Account information updated successfully!",
                    successPassword: "Password changed successfully!",
                    passwordMismatch: "Passwords do not match!",
                    languageChanged: "Language changed successfully!",
                    themeChanged: "Theme changed successfully!"
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
                    title: "Student Management",
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
                teachermanagement: {
                    title: "Teacher Management",
                    subtitle: "Manage Sunday School teachers",
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
                        import: "Import Teachers",
                        deleteAll: "Delete all teachers",
                        delete: "Delete"
                    },
                    filter: {
                        all: "All Status",
                        pending: "Pending",
                        approved: "Approved",
                        rejected: "Rejected"
                    },
                    details: {
                        title: "Teacher Details",
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
                        uploading: "Importing teachers...",
                        success: "Successfully imported {{count}} teachers!",
                        error: "Import failed. Please check the file format."
                    },
                    delete: {
                        all: "Delete All Teachers",
                        single: "Delete Teacher",
                        confirm: "Are you sure you want to delete ALL registered teachers? This action cannot be undone.",
                        confirmSingle: "Are you sure you want to delete {{name}}? This action cannot be undone.",
                        success: "All teachers have been successfully deleted.",
                        successSingle: "Teacher has been successfully deleted.",
                        error: "Failed to delete all teachers.",
                        errorSingle: "Failed to delete teacher."
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
                },
                coursemanagement: {
                    title: "Course Management",
                    subtitle: "Define and manage Sunday School courses",
                    addCourse: "Add New Course",
                    editCourse: "Edit Course",
                    titleLabel: "Course Title",
                    descLabel: "Description",
                    saveCourse: "Save Course",
                    successAdd: "Course added successfully!",
                    successUpdate: "Course updated successfully!",
                    successDelete: "Course deleted successfully!",
                    confirmDelete: "Are you sure you want to delete this course?",
                    noCourses: "No courses found. Please add some."
                },
                results: {
                    title: "Courses and Results",
                    subtitle: "View and manage student grades across all courses",
                    course: "Course",
                    semester: "Semester",
                    year: "Year",
                    semester1: "1st Semester",
                    semester2: "2nd Semester",
                    score: "Score",
                    comment: "Comment",
                    action: "Action",
                    errorFetchStudents: "Error fetching student list",
                    errorFetchGrades: "Error loading grades",
                    errorSave: "Error saving grades",
                    saveAll: "Save All Changes",
                    successSave: "All grades saved successfully",
                    studentName: "Student Name",
                    noStudents: "No students found",
                    loading: "Loading..."
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
                    users: "የተማሪዎች አስተዳደር",
                    attendance: "የአባላት ክትትል",
                    courses: "የትምህርት አይነቶች አስተዳደር",
                    news: "መረጃዎች",
                    profile: "መገለጫ",
                    settings: "ቅንብሮች",
                    results: "የትምህርት ውጤቶች",
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
                settings: {
                    title: "ቅንብሮች",
                    subtitle: "የእርስዎን መለያ እና ምርጫዎች ያስተዳድሩ",
                    profileSection: "የመገለጫ ቅንብሮች",
                    preferencesSection: "ምርጫዎች",
                    accountInfo: "የመለያ መረጃ",
                    email: "ኢሜይል",
                    updateInfo: "መረጃ አዘምን",
                    changePassword: "የይለፍ ቃል ይቀይሩ",
                    currentPassword: "የአሁኑ የይለፍ ቃል",
                    newPassword: "አዲስ የይለፍ ቃል",
                    confirmPassword: "የይለፍ ቃል ያረጋግጡ",
                    updatePassword: "የይለፍ ቃል አዘምን",
                    languageLabel: "ቋንቋ",
                    languageDesc: "የሚመርጡትን ቋንቋ ይምረጡ",
                    themeLabel: "ገጽታ",
                    themeDesc: "በብርሃን እና በጨለማ ሁነታ መካከል ይምረጡ",
                    lightMode: "የብርሃን ሁነታ",
                    darkMode: "የጨለማ ሁነታ",
                    successInfo: "የመለያ መረጃ በተሳካ ሁኔታ ተዘምኗል!",
                    successPassword: "የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል!",
                    passwordMismatch: "የይለፍ ቃሎች አይዛመዱም!",
                    languageChanged: "ቋንቋ በተሳካ ሁኔታ ተቀይሯል!",
                    themeChanged: "ገጽታ በተሳካ ሁኔታ ተቀይሯል!"
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
                    title: "የተማሪዎች አስተዳደር",
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
                teachermanagement: {
                    title: "የመምህራን አስተዳደር",
                    subtitle: "የሰንበት ትምህርት ቤት መምህራንን ያስተዳድሩ",
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
                        deleteAll: "ሁሉንም መምህራን አጥፋ",
                        delete: "አጥፋ"
                    },
                    filter: {
                        all: "ሁሉም ሁኔታ",
                        pending: "በጥበቃ ላይ",
                        approved: "የጸደቀ",
                        rejected: "ውድቅ የተደረገ"
                    },
                    details: {
                        title: "የመምህር ዝርዝር መረጃ",
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
                        uploading: "መምህራንን በማስገባት ላይ...",
                        success: "በተሳካ ሁኔታ {{count}} መምህራን ገብተዋል!",
                        error: "ማስገባት አልተቻለም። እባክዎ የፋይል ቅርጸቱን ያረጋግጡ።"
                    },
                    delete: {
                        all: "ሁሉንም መምህራን አጥፋ",
                        single: "መምህሩን አጥፋ",
                        confirm: "እርግጠኛ ነዎት ሁሉንም የተመዘገቡ መምህራንን ማጥፋት ይፈልጋሉ? ይህ ድርጊት ሊመለስ አይችልም።",
                        confirmSingle: "እርግጠኛ ነዎት {{name}}ን ማጥፋት ይፈልጋሉ? ይህ ድርጊት ሊመለስ አይችልም።",
                        success: "ሁሉም መምህራን በተሳካ ሁኔታ ተጥፈዋል።",
                        successSingle: "መምህሩ በተሳካ ሁኔታ ተሰርዘዋል።",
                        error: "ሁሉንም መምህራን ማጥፋት አልተቻለም።",
                        errorSingle: "መምህሩን ማጥፋት አልተቻለም።"
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
                },
                coursemanagement: {
                    title: "የትምህርት አይነቶች አስተዳደር",
                    subtitle: "የሰንበት ትምህርት ቤት የትምህርት አይነቶችን ይግለጹ እና ያስተዳድሩ",
                    addCourse: "አዲስ የትምህርት አይነት ጨምር",
                    editCourse: "የትምህርት አይነት አርም",
                    titleLabel: "የትምህርት አይነት ስም",
                    descLabel: "መግለጫ",
                    saveCourse: "አስቀምጥ",
                    successAdd: "የትምህርት አይነቱ በተሳካ ሁኔታ ገብቷል!",
                    successUpdate: "የትምህርት አይነቱ በተሳካ ሁኔታ ተስተካክሏል!",
                    successDelete: "የትምህርት አይነቱ ተሰርዟል!",
                    confirmDelete: "ይህን የትምህርት አይነት ማጥፋት ይፈልጋሉ?",
                    noCourses: "ምንም የትምህርት አይነቶች አልተገኙም። እባክዎ ጥቂት ይጨምሩ።"
                },
                results: {
                    title: "የትምህርት ውጤቶች",
                    subtitle: "የተማሪዎችን ውጤት በትምህርት አይነቶች ይከታተሉ",
                    course: "የትምህርት አይነት",
                    semester: "መንፈቅ",
                    year: "ዓመተ ምህረት",
                    semester1: "1ኛ መንፈቅ",
                    semester2: "2ኛ መንፈቅ",
                    score: "ውጤት",
                    comment: "አስተያየት",
                    action: "ተግባር",
                    errorFetchStudents: "የተማሪዎችን ዝርዝር ማግኘት አልተቻለም",
                    errorFetchGrades: "ውጤቶችን መጫን አልተቻለም",
                    errorSave: "ውጤቶችን ማስቀመጥ አልተቻለም",
                    saveAll: "ሁሉንም አስቀምጥ",
                    successSave: "ሁሉም ውጤቶች በተሳካ ሁኔታ ተቀምጠዋል",
                    studentName: "የተማሪ ስም",
                    noStudents: "ምንም ተማሪ አልተገኘም",
                    loading: "በመጫን ላይ..."
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
