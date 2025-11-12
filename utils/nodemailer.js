import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // use TLS
    auth: {
        user: process.env.BREVO_USER ,
        pass: process.env.BREVO_PASS ,
    }
});

export async function sendOtpMail(email, otp) {
    const mailOptions = {
        from: process.env.BREVO_FROM ,
        to: email,
        subject: 'Your OTP for EMS Verification',
        html: `
        <div style="max-width:600px;margin:0 auto;padding:20px;background:#0d1b2a;font-family:'Segoe UI',Arial,sans-serif;position:relative;overflow:hidden;">
          <!-- Live Background -->
          <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(-45deg,#0d1b2a,#1b263b,#415a77,#778da9);background-size:400% 400%;animation:liveBg 15s ease infinite;z-index:-1;"></div>
          <!-- Card Container -->
          <div style="
            background:#1b263b;
            border-radius:14px;
            overflow:hidden;
            box-shadow:0 6px 28px rgba(0,0,0,0.3);
            animation: fadeIn 1.2s ease;
            border:1px solid #415a77;
          ">
            <!-- Header -->
            <div style="
              background:linear-gradient(135deg,#0d1b2a,#415a77);
              padding:30px 20px;
              text-align:center;
              color:#fff;
            ">
              <h1 style="margin:0;font-size:2rem;font-weight:700;">🔐 EMS Verification</h1>
              <p style="margin:8px 0 0;font-size:1rem;color:#b8c2d1;">Your One-Time Password (OTP)</p>
            </div>
            <!-- Content -->
            <div style="padding:40px 25px;text-align:center;color:#e0e1dd;">
              <p style="font-size:1.1rem;margin-bottom:25px;">
                Hello! Thank you for registering with <strong style="color:#778da9;">EMS</strong>.
                Use the verification code below to verify your email:
              </p>
              <!-- OTP Box -->
              <div style="
                display:inline-block;
                background:#0d1b2a;
                color:#fff;
                font-size:2.6rem;
                letter-spacing:10px;
                padding:22px 45px;
                border-radius:12px;
                box-shadow:0 4px 16px rgba(0,0,0,0.4), 0 0 20px rgba(65,90,119,0.5);
                margin-bottom:25px;
                border:2px solid #415a77;
              ">
                ${otp}
              </div>
              <p style="font-size:1rem;color:#b8c2d1;margin-bottom:35px;">
                Enter this OTP on the verification page to complete your signup.
              </p>
              <!-- Button -->
              <a href="http://localhost:8090/user/dashboard"
                style="
                  display:inline-block;
                  padding:14px 34px;
                  background:linear-gradient(135deg,#415a77,#0d1b2a);
                  color:#fff;
                  text-decoration:none;
                  font-size:1rem;
                  font-weight:600;
                  border-radius:8px;
                  box-shadow:0 3px 12px rgba(0,0,0,0.3);
                  transition:0.3s;
                  border:1px solid #778da9;
                ">
                🚀 Go to EMS Portal
              </a>
            </div>
            <!-- Footer -->
            <div style="
              background:#0d1b2a;
              padding:18px;
              text-align:center;
              color:#b8c2d1;
              font-size:0.85rem;
            ">
              <p style="margin:4px 0;">If you didn’t request this email, please ignore it.</p>
              <p style="margin:3px 0;">&copy; ${new Date().getFullYear()} EMS Admin • All Rights Reserved</p>
            </div>
          </div>
        </div>
        <!-- Minimal animation support -->
        <style>
        @keyframes fadeIn {
            from { opacity:0; transform: translateY(10px); }
            to { opacity:1; transform: translateY(0); }
        }
        @keyframes liveBg {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @media only screen and (max-width:480px) {
            div[style*="padding:40px 25px"] {
                padding:25px 15px !important;
            }
            div[style*="font-size:2.6rem"] {
                font-size:2rem !important;
                padding:18px 30px !important;
                letter-spacing:6px !important;
            }
            a[style*="padding:14px"] {
                padding:12px 24px !important;
            }
        }
        </style>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}: ${otp}`);
        return true;
    } catch (err) {
        console.error(`Failed to send OTP to ${email}:`, err);
        return false;
    }
}

