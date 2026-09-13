const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const axios = require('axios');
const http = require('http');

// دمج بيانات المفتاح مباشرة داخل الكود لتجنب أخطاء الملفات والأسطر تماماً
initializeApp({
  credential: cert({
    type: "service_account",
    projectId: "rentflow-eee08",
    privateKeyId: "9b4248988b53a311d2fd33a15d6d470d2df1987e",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDEn+63YznmJdLB\n0QFJOJNFHbzsUN6/JWfL7P7Sca1d7IpGO4SK0/JWsL/tcNL9c7I3OCRQrrJt21vN\nJAjJX+9w6LP/exE1coyfprmQunPNPefg+AZgeGmVDSOr1Ms71yZ1smYBSUXOinYn\n7tV/54FXQXC5ofzeiiK1z9BItIY12LDei50eojU8a/+WPxfaUQ3nJleA85XipypQ\ned1gSg9xxVmGocLWaH6y2AB+agosI7EifYmQiJmqDaYCbmLhXZMGddcBnDrCH2A8\nIeVt88mtxbgkR4bUplM7exKYD3oeBj7hCYvyxhO3kNRlFIrlFki0qOW90bFTzsoM\nq/IlTt/fAgMBAAECggEADzlVrOC9O2e86HsFaMUKIt6/rkmmrYS40C4yuFpksrId\nYXzucSdVV+DKKeX2vpJy/1m7Khbhdtl2Q3oH4Ih4JbUtNqZ+bLWu7Xxlv5VILeFR\ne/ah28QglkTueNMtkNEPevgL2nHXbbueLjWMvCE38pvjamQZ8nGEm+PFLzpXB+hZ\nlXJi5BCWQQX8NGTZrElePXlZjkYptNVRcQbjLSTTptJ/qd3ujQwd8DG9xZ4foMYQ\nkmDrU0gXG28zuDm8nVEZvlCLsA6NIPMulcB7cukeAfwZ74uJgr72gEFZWHR5IIHX\ntn2kRfqUaLiaZgrlfxLCW9JxF9SMQWgis4Qcd83S8QKBgQDiC04CyL9XPQawI0JR\nSupvdyZ9KBNqbrTODgwgoRcKBcgVNF0qy/8W+PUXdhsqEO+2OGKtMb5Mw6hQfAnF\nrJDCwDRLh163EeEp4z6nWloOei7WMAwSn4Wdib5TbAcp/H1DXiwZKY74masKhcWu\n+gtpNRuHZk80tAcnLfuyV0tqsQKBgQDero3/oxtHnrDMOAiP/wzkRMjBL7ek3J1f\ngZdLBSx5E6IWuJdsHVjsfZbVOkyu/jb0VBn6TWoTu8ZjPbONOdba7cRJZHvxPcFu\niXz0VrioB8H4oQ0XoxnGh1TPGqBM7vXOzOnKU4rS4xT/vFyCSiYJ9pWsAFwa3SNQ\naUo8BnZ3jwKBgBwTY2EdJgbj4YzHFFmcgHnPxswMyjyR+4sMW51B5OatySg5FMlY\BRsJWQfM95rF98AeSMNSRlyqgKFehqgywtgtn1EyQyVh5yGYxBNtOXpK2r5nwVge\n0C29ChK6fDlOzxArBjcp3kQqcgAglWkiTYCHxB+RKY1WPv0yzOxdw1RBAoGBAKD1\n89ZxA+sFHi6/4hCT/7GQtrxNzaTxgx/iAIZNuxPZyTQ7Qdj4baqkLT774Sosv3Rk\nxlJTWvXgqUpa80qGIHQnodabN6vtQ8CuyQ+lD90FnoQlhd0sHBmRARCi4nQ51pwh\nKm0Bbjt5wVgJw6S6DDzvbMjjibAxYLFjKjGxSjipAoGBALTdrSEGUIJBdFy8cmC+\nlDTYyYvK5BUohdYL9SJ77SPLY3i5Rx2j3w8CcrI3VTT0jcJYMd34YGGCDKvCvtpD\nxviibMuFeGx0Bk5ay0jiL0vui1XNGH/7EpwXesLlOvLoHBBzBr6RgUFkV2J8FIEg\nrV6akMjMOasZNrqXlhi7Bo3C\-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
    clientEmail: "firebase-adminsdk-fbsvc@rentflow-eee08.iam.gserviceaccount.com",
    clientId: "108224114556376538798"
  }
});

const db = getFirestore();

const TELEGRAM_BOT_TOKEN = '8883989010:AAEarEp4iN5DgZ2WRjSuMPX8ipOKTDiepCE';
const TELEGRAM_CHAT_ID = '7968022913';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('RentFlow Bot is running successfully!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
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

setInterval(checkRentDeadlines, 24 * 60 * 60 * 1000);
checkRentDeadlines();
console.log('Bot worker is running...');
