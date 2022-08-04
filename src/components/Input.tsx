import { FieldProps } from "formik";
import Label from "./Label";

type Props = FieldProps & {
  label?: string;
  placeholder?: string;
  required?: boolean;
};

const Input = ({ label, required, field, placeholder }: Props) => {
  return (
    <div>
      {label && <Label htmlFor={field.name} required={required} text={label} />}
      <input
        id={field.name}
        type="text"
        className="border text-sm rounded-lg block w-full p-2.5 bg-zinc-700 border-zinc-600 placeholder-zinc-500 text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        placeholder={placeholder ?? ""}
        required={required}
        {...field}
      ></input>
    </div>
  );
};

export default Input;
