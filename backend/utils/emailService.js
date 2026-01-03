const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email template for franchise credentials
const getFranchiseCredentialsTemplate = (franchiseeName, email, password) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #1f2937;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      color: #4b5563;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .credentials-box {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
    }
    .credentials-box h2 {
      margin: 0 0 20px 0;
      font-size: 20px;
      color: #1e40af;
      display: flex;
      align-items: center;
    }
    .credentials-box h2::before {
      content: "🔑";
      margin-right: 10px;
      font-size: 24px;
    }
    .credential-item {
      background-color: white;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 15px;
      border-left: 4px solid #3b82f6;
    }
    .credential-item:last-child {
      margin-bottom: 0;
    }
    .credential-label {
      font-size: 12px;
      font-weight: bold;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .credential-value {
      font-size: 18px;
      font-weight: bold;
      color: #1f2937;
      font-family: 'Courier New', monospace;
    }
    .warning-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .warning-box p {
      margin: 0;
      font-size: 14px;
      color: #92400e;
    }
    .warning-box p::before {
      content: "⚠️ ";
      margin-right: 5px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 5px 0;
      font-size: 14px;
      color: #6b7280;
    }
    .footer .brand {
      font-weight: bold;
      color: #2563eb;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to FranchiseeHub!</h1>
      <p>Your franchise application has been approved</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${franchiseeName},</p>
      
      <p class="message">
        Congratulations! We are thrilled to inform you that your franchise application has been <strong>approved</strong>. 
        Welcome to the FranchiseeHub family! 🎊
      </p>
      
      <p class="message">
        Your franchisee account has been created and you can now access the FranchiseeHub portal to manage your sales, 
        view analytics, and track your performance.
      </p>
      
      <div class="credentials-box">
        <h2>Your Login Credentials</h2>
        
        <div class="credential-item">
          <div class="credential-label">📧 Email Address</div>
          <div class="credential-value">${email}</div>
        </div>
        
        <div class="credential-item">
          <div class="credential-label">🔐 Password</div>
          <div class="credential-value">${password}</div>
        </div>
      </div>
      
      <div class="warning-box">
        <p><strong>Important:</strong> Please keep these credentials safe and secure. We recommend changing your password after your first login.</p>
      </div>
      
      <center>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/franchisee/login" class="button">
          Login to Your Dashboard →
        </a>
      </center>
      
      <p class="message">
        If you have any questions or need assistance, please don't hesitate to contact our support team.
      </p>
      
      <p class="message">
        We look forward to a successful partnership with you!
      </p>
      
      <p class="message" style="margin-top: 30px;">
        Best regards,<br>
        <strong>The FranchiseeHub Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p class="brand">FranchiseeHub</p>
      <p>Empowering Franchisees, Growing Together</p>
      <p style="margin-top: 15px; font-size: 12px;">
        This is an automated email. Please do not reply to this message.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

// Email template for accepted application
const getApplicationAcceptedTemplate = (franchiseeName) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .message {
      font-size: 16px;
      color: #4b5563;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Application Accepted!</h1>
    </div>
    <div class="content">
      <p class="message">Dear ${franchiseeName},</p>
      <p class="message">
        Great news! Your franchise application has been <strong>accepted</strong> and is currently under review 
        for final approval.
      </p>
      <p class="message">
        Our team will review your application and you will receive further instructions soon regarding 
        the next steps.
      </p>
      <p class="message">Thank you for your patience!</p>
      <p class="message" style="margin-top: 30px;">
        Best regards,<br>
        <strong>The FranchiseeHub Team</strong>
      </p>
    </div>
    <div class="footer">
      <p style="font-weight: bold; color: #10b981; font-size: 16px;">FranchiseeHub</p>
      <p style="font-size: 14px; color: #6b7280;">Empowering Franchisees, Growing Together</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Email template for rejected application
const getApplicationRejectedTemplate = (franchiseeName) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .message {
      font-size: 16px;
      color: #4b5563;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Status Update</h1>
    </div>
    <div class="content">
      <p class="message">Dear ${franchiseeName},</p>
      <p class="message">
        Thank you for your interest in joining the FranchiseeHub family. After careful consideration, 
        we regret to inform you that we are unable to proceed with your franchise application at this time.
      </p>
      <p class="message">
        This decision does not reflect on your capabilities, and we encourage you to apply again in the future 
        if circumstances change.
      </p>
      <p class="message">
        We appreciate the time and effort you invested in the application process.
      </p>
      <p class="message" style="margin-top: 30px;">
        Best regards,<br>
        <strong>The FranchiseeHub Team</strong>
      </p>
    </div>
    <div class="footer">
      <p style="font-weight: bold; color: #ef4444; font-size: 16px;">FranchiseeHub</p>
      <p style="font-size: 14px; color: #6b7280;">Empowering Franchisees, Growing Together</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Email template for new application notification to admin
const getNewApplicationAdminTemplate = (applicantName, email, businessName, city) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .info-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .info-row {
      display: flex;
      margin-bottom: 10px;
    }
    .info-label {
      font-weight: bold;
      color: #92400e;
      width: 150px;
    }
    .info-value {
      color: #451a03;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      margin: 20px 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 New Franchise Application</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px; color: #4b5563;">
        A new franchise application has been submitted and requires your review.
      </p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Applicant Name:</span>
          <span class="info-value">${applicantName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">${email}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Business Name:</span>
          <span class="info-value">${businessName || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">City:</span>
          <span class="info-value">${city}</span>
        </div>
      </div>
      <center>
        <a href="${process.env.FRONTEND_URL}/admin/applications" class="button">
          Review Application →
        </a>
      </center>
    </div>
    <div class="footer">
      <p style="font-weight: bold; color: #f59e0b; font-size: 16px;">FranchiseeHub Admin</p>
      <p style="font-size: 14px; color: #6b7280;">This is an automated notification</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Send franchise credentials email
exports.sendFranchiseCredentials = async (to, franchiseeName, email, password) => {
  try {
    const mailOptions = {
      from: `"FranchiseeHub" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: '🎉 Your FranchiseeHub Account is Ready!',
      html: getFranchiseCredentialsTemplate(franchiseeName, email, password)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Credentials email sent successfully to:', to);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending credentials email:', error);
    return { success: false, error: error.message };
  }
};

// Send application accepted email
exports.sendApplicationAccepted = async (to, franchiseeName) => {
  try {
    const mailOptions = {
      from: `"FranchiseeHub" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: '✅ Your Franchise Application Has Been Accepted',
      html: getApplicationAcceptedTemplate(franchiseeName)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Application accepted email sent successfully to:', to);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending accepted email:', error);
    return { success: false, error: error.message };
  }
};

// Send application rejected email
exports.sendApplicationRejected = async (to, franchiseeName) => {
  try {
    const mailOptions = {
      from: `"FranchiseeHub" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'FranchiseeHub Application Status Update',
      html: getApplicationRejectedTemplate(franchiseeName)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Application rejected email sent successfully to:', to);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending rejected email:', error);
    return { success: false, error: error.message };
  }
};

// Send new application notification to admin
exports.sendNewApplicationNotification = async (adminEmail, applicantName, email, businessName, city) => {
  try {
    const mailOptions = {
      from: `"FranchiseeHub System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: '🔔 New Franchise Application Received',
      html: getNewApplicationAdminTemplate(applicantName, email, businessName, city)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ New application notification sent to admin:', adminEmail);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
exports.testEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};

module.exports = exports;
