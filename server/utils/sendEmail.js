import nodemailer from "nodemailer";

// Transporter Helper
const getTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// 1. Existing OTP Sender Function (Settings Page ke liye)
export const sendOTP = async (email, otp) => {
  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: `"Admin Panel Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Security Verification Code (OTP)",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #ff5722; text-align: center;">Verification Required</h2>
          <p style="color: #333; font-size: 15px;">Aapke Admin account credentials update karne ke liye OTP niche diya gaya hai:</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <span style="background-color: #f4f4f4; border: 1px dashed #ff5722; padding: 12px 25px; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #111; border-radius: 6px;">
              ${otp}
            </span>
          </div>
          
          <p style="color: #777; font-size: 13px;">Yeh OTP <b>10 minutes</b> tak valid hai.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP Email sent successfully: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending OTP email: ", error);
    throw new Error("Email sending failed: " + error.message);
  }
};

// 2. NEW Password Reset Link Sender Function (Forgot Password ke liye)
export const sendResetPasswordLink = async (email, resetUrl) => {
  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: `"Martial Arts Academy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #ff5722; text-align: center;">Reset Your Password</h2>
          <p style="color: #333; font-size: 15px;">Aapne Password Reset ka request kiya tha. Niche diye gaye button par click karke naya password set karein:</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" style="background-color: #ff5722; color: #ffffff; text-decoration: none; padding: 12px 25px; font-size: 16px; font-weight: bold; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #777; font-size: 13px;">Yeh link <b>15 minutes</b> tak valid hai. Agar aapne yeh request nahi kiya tha, toh is email ko ignore karein.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Reset Email sent successfully: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending Reset email: ", error);
    throw new Error("Email sending failed: " + error.message);
  }
};