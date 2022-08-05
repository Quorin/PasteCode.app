import { Field, Form, Formik, FormikHelpers } from "formik";
import { NextPage } from "next";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Button from "../../components/Button";
import Input from "../../components/Input";

const initialValues = {
  email: "",
};

type RemindPasswordFields = typeof initialValues;

const RemindPassword: NextPage = () => {
  const [visible, setVisible] = useState(true);

  const handleSubmit = async (
    { email }: RemindPasswordFields,
    helpers: FormikHelpers<RemindPasswordFields>
  ) => {
    console.log(email);

    toast.custom(
      (t) => (
        <div className="text-white bg-blue-700 px-5 py-2.5 rounded-lg">
          <p>Your email has been sent if we found your account</p>
        </div>
      ),
      { position: "bottom-center" }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ handleSubmit, values }) => (
          <Form onSubmit={handleSubmit}>
            <h2 className="text-3xl text-zinc-200 mb-10 font-semibold">
              Remind password
            </h2>
            <div className="mb-6">
              <Field
                name="email"
                type="email"
                component={Input}
                label="Email"
                required
                placeholder="hello@world.localhost"
                value={values.email}
              />
            </div>
            <Button type="submit" className="px-20">
              Submit
            </Button>
            <Toaster />
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RemindPassword;
