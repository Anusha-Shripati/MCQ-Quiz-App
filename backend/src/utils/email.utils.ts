import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (name: string, email: string, password: string, roleName?: string): Promise<boolean> => {
  const subject = 'Welcome to MCQ Platform!';
  const appUrl = 'https://mcq-app.lrdevteam.com/';
  
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);">
      <!-- Header with enhanced gradient -->
      <div style="background: linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%); padding: 35px 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">Welcome to MCQ Platform!</h1>
        <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">Your journey to success begins now</p>
      </div>
      
      <!-- Content with enhanced styling -->
      <div style="background-color: #ffffff; padding: 35px; border-bottom: 1px solid #eeeeee;">
        <h2 style="color: #333; font-size: 24px; margin-top: 0; border-bottom: 2px solid #4A00E0; padding-bottom: 10px; display: inline-block;">Hello, ${name}! 👋</h2>
        
        <p style="color: #555; font-size: 16px; line-height: 1.6; background-color: #F0F7FF; padding: 15px; border-radius: 8px; border-left: 4px solid #4A00E0;">
          Your account has been <span style="color: #4A00E0; font-weight: bold;">successfully created</span>. We're excited to have you join our platform!
        </p>
        
        <!-- Credentials box with enhanced styling -->
        <div style="background: linear-gradient(to right, #f9f9f9, #f0f0ff); border-left: 5px solid #4A00E0; padding: 20px; margin: 25px 0; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.05);">
          <p style="margin: 0 0 15px 0; color: #333; font-weight: 700; font-size: 18px; display: flex; align-items: center;">
            <span style="background-color: #4A00E0; color: white; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; margin-right: 10px;">🔑</span>
            Your Login Credentials
          </p>
          <table style="width: 100%; border-collapse: collapse; border-radius: 6px; overflow: hidden;">
            <tr style="background-color: rgba(74, 0, 224, 0.05);">
              <td style="padding: 12px 15px; color: #555; font-weight: 600; border-bottom: 1px solid #e0e0ff;">Role:</td>
              <td style="padding: 12px 15px; color: #333; border-bottom: 1px solid #e0e0ff;">${roleName || 'User'}</td>
            </tr>
            <tr style="background-color: rgba(74, 0, 224, 0.05);">
              <td style="padding: 12px 15px; color: #555; font-weight: 600; border-bottom: 1px solid #e0e0ff;">Email:</td>
              <td style="padding: 12px 15px; color: #333; border-bottom: 1px solid #e0e0ff;">${email}</td>
            </tr>
            <tr style="background-color: rgba(74, 0, 224, 0.05);">
              <td style="padding: 12px 15px; color: #555; font-weight: 600;">Password:</td>
              <td style="padding: 12px 15px; color: #333;">${password} <span style="font-weight: normal;">(keep it secret!)</span></td>
            </tr>
          </table>
        </div>
        
        <!-- CTA button with enhanced styling -->
        <div style="text-align: center; margin: 35px 0;">
          <a href="${appUrl}" style="background: linear-gradient(to right, #4A00E0, #8E2DE2); color: white; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(74, 0, 224, 0.4); transition: all 0.3s;">Access MCQ Platform</a>
        </div>
        
        <!-- Info section with custom icons -->
        <div style="margin-top: 30px; padding: 20px; border-radius: 8px; background-color: #f8f9ff; border: 1px dashed #ccd4ff;">
          <p style="color: #444; font-size: 16px; line-height: 1.6; margin-top: 0;">
            <span style="color: #4A00E0; font-weight: bold;">Need help?</span> If you have any questions or need assistance, please don't hesitate to contact our support team.
          </p>
          <div style="display: flex; margin-top: 15px;">
            <div style="margin-right: 20px; display: flex; align-items: center;">
              <span style="background-color: #4A00E0; color: white; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; margin-right: 8px;">📧</span>
              <span style="color: #666;">dev@logicrays.com</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="background-color: #4A00E0; color: white; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; margin-right: 8px;">📞</span>
              <span style="color: #666;">+1 (555) 123-4567</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return sendEmail(email, subject, html);
};

