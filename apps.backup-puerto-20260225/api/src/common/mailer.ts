import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface MailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: MailOptions) {
  // Si no hay SMTP configurado, solo loguear (útil en desarrollo)
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[MAIL] Para: ${to} | Asunto: ${subject} (SMTP no configurado, email no enviado)`)
    return
  }

  try {
    await transporter.sendMail({
      from: `"Intranet IES Félix de Azara" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })
  } catch (err) {
    // No queremos que un fallo de email tumbe la API
    console.error(`[MAIL] Error al enviar email a ${to}:`, err)
  }
}
