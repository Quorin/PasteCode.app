import Link from 'next/link'
import { routes } from '@/constants/routes'

const Footer = () => {
  return (
    <div className="p-4 rounded-lg shadow md:px-6 md:py-8 ">
      <footer className="container mx-auto">
        <ul className="flex flex-col md:flex-row flex-wrap items-center justify-center mb-6 text-sm sm:mb-0 text-muted-foreground">
          <li>
            <a
              href="https://github.com/Quorin/PasteCode.app"
              className="hover:underline md:mr-6 "
            >
              Github
            </a>
          </li>
          <li className="hover:underline md:mr-6">
            <Link href={routes.PRIVACY_POLICY}>Privacy Policy</Link>
          </li>
          <li className="hover:underline md:mr-6">
            <Link href={routes.TERMS_AND_CONDITIONS}>Terms & Conditions</Link>
          </li>
          <li>
            <a href="mailto:xquoris@gmail.com" className="hover:underline">
              Contact
            </a>
          </li>
        </ul>
        <p className="text-center text-sm my-3">
          © {new Date().getFullYear()}{' '}
          <span className="hover:underline cursor-pointer">
            <span className="font-bold">Paste</span>Code
          </span>
        </p>
      </footer>
    </div>
  )
}

export default Footer
