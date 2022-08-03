const Footer = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow md:px-6 md:py-8 dark:bg-zinc-900">
      <footer className="container mx-auto">
        <ul className="flex flex-wrap items-center justify-center mb-6 text-sm text-zinc-500 sm:mb-0 dark:text-zinc-400">
          <li>
            <a href="#" className="mr-4 hover:underline md:mr-6 ">
              Github
            </a>
          </li>
          <li>
            <a href="#" className="mr-4 hover:underline md:mr-6">
              Privacy Policy
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              Contact
            </a>
          </li>
        </ul>
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 my-3">
          © 2022{" "}
          <span className="hover:underline cursor-pointer text-zinc-200">
            <span className="font-bold">Paste</span>Code
          </span>
          .app
        </p>
      </footer>
    </div>
  );
};

export default Footer;
