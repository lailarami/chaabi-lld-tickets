import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly from mail-service directory
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔍 Environment Variables Check:');
console.log('================================');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ SET' : '❌ NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET' : '❌ NOT SET');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM ? '✅ SET' : '❌ NOT SET');
console.log('MAIL_HOST:', process.env.MAIL_HOST ? '✅ SET' : '❌ NOT SET');
console.log('MAIL_PORT:', process.env.MAIL_PORT ? '✅ SET' : '❌ NOT SET');
console.log('MAIL_SERVICE_PORT:', process.env.MAIL_SERVICE_PORT ? '✅ SET' : '❌ NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV ? '✅ SET' : '❌ NOT SET');
console.log('================================');

// Show actual values (except sensitive ones)
console.log('\n📋 Actual Values:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('MAIL_HOST:', process.env.MAIL_HOST);
console.log('MAIL_PORT:', process.env.MAIL_PORT);
console.log('MAIL_SERVICE_PORT:', process.env.MAIL_SERVICE_PORT);
