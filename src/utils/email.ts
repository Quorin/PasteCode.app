import * as sendGrid from '@sendgrid/mail'
import { getBaseUrl } from '../pages/_app'

enum EmailType {
  ResetPassword,
  ConfirmAccount,
}

export const sendConfirmationEmail = async (
  email: string,
  id: string,
  code: string,
) => {
  sendGrid.setApiKey(process.env.SENDGRID_API_KEY!)

  await sendGrid.send({
    from: process.env.SENDGRID_FROM_EMAIL!,
    to: email,
    subject: getSubject(EmailType.ConfirmAccount),
    html: `<a href="${getBaseUrl()}/auth/confirm-account?id=${id}&code=${code}">Click here to confirm your account.</a>`,
  })
}

export const sendResetPasswordEmail = async (
  email: string,
  id: string,
  code: string,
) => {
  sendGrid.setApiKey(process.env.SENDGRID_API_KEY!)

  await sendGrid.send({
    from: process.env.SENDGRID_FROM_EMAIL!,
    to: email,
    subject: getSubject(EmailType.ResetPassword),
    html: `<a href="${getBaseUrl()}/auth/reset-password-confirmation?id=${id}&code=${code}">Click here to reset your password.</a>`,
  })
}

const getEmailUrl = () => {
  if (process.env.NODE_ENV === 'production' && process.env.APP_URL) {
    return process.env.APP_URL
  }

  if (process.env.VERCEL_URL) {
    return process.env.VERCEL_URL
  }

  return 'PasteCode'
}

const getSubject = (emailType: EmailType): string => {
  const url = `[${getEmailUrl()}]`

  switch (emailType) {
    case EmailType.ResetPassword:
      return `${url} Reset password`
    case EmailType.ConfirmAccount:
      return `${url} Confirm account`
  }
}
