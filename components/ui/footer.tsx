import Link from 'next/link'
import { routes } from '@/constants/routes'

const Footer = () => {
  return (
    <div className="p-4 rounded-lg shadow-sm md:px-6 md:py-8 ">
      <footer className="container mx-auto">
        <ul className="flex flex-col md:flex-row md:gap-8 gap-2 flex-wrap items-center justify-center mb-6 text-sm sm:mb-0 text-muted-foreground [&_li:hover_a]:underline">
          <li>
            <a href="https://github.com/Quorin/PasteCode.app">Github</a>
          </li>
          <li>
            <Link href={routes.PRIVACY_POLICY}>Privacy Policy</Link>
          </li>
          <li>
            <Link href={routes.TERMS_AND_CONDITIONS}>Terms & Conditions</Link>
          </li>
          <li>
            <a href="mailto:xquoris+abuse@gmail.com">Report Abuse</a>
          </li>
          <li>
            <a href="mailto:xquoris@gmail.com">Contact</a>
          </li>
        </ul>
        <p className="text-center text-sm my-3">
          © {new Date().getFullYear()}{' '}
          <span className="cursor-pointer hover:underline">
            <span className="font-bold">Paste</span>Code
          </span>
        </p>
      </footer>
    </div>
  )
}

export default Footer
