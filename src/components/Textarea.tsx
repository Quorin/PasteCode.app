import { ErrorMessage, FieldProps } from "formik";
import Label from "./Label";

type Props = FieldProps & {
  label?: string;
  placeholder?: string;
  required?: boolean;
};

const Textarea = ({ label, required, field, placeholder }: Props) => {
  return (
    <div>
      {label && <Label htmlFor={field.name} required={required} text={label} />}
      <textarea
        id={field.name}
        className="block min-h-[30vh] max-h-[50vh] p-2.5 w-full text-sm rounded-lg border bg-zinc-700 border-zinc-600 placeholder-zinc-500 text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        placeholder={placeholder ?? ""}
        required={required}
        {...field}
      ></textarea>
      <p className="mt-2 text-xs text-red-500">
        <ErrorMessage name={field.name} />
      </p>
    </div>
  );
};

export default Textarea;
