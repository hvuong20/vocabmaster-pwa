// Chạy một lần để tạo VAPID keys:  node generate-keys.js
const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();

console.log('\n✅ VAPID Keys đã tạo xong. Copy vào Render.com Environment Variables:\n');
console.log('VAPID_PUBLIC_KEY=' + keys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);
console.log('\n⚠️  Giữ VAPID_PRIVATE_KEY bí mật, không commit lên Git!\n');
