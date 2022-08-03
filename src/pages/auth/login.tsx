import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { signIn } from "next-auth/react";
import Router from "next/router";
import { routes } from "../../constants/routes";

interface LoginFields {
  email: string;
  password: string;
}

const Login = () => {
  const initialValues: LoginFields = {
    email: "",
    password: "",
  };

  const onSubmit = async (
    { email, password }: LoginFields,
    helpers: FormikHelpers<LoginFields>
  ) => {
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.ok && res?.status === 200) {
      Router.push(routes.HOME);
      return;
    }

    helpers.setErrors({
      email: "Invalid email or password",
      password: "Invalid email or password",
    });
  };

  return (
    <div className="container mx-auto">
      <Formik initialValues={initialValues} onSubmit={onSubmit}>
        {({ errors }) => (
          <Form className="flex flex-col border-red-500 border-2">
            <label htmlFor="email">Email</label>
            <Field id="email" name="email" type="email" />
            <ErrorMessage name="email" component="div" />
            <label htmlFor="password">Password</label>
            <Field id="password" name="password" type="password" />
            <ErrorMessage name="password" component="div" />
            <button type="submit">Submit</button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;
