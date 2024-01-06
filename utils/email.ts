'use server'

import sendGrid from '@sendgrid/mail'
import { getBaseUrl } from '@/utils/url'

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
    html: `<a href="${getBaseUrl()}/confirm-account?id=${id}&code=${code}">Click here to confirm your account.</a>`,
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
    html: `<a href="${getBaseUrl()}/reset-password/confirm?id=${id}&code=${code}">Click here to reset your password.</a>`,
  })
}

const emailPrefix = '[PasteCode]'

const getSubject = (emailType: EmailType): string => {
  switch (emailType) {
    case EmailType.ResetPassword:
      return `${emailPrefix} Reset password`
    case EmailType.ConfirmAccount:
      return `${emailPrefix} Confirm account`
  }
}
