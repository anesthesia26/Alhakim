const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const axios = require('axios');
const http = require('http');

// دمج مفتاح فايربيس مباشرة داخل الكود لتجنب أخطاء الملفات المفقودة
const serviceAccount = {
  "type": "service_account",
  "project_id": "rentflow-eee08",
  "private_key_id": "26d08bc7c44fd31b9c4bc073da9a55a05cf78513",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCZBHtCBrDuCuWi\ngAW544l+QCW/aCfMgkyDO5I+PmcMU8VtZAuEphQaAPC0fQ52yNdby4XCl5j5p56R\no8fmqkaQ2KL51a6cDcfXFlrWci/6mpg6IZZLuY6O4BQWH5ffd1cyCJbGpmL98Qnw\naFvsEIZMthMj30poSD9+iLIm5/QROJo8t7vz6xz4CXZfxftCrSfOfVsAXGeVwAOW\nxw886v4PtWuW1reiBaiSoRJc6xHUvrZ2O4g9VT2piWQWPaMeL2rekWyZvqVLjdxD\n9p55XsrDDXbnFjXWXBZH0Mg73W3I61SpsY31AsC7Z+KEHWj/yfXhkglcEeJUjqG+\nz5l2hLQRAgMBAAECggEAMf6VWQa/ox7bVWMXu9r8bsv9qVKaAkcmQZBioUSZPZ1X\nOX0BCGeM1Mwu2QGtCqFnP74451HJsPQTqokFBLfok2W8pf0rbiBQhVVv+3XWeD4v\nc3rK1NX9HnBXD71lzST8T8Qfoyr01/x7n1kxg2kIwCKTEVrgwD6uxCRcdLq/cyp2\nVMfppHHtUPmWyU2UWzzKqZ1iZ9rs9Lsxw6nQW9oLyhFLIBF92VFxwaxosUiBHlMj\nZqgwf4zsJAuWm5681/MqJ7ck8D+V0calm5UidJ5LxGocfZep6+c1LwBTKWltjmri\nU19EePA4oRfuJCD0+ic698sWvyKyKV2hOxolQPBIIwKBgQDLaelWUW3Atz/xKxaf\npfHQNrgHA3ZRmhi8c1a7R8aJKGpBreiVHZq3NWdU2rHbSKpksz3RDi0sBdCwyOgm\nmeruu60SOAtp4FhG0v2aWCnxTQW+jq7wdi3NrUj4y8HWoXRwjh9t+5jTAJ1qmsvc\nOSMKDGIbs713EKQhkD2LhmYVDwKBgQDAk06Ui1rOMomGUae0UDIwNk1Mm7/S+c3y\nzJL+OMVFK1UGWXkhy9TKh+YyJspZg3NHwFRyIza67oNgXo1IpRj7qyD79ROyAJ0A\nWhAVhaqn2UBcbZAim6DuXbG09Zdiq7flmuWtv2ihcWaI0OLT2E1TAnTgQjGHZvLS\nF9mur7nk3wKBgFYy34qQny3XeeU9GS02KS7OwVVXhkA2SN0zE0HxvJRK6BxFEhZ+\noR2aJ9uxgUUnme1qd3urwkCxhiokORyChSf9p+3cihmn1EDPEGDjk4KJ3TFPTZrg\nubA7Cn1D+zR03t8DmxYEVFK2I/8U8ea038BWVwzeMh/OkX8XnL0PixrJAoGAPWj8\nPwxtaaHeDzJM24hTaOJ4Jfzo3/t/PHUWTvGFnvghhgPUR/27HtbVhpquHnt3sKLZ\niwhFtLjItluQjGDxpZe9zfsqS7I8XtdZl7NnZ101VAQwWYjtefXw7HcAzptZ6mNJ\n6O1IDWufOfP60XmBtv3qjXUuXDJtLqgiZ71r91sCgYAumhOa8POo0WDOiEkuGyoq\nVNU4oJO8tA3Xm3ZrmA+EPuTvv/smWQaJ4pKTjVyiUySWwIDk/KgIiFlBAOK6+HJY\nR/q9qgd/yBpK6YQ6fsKuz2n+ltaMNaVZOdDjhf24Rbbr6eQUFMgq4rlW3xTIPOsp\nRDCCOcY/9npvPYF/eWbp9Q==\n-----END PRIVATE KEY---------\n",
  "client_email": "firebase-adminsdk-fbsvc@rentflow-eee08.iam.gserviceaccount.com",
  "client_id": "108224114556376538798",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40rentflow-eee08.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

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
        console.log('جاري جلب البيانات من قاعدة البيانات...');
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
                alertsMessage += `📅 *الحالة:* statusText\n`;
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
            console.log('تم الفحص بنجاح: لا توجد تواريخ إيجار مستحقة خلال الـ 5 أيام القادمة.');
        }
    } catch (error) {
        console.error('خطأ أثناء فحص البيانات:', error.message);
    }
}

// فحص كل 24 ساعة
setInterval(checkRentDeadlines, 24 * 60 * 60 * 1000);

// فحص مباشر عند التشغيل للتأكد
checkRentDeadlines();
console.log('Bot worker is running...');
