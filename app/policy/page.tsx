import PageTitle from '@/components/ui/page-title'

const Policy = () => {
  return (
    <div className="flex flex-col">
      <PageTitle title="Privacy Policy" />
      <div className="flex flex-col gap-6 text-sm">
        <p>
          This Privacy Policy document contains types of information that is
          collected and recorded by us and how we use it. If you have additional
          questions or require more information about our Privacy Policy, do not
          hesitate to contact us. This Privacy Policy applies only to our online
          activities and is valid for visitors to our website with regards to
          the information that they shared and/or collect in PasteCode. This
          policy is not applicable to any information collected offline or via
          channels other than this website. Our Privacy Policy was created with
          the help of the{' '}
          <a href="https://www.privacypolicygenerator.info/">
            Free Privacy Policy Generator
          </a>
          .
        </p>
        <h2 className="text-xl font-bold">Consent</h2>
        <p>
          By using our website, you hereby consent to our Privacy Policy and
          agree to its terms.
        </p>
        <h2 className="text-xl font-bold">Information we collect</h2>
        <p>
          We are collecting only your email address when you register an
          account.
        </p>
        <h2 className="text-xl font-bold">How we use your information</h2>
        <p>
          We use the information we collect only to send you important emails
          about your account.
        </p>

        <h2 className="text-xl font-bold">Cookies</h2>
        <p>
          Like any other website, we uses cookies. These cookies are used to
          store information including visitors&apos; preferences, and the pages
          on the website that the visitor accessed or visited. The information
          is used to optimize the users&apos; experience by customizing our web
          page content based on visitors&apos; browser type and/or other
          information. You can choose to disable cookies through your individual
          browser options. To know more detailed information about cookie
          management with specific web browsers, it can be found at the
          browsers&apos; respective websites.
        </p>
      </div>
    </div>
  )
}

export default Policy
