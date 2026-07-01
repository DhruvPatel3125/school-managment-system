const nodemailer = require('nodemailer');

// 1. Generate a secure random temporary password (10 characters: letters, numbers, symbols)
const generateTempPassword = () => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%&*';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  let password = '';
  
  // Guarantee at least one of each class is present
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));
  
  for (let i = 0; i < 6; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle password characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

// 2. Create transporter using SMTP environment variables
const createTransporter = async () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    console.log(`✉️ Mailer configured using SMTP: ${host}:${port} (${user})`);
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // Use SSL/TLS for 465, STARTTLS for 587
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Fallback: Create Ethereal test account dynamically for local dev testing
  console.log('✉️ No SMTP credentials specified in .env. Attempting Ethereal test mail fallback...');
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log(`✉️ Generated Ethereal Test Account: User: ${testAccount.user}, Pass: ${testAccount.pass}`);
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch (err) {
    console.error('❌ Failed to establish Ethereal test email client:', err);
    // Return dummy transporter that logs to console
    return {
      sendMail: async (mailOptions) => {
        console.log('=== DUMMY MAIL OUTBOX ===');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Body:\n${mailOptions.text}`);
        console.log('=========================');
        return { messageId: 'dummy-id', previewUrl: 'Console Output' };
      }
    };
  }
};

// Cached transporter instance
let transporterPromise = createTransporter();

// Helper to send general email
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = await transporterPromise;
    const from = process.env.MAIL_FROM || '"EduCore Admin" <admin@educore.app>';
    
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html
    });

    console.log(`✉️ Email successfully dispatched to ${to}. Message ID: ${info.messageId}`);
    
    // Log Ethereal preview link if testing
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`✉️ Preview Ethereal email at: ${previewUrl}`);
    }
    
    return info;
  } catch (err) {
    console.error(`❌ Mailer failed to send email to ${to}:`, err.stack || err);
    throw err;
  }
};

// Send student/staff welcome credentials email
const sendCredentialsEmail = async ({ toEmail, userName, tempPassword, roleName, schoolName }) => {
  const subject = `Welcome to ${schoolName} - Your Portal Credentials`;
  
  const text = `Hello ${userName},\n\n` +
               `Your school portal account for ${schoolName} has been successfully created.\n` +
               `Here are your login credentials:\n\n` +
               `Role: ${roleName}\n` +
               `Login Email: ${toEmail}\n` +
               `Temporary Password: ${tempPassword}\n\n` +
               `Please sign in to your dashboard and update your password immediately.\n\n` +
               `Best Regards,\n` +
               `${schoolName} Administration`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff; color: #333333;">
      <h2 style="color: #4f46e5; border-bottom: 2px solid #f3f4f6; padding-bottom: 12px; margin-top: 0;">Welcome to ${schoolName}</h2>
      <p style="font-size: 15px; line-height: 1.5;">Hello <strong>${userName}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.5;">Your access account under the <strong>${schoolName}</strong> portal has been successfully provisioned. Use the credentials below to log in:</p>
      
      <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Portal Domain:</strong> ${schoolName.toLowerCase().replace(/[^a-z0-9]/g, '')}.localhost</p>
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Role Profile:</strong> <span style="text-transform: capitalize;">${roleName}</span></p>
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Username (Email):</strong> <code style="font-family: monospace; background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${toEmail}</code></p>
        <p style="margin: 0; font-size: 14px;"><strong>Temporary Password:</strong> <code style="font-family: monospace; background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #b91c1c;">${tempPassword}</code></p>
      </div>

      <p style="font-size: 14px; color: #dc2626; font-weight: bold; line-height: 1.5;">⚠️ Important: For security reasons, please log in and change your password immediately from your profile settings.</p>
      
      <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
      <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-bottom: 0;">This email is automatically generated. Please do not reply directly to this inbox.</p>
    </div>
  `;

  return sendEmail({ to: toEmail, subject, text, html });
};

module.exports = {
  generateTempPassword,
  sendEmail,
  sendCredentialsEmail
};