export async function sendWelcomeMail(email) {
    const mailOptions = {
        from: process.env.BREVO_FROM || 'abhishek4712ak1@gmail.com',
        to: email,
        subject: 'Welcome to EMS - Your Account is Ready!',
        html: `
        <div style="max-width:600px;margin:0 auto;padding:20px;background:#0d1b2a;font-family:'Segoe UI',Arial,sans-serif;position:relative;overflow:hidden;">
          <!-- Live Background -->
          <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(-45deg,#0d1b2a,#1b263b,#415a77,#778da9);background-size:400% 400%;animation:liveBg 15s ease infinite;z-index:-1;"></div>
          <!-- Card Container -->
          <div style="
            background:#1b263b;
            border-radius:14px;
            overflow:hidden;
            box-shadow:0 6px 28px rgba(0,0,0,0.3);
            animation: fadeIn 1.2s ease;
            border:1px solid #415a77;
          ">
            <!-- Header -->
            <div style="
              background:linear-gradient(135deg,#0d1b2a,#415a77);
              padding:30px 20px;
              text-align:center;
              color:#fff;
            ">
              <h1 style="margin:0;font-size:2rem;font-weight:700;">🎉 Welcome to EMS!</h1>
              <p style="margin:8px 0 0;font-size:1rem;color:#b8c2d1;">Your Account is Successfully Created</p>
            </div>
            <!-- Content -->
            <div style="padding:40px 25px;text-align:center;color:#e0e1dd;">
              <p style="font-size:1.1rem;margin-bottom:25px;">
                Congratulations! Your email has been verified and your account is now active.
                Welcome to the <strong style="color:#778da9;">EMS</strong> community!
              </p>
              <!-- Welcome Message -->
              <div style="
                background:#0d1b2a;
                padding:25px;
                border-radius:10px;
                margin-bottom:25px;
                border-left:5px solid #415a77;
                box-shadow:0 4px 16px rgba(0,0,0,0.2);
              ">
                <h2 style="margin:0 0 10px;color:#778da9;font-size:1.5rem;">Get Started Today!</h2>
                <p style="margin:0;color:#b8c2d1;font-size:1rem;">
                  Explore events, participate, and make the most of your EMS experience.
                  We're excited to have you on board!
                </p>
              </div>
              <!-- Button -->
              <a href="http://localhost:8090/user/login"
                style="
                  display:inline-block;
                  padding:14px 34px;
                  background:linear-gradient(135deg,#415a77,#0d1b2a);
                  color:#fff;
                  text-decoration:none;
                  font-size:1rem;
                  font-weight:600;
                  border-radius:8px;
                  box-shadow:0 3px 12px rgba(0,0,0,0.3);
                  transition:0.3s;
                  border:1px solid #778da9;
                ">
                🚀 Access Your Dashboard
              </a>
            </div>
            <!-- Footer -->
            <div style="
              background:#0d1b2a;
              padding:18px;
              text-align:center;
              color:#b8c2d1;
              font-size:0.85rem;
            ">
              <p style="margin:4px 0;">Thank you for choosing EMS!</p>
              <p style="margin:3px 0;">&copy; ${new Date().getFullYear()} EMS Admin • All Rights Reserved</p>
            </div>
          </div>
        </div>
        <!-- Minimal animation support -->
        <style>
        @keyframes fadeIn {
            from { opacity:0; transform: translateY(10px); }
            to { opacity:1; transform: translateY(0); }
        }
        @keyframes liveBg {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @media only screen and (max-width:480px) {
            div[style*="padding:40px 25px"] {
                padding:25px 15px !important;
            }
            div[style*="padding:25px"] {
                padding:20px 15px !important;
            }
            a[style*="padding:14px"] {
                padding:12px 24px !important;
            }
        }
        </style>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${email}`);
        return true;
    } catch (err) {
        console.error(`Failed to send welcome email to ${email}:`, err);
        return false;
    }
}
