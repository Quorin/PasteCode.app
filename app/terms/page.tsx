import PageTitle from '@/components/ui/page-title'

const Terms = () => {
  return (
    <div className="flex flex-col">
      <PageTitle title="Terms and Conditions" />
      <div className="flex flex-col gap-6 text-sm">
        <p>
          By using our website these terms will automatically apply to you. Make
          sure that you read them carefully before using. You&apos;re allowed to
          copy and modify any part of the app. Source code is available on
          Github. We are committed to ensuring that the website is as useful and
          efficient as possible. We reserve the right to make changes to the
          application and disabling it at any time for any reason. We will never
          charge you for using the website, for that reason we reserve the right
          to pernamently close our service without any further notice. We
          reserve the right to modify or replace these Terms at any time. We may
          terminate or suspend your access to our website at any time, without
          prior notice, for any reason whatsoever, including without limitation
          if you breach the Terms and Conditions. You agree that we have no
          liability for any loss or damage caused by your use of this website.
          It is your responsibility to ensure that your device security. Do not
          enter any personal information into this website. You agree not to use
          the website for any purpose that is unlawful or unacceptable in the
          context of the use of the website.We are not responsible for the
          actions of other users.
        </p>
      </div>
    </div>
  )
}

export default Terms
