export interface SendOtpEmailInput {
  to: string
  code: string
}

export interface SendOtpEmailResult {
  sent: boolean
}

/** Placeholder: logs OTP instead of sending mail. Replace with nodemailer/etc. */
export async function sendOtpEmail(input: SendOtpEmailInput): Promise<SendOtpEmailResult> {
  console.info('[smtp.service] sendOtpEmail (stub)', { to: input.to, code: input.code })
  return { sent: true }
}
