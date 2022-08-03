import { useRef, useState } from "react";

const Navbar = () => {
  const [menuCollapsed, setMenuCollapsed] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleCollapse = () => {
    setMenuCollapsed(!menuCollapsed);
    menuRef.current?.classList["toggle"]("hidden");
  };

  return (
    <div className="bg-white px-5 py-5 dark:bg-zinc-900 mb-10 border-b-[1px] border-zinc-700">
      <div className="container flex flex-wrap justify-between items-center mx-auto">
        <span className="self-center text-3xl font-semibold whitespace-nowrap dark:text-white">
          <span className="font-semibold">Paste</span>
          <span className="font-thin">Code</span>
        </span>
        <button
          onClick={() => handleCollapse()}
          data-collapse-toggle="navbar-default"
          type="button"
          className="inline-flex items-center p-2 ml-3 text-sm text-zinc-500 rounded-lg md:hidden hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:focus:ring-zinc-600"
          aria-controls="navbar-default"
          aria-expanded="false"
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
        <div
          ref={menuRef}
          className="hidden w-full md:block md:w-auto"
          id="navbar-default"
        >
          <ul className="flex flex-col p-4 mt-4 bg-zinc-50 rounded-lg border border-zinc-100 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 md:bg-white dark:bg-zinc-800 md:dark:bg-zinc-900 dark:border-zinc-700">
            <li>
              <a
                href="#"
                className="block py-2 pr-4 pl-3 text-white bg-blue-500 rounded md:bg-transparent md:text-blue-500 md:p-0 dark:text-white"
                aria-current="page"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block py-2 pr-4 pl-3 text-zinc-700 rounded hover:bg-zinc-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-zinc-400 md:dark:hover:text-white dark:hover:bg-zinc-700 dark:hover:text-white md:dark:hover:bg-transparent"
              >
                Login
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block py-2 pr-4 pl-3 text-zinc-700 rounded hover:bg-zinc-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-zinc-400 md:dark:hover:text-white dark:hover:bg-zinc-700 dark:hover:text-white md:dark:hover:bg-transparent"
              >
                Register
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
