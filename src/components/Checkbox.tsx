import { ErrorMessage, FieldProps } from "formik";
import Label from "./Label";

type Props = FieldProps & {
  label?: string;
  required?: boolean;
};

const Checkbox = ({ label, required, field }: Props) => {
  return (
    <div className="mb-6">
      <div className="flex flex-row gap-3 place-items-center">
        <input
          id={field.name}
          type="checkbox"
          multiple={false}
          {...field}
          className="w-4 h-4 text-blue-600 accent-blue-500 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2 bg-gray-700 border-gray-600"
        />
        {label && (
          <div className="-mb-2">
            <Label htmlFor={field.name} required={required} text={label} />
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-red-500">
        <ErrorMessage name={field.name} />
      </p>
    </div>
  );
};

export default Checkbox;
