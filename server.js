const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const axios = require('axios');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const TELEGRAM_BOT_TOKEN = '8883989010:AAEarEp4iN5DgZ2WRjSuMPX8ipOKTDiepCE';
const TELEGRAM_CHAT_ID = '7968022913';

async function checkRentDeadlines() {
    try {
        const snapshot = await db.collection('properties').get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let alertsMessage = "🚨 *تنبيهات استحقاق الإيجارات* 🚨\n\n";
        let hasAlerts = false;

        snapshot.forEach(doc => {
            const prop = doc.data();
            const dueDate = new Date(prop.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            const diffTime = dueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 5) {
                hasAlerts = true;
                let statusText = diffDays < 0 ? `متأخر ${Math.abs(diffDays)} يوم` : `متبقي ${diffDays} يوم`;
                
                let phone = prop.phone ? prop.phone.replace(/\D/g, '') : '';
                if (phone.startsWith('0')) phone = phone.substring(1);
                if (!phone.startsWith('964')) phone = '964' + phone;

                const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(`مرحباً (${prop.propName || 'عزيزي'})\nتذكير بسداد إيجار العقار (${prop.location || ''}). المبلغ: ${prop.amount || 0} د.ع`)}`;

                alertsMessage += `📌 *العقار:* ${prop.propName}\n`;
                alertsMessage += `👤 *المستخدم:* ${prop.owner}\n`;
                alertsMessage += `📅 *الحالة:* ${statusText}\n`;
                alertsMessage += `💰 *المبلغ:* ${prop.amount} د.ع\n`;
                alertsMessage += `🔗 [مراسلة المستأجر عبر واتساب](${waLink})\n`;
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
            console.log('لا توجد إيجارات مستحقة خلال هذه الفترة.');
        }
    } catch (error) {
        console.error('خطأ أثناء فحص التواريخ:', error);
    }
}

// فحص كل 24 ساعة
setInterval(checkRentDeadlines, 24 * 60 * 60 * 1000);

// فحص مباشر عند التشغيل للتأكد
checkRentDeadlines();
console.log('Bot worker is running...');
