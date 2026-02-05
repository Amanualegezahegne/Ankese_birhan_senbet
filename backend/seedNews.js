const mongoose = require('mongoose');
const dotenv = require('dotenv');
const News = require('./models/News');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected for seeding'))
    .catch(err => console.error('MongoDB connection error:', err));

const seedNews = [
    {
        title: {
            en: "Grand Feast of Saint Mary",
            am: "የእመቤታችን ቅድስት ድንግል ማርያም ዓመታዊ በዓል"
        },
        content: {
            en: "Join us for the grand celebration and feast of our Holy Virgin Mary. Special service starts at 5:00 AM.",
            am: "ጠዋት 11:00 ሰዓት በሚጀምረው ታላቅ የንግሥ በዓል ላይ እንዲገኙልን ጥሪያችንን እናስተላልፋለን::"
        },
        category: "Holiday",
        date: new Date()
    },
    {
        title: {
            en: "Sunday School Registration Open",
            am: "የሰንበት ትምህርት ቤት ምዝገባ ተጀመረ"
        },
        content: {
            en: "New students can now register online for the upcoming spiritual education semester.",
            am: "አዳዲስ ተማሪዎች ለሚቀጥለው መንፈሳዊ የትምህርት ዘመን በድረ-ገጻችን አማካኝነት መመዝገብ ትችላላችሁ::"
        },
        category: "School",
        date: new Date()
    },
    {
        title: {
            en: "Charity Service Outreach",
            am: "የበጎ አድራጎት አገልግሎት"
        },
        content: {
            en: "Our community will be visiting the local orphanage this Saturday. Volunteers are welcome.",
            am: "በዚህ ቅዳሜ በከተማችን ለሚገኝ የህጻናት ማሳደጊያ ጉብኝት እናደርጋለን:: በጎ ፈቃደኞች እንዲሳተፉ እንጋብዛለን::"
        },
        category: "Service",
        date: new Date()
    }
];

const seedDB = async () => {
    try {
        await News.deleteMany({});
        await News.insertMany(seedNews);
        console.log('News seeded successfully');
        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedDB();
