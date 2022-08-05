import { Field, Form, Formik, FormikHelpers } from "formik";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Router from "next/router";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { routes } from "../../constants/routes";

const initialValues = {
  email: "",
  password: "",
};

type LoginFields = typeof initialValues;

const Login = () => {
  const handleSubmit = async (
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
    <div className="flex flex-col gap-6">
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ handleSubmit, values }) => (
          <Form onSubmit={handleSubmit}>
            <h2 className="text-3xl text-zinc-200 mb-10 font-semibold">
              Login
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

            <div className="mb-6">
              <Field
                name="password"
                type="password"
                label="Password"
                component={Input}
                placeholder="********"
                required
                value={values.password}
              />
            </div>

            <div className="mb-6">
              <Link href={routes.AUTH.REMIND_PASSWORD}>
                <p className="text-red-400 text-sm hover:underline cursor-pointer">
                  Remind password
                </p>
              </Link>
            </div>

            <Button type="submit" className="px-20">
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;
