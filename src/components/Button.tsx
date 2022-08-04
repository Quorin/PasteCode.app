import { cx } from "class-variance-authority";
import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ children, className, ...res }: Props) => {
  return (
    <button
      className={cx(
        "text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-10 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800",
        className
      )}
      {...res}
    >
      {children}
    </button>
  );
};

export default Button;