export const sendAccountUpdateEmail = async (name: string, email: string, password: string, roleName?: string): Promise<boolean> => {
  
  const subject = 'Your MCQ Platform Account Has Been Updated';
  const appUrl = 'https://mcq-app.lrdevteam.com/';
  
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);">
      <!-- Header with enhanced gradient -->
      <div style="background: linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%); padding: 35px 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">Account Updated!</h1>
        <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">Your account details have been changed</p>
      </div>
      
      <!-- Content with enhanced styling -->
      <div style="background-color: #ffffff; padding: 35px; border-bottom: 1px solid #eeeeee;">
        <h2 style="color: #333; font-size: 24px; margin-top: 0; border-bottom: 2px solid #4A00E0; padding-bottom: 10px; display: inline-block;">Hello, ${name}! 👋</h2>
        
        <p style="color: #555; font-size: 16px; line-height: 1.6; background-color: #F0F7FF; padding: 15px; border-radius: 8px; border-left: 4px solid #4A00E0;">
          Your account information has been <span style="color: #4A00E0; font-weight: bold;">successfully updated</span>. Please review your updated credentials below.
        </p>
        
        <!-- Credentials box with enhanced styling -->
        <div style="background: linear-gradient(to right, #f9f9f9, #f0f0ff); border-left: 5px solid #4A00E0; padding: 20px; margin: 25px 0; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.05);">
          <p style="margin: 0 0 15px 0; color: #333; font-weight: 700; font-size: 18px; display: flex; align-items: center;">
            <span style="background-color: #4A00E0; color: white; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; margin-right: 10px;">🔑</span>
            Updated Login Credentials
          </p>
          <table style="width: 100%; border-collapse: collapse; border-radius: 6px; overflow: hidden;">
           <tr style="background-color: rgba(74, 0, 224, 0.05);">
              <td style="padding: 12px 15px; color: #555; font-weight: 600; border-bottom: 1px solid #e0e0ff;">Name:</td>
              <td style="padding: 12px 15px; color: #333; border-bottom: 1px solid #e0e0ff;">${name}</td>
            </tr>
            <tr style="background-color: rgba(74, 0, 224, 0.05);">
              <td style="padding: 12px 15px; color: #555; font-weight: 600; border-bottom: 1px solid #e0e0ff;">Role:</td>
              <td style="padding: 12px 15px; color: #333; border-bottom: 1px solid #e0e0ff;">${roleName || 'User'}</td>
            </tr>
            <tr style="background-color: rgba(74, 0, 224, 0.05);">
              <td style="padding: 12px 15px; color: #555; font-weight: 600; border-bottom: 1px solid #e0e0ff;">Email:</td>
              <td style="padding: 12px 15px; color: #333; border-bottom: 1px solid #e0e0ff;">${email}</td>
            </tr>`+
            (password ? `<tr style="background-color: rgba(74, 0, 224, 0.05);">
              <td style="padding: 12px 15px; color: #555; font-weight: 600;">Password:</td>
              <td style="padding: 12px 15px; color: #333;">${password} <span style="font-weight: normal;">(keep it secret!)</span></td>
            </tr>`:"" )+`
          </table>
        </div>
        
        <!-- CTA button with enhanced styling -->
        <div style="text-align: center; margin: 35px 0;">
          <a href="${appUrl}" style="background: linear-gradient(to right, #4A00E0, #8E2DE2); color: white; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(74, 0, 224, 0.4); transition: all 0.3s;">Review Your Account</a>
        </div>
        
        <!-- Info section with custom icons -->
        <div style="margin-top: 30px; padding: 20px; border-radius: 8px; background-color: #f8f9ff; border: 1px dashed #ccd4ff;">
          <p style="color: #444; font-size: 16px; line-height: 1.6; margin-top: 0;">
            <span style="color: #4A00E0; font-weight: bold;">Need help?</span> If you have any questions or need assistance, please don't hesitate to contact our support team.
          </p>
          <div style="display: flex; margin-top: 15px;">
            <div style="margin-right: 20px; display: flex; align-items: center;">
              <span style="background-color: #4A00E0; color: white; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; margin-right: 8px;">📧</span>
              <span style="color: #666;">dev@logicrays.com</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="background-color: #4A00E0; color: white; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; margin-right: 8px;">📞</span>
              <span style="color: #666;">+1 (555) 123-4567</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return sendEmail(email, subject, html);
};

export const sendAccountDeletedEmail = async (name: string, email: string): Promise<boolean> => {
  const subject = 'Your MCQ Platform Account Has Been Deleted';
  const appUrl = 'https://mcq-app.lrdevteam.com/';

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);">
      <!-- Header with enhanced gradient -->
      <div style="background: linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%); padding: 35px 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">Account Deleted</h1>
        <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">We're sorry to see you go</p>
      </div>
      <!-- Content with enhanced styling -->
      <div style="background-color: #ffffff; padding: 35px; border-bottom: 1px solid #eeeeee;">
        <h2 style="color: #333; font-size: 24px; margin-top: 0; border-bottom: 2px solid #4A00E0; padding-bottom: 10px; display: inline-block;">Goodbye, ${name}!</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.6; background-color: #FFF5F5; padding: 15px; border-radius: 8px; border-left: 4px solid #E04A4A;">
          Your account on <span style='color: #4A00E0; font-weight: bold;'>MCQ Platform</span> has been <span style='color: #E04A4A; font-weight: bold;'>successfully deleted</span> and you will no longer be able to access the platform with your credentials.
        </p>
        <div style="text-align: center; margin: 35px 0;">
          <a href="${appUrl}" style="background: linear-gradient(to right, #4A00E0, #8E2DE2); color: white; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(74, 0, 224, 0.4); transition: all 0.3s;">Visit MCQ Platform</a>
        </div>
        <div style="margin-top: 30px; padding: 20px; border-radius: 8px; background-color: #f8f9ff; border: 1px dashed #ccd4ff;">
          <p style="color: #444; font-size: 16px; line-height: 1.6; margin-top: 0;">
            <span style="color: #4A00E0; font-weight: bold;">Changed your mind?</span> If this was a mistake or you have any questions, please contact our support team. We're here to help!
          </p>
          <div style="display: flex; margin-top: 15px;">
            <div style="margin-right: 20px; display: flex; align-items: center;">
              <span style="background-color: #4A00E0; color: white; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; margin-right: 8px;">📧</span>
              <span style="color: #666;">dev@logicrays.com</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="background-color: #4A00E0; color: white; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; margin-right: 8px;">📞</span>
              <span style="color: #666;">+1 (555) 123-4567</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return sendEmail(email, subject, html);
};
