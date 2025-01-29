const express = require('express');
const bodyParser = require('body-parser');
const firebaseAdmin = require('firebase-admin');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');
const multer = require('multer');

// تهيئة Firebase Admin SDK
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(require('./firebase-adminsdk.json')), // تأكد من مسار الملف
});

const app = express();
const port = 3000;

// إعداد مجلد `public` لتقديم الملفات الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// استخدام CORS و body-parser
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// إعداد الاتصال بقاعدة البيانات
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // اسم المستخدم الخاص بقاعدة البيانات
    password: 'hassanian12345', // كلمة المرور الخاصة بقاعدة البيانات
    database: 'social_media',
});

// التحقق من الاتصال بقاعدة البيانات
db.connect((err) => {
    if (err) {
        console.error('خطأ في الاتصال بقاعدة البيانات:', err);
        return;
    }
    console.log('تم الاتصال بقاعدة البيانات بنجاح.');
});

// إعداد multer لتخزين الملفات المرفوعة
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// مسار للتحقق من التوكن
app.post('/verifyToken', async (req, res) => {
    const idToken = req.body.token;

    try {
        // التحقق من صحة التوكن باستخدام Firebase Admin SDK
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        res.status(200).send({ message: 'Token is valid', uid: uid });
    } catch (error) {
        res.status(401).send({ message: 'Invalid token', error: error.message });
    }
});

// مسار لإضافة منشور جديد
app.post('/api/posts', upload.single('file'), (req, res) => {
    const { user_name, title, description, file_type } = req.body;
    const file_url = req.file ? `/uploads/${req.file.filename}` : null;

    const sql = `INSERT INTO posts (user_name, user_image, title, description, file_type, file_url) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(
        sql,
        [
            user_name,
            req.body.user_image || 'default-profile.png',
            title,
            description,
            file_type,
            file_url,
        ],
        (err, result) => {
            if (err) {
                console.error('خطأ أثناء إدخال المنشور:', err);
                return res.status(500).send('فشل في إنشاء المنشور');
            }
            res.send('تم حفظ المنشور بنجاح');
        }
    );
});

// مسار لجلب جميع المنشورات
// مسار لجلب جميع المنشورات
app.get('/api/posts', (req, res) => {
    const sql = 'SELECT * FROM posts ORDER BY created_at DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('خطأ أثناء جلب المنشورات:', err);
            return res.status(500).send('فشل في جلب المنشورات');
        }
        res.json(results); // إرجاع المنشورات في صيغة JSON
    });
});


// تحديد المسارات الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html')); // عندما يدخل المستخدم إلى /، سيتم عرض login.html
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html')); // عندما يدخل المستخدم إلى /dashboard، سيتم عرض dashboard.html
});

// إعداد مسار الملفات المرفوعة
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// بدء السيرفر
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
