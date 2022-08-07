import * as sendGrid from "@sendgrid/mail";
import { getBaseUrl } from "../pages/_app";

enum EmailType {
  ResetPassword,
}

export const sendResetPasswordEmail = async (
  email: string,
  id: string,
  code: string
) => {
  sendGrid.setApiKey(process.env.SENDGRID_API_KEY!);

  await sendGrid.send({
    from: process.env.SENDGRID_FROM_EMAIL!,
    to: email,
    subject: getSubject(EmailType.ResetPassword),
    html: `<a href="${getBaseUrl()}/auth/reset-password-confirmation?id=${id}&code=${code}">Click here to reset your password.</a>`,
  });
};

const getSubject = (emailType: EmailType): string => {
  switch (emailType) {
    case EmailType.ResetPassword:
      return "[PasteCode.app] Reset password";
  }
};
