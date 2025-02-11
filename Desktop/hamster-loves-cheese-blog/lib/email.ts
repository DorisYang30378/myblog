import nodemailer from "nodemailer"

export async function sendResetPasswordEmail(email: string, token: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "重設密碼請求",
    html: `
      <h1>重設密碼</h1>
      <p>您好，</p>
      <p>我們收到了您的重設密碼請求。請點擊下方連結重設密碼：</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>此連結將在 24 小時後失效。</p>
      <p>如果您沒有要求重設密碼，請忽略此郵件。</p>
    `
  })
} 