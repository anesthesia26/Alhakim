const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const axios = require('axios');
const http = require('http');

// قراءة ملف الأمان بصورة آمنة ومباشرة
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const TELEGRAM_BOT_TOKEN = '8883989010:AAEarEp4iN5DgZ2WRjSuMPX8ipOKTDiepCE';
const TELEGRAM_CHAT_ID = '7968022913';

// إنشاء سيرفر ويب بسيط لاستقرار Railway
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('RentFlow Bot is running successfully!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

async function checkRentDeadlines() {
    try {
        console.log('جاري فحص العقارات...');
        const snapshot = await db.collection('properties').get();
        
        if (snapshot.empty) {
            console.log('قاعدة البيانات فارغة ولا توجد عقارات مسجلة.');
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let alertsMessage = "🚨 *تنبيهات استحقاق الإيجارات* 🚨\n\n";
        let hasAlerts = false;

        snapshot.forEach(doc => {
            const prop = doc.data();
            
            if (!prop.dueDate) return;

            const dueDate = new Date(prop.dueDate);
            if (isNaN(dueDate.getTime())) return;

            dueDate.setHours(0, 0, 0, 0);

            const diffTime = dueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 5) {
                hasAlerts = true;
                let statusText = diffDays < 0 ? `متأخر ${Math.abs(diffDays)} يوم` : (diffDays === 0 ? `مستحق اليوم!` : `متبقي ${diffDays} يوم`);
                
                let phone = prop.phone ? String(prop.phone).replace(/\D/g, '') : '';
                if (phone.startsWith('0')) phone = phone.substring(1);
                if (!phone.startsWith('964')) phone = '964' + phone;

                const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(`مرحباً (${prop.propName || 'عزيزي'})\nتذكير بسداد إيجار العقار (${prop.location || ''}). المبلغ: ${prop.amount || 0} د.ع`)}`;

                alertsMessage += `📌 *العقار:* ${prop.propName || 'بدون اسم'}\n`;
                alertsMessage += `👤 *المستأجر:* ${prop.owner || 'غير محدد'}\n`;
                alertsMessage += `📅 *الحالة:* ${statusText}\n`;
                alertsMessage += `💰 *المبلغ:* ${prop.amount || 0} د.ع\n`;
                alertsMessage += `🔗 [مراسلة عبر واتساب](${waLink})\n`;
                alertsMessage += `-----------------------------------\n`;
            }
        });

        if (hasAlerts) {
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: TELEGRAM_CHAT_ID,
                text: alertsMessage,
                parse_mode: 'Markdown'
            });
            console.log('تم إرسال التنبيهات إلى تلغرام بنجاح.');
        } else {
            console.log('تم الفحص بنجاح: لا توجد تواريخ إيجار مستحقة.');
        }
    } catch (error) {
        console.error('خطأ أثناء الفحص:', error.message);
    }
}

// فحص كل 24 ساعة
setInterval(checkRentDeadlines, 24 * 60 * 60 * 1000);

// فحص مباشر عند التشغيل للتأكد
checkRentDeadlines();
console.log('Bot worker is running...');
