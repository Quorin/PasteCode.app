import { Field, Form, Formik, FormikHelpers } from "formik";
import { NextPage } from "next";
import Router from "next/router";
import Button from "../components/Button";
import Checkbox from "../components/Checkbox";
import Input from "../components/Input";
import { routes } from "../constants/routes";
import { trpc } from "../utils/trpc";

const initialValues = {
  email: "",
  name: "",
  password: "",
  confirmPassword: "",
  agree: false,
};

type FormValues = typeof initialValues;

const Register: NextPage = () => {
  const { mutateAsync } = trpc.useMutation(["user.register"]);

  const handleSubmit = async (
    values: FormValues,
    helpers: FormikHelpers<FormValues>
  ) => {
    await mutateAsync(values, {
      onError: (error) => {
        helpers.setErrors(error?.data?.zodError?.fieldErrors ?? {});
      },
      onSuccess: () => {
        Router.push(routes.AUTH.LOGIN);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ handleSubmit, values }) => (
          <Form onSubmit={handleSubmit}>
            <h2 className="text-3xl text-zinc-200 mb-10 font-semibold">
              Create an account
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
                name="name"
                type="text"
                label="Name"
                placeholder=""
                component={Input}
                required
                value={values.name}
              />
            </div>
            <div className="mb-6">
              <Field
                name="password"
                type="password"
                label="Password"
                component={Input}
                placeholder="**** ***"
                required
                value={values.password}
              />
            </div>
            <div className="mb-6">
              <Field
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                component={Input}
                placeholder="**** ***"
                required
                value={values.confirmPassword}
              />
            </div>
            <div className="mb-6">
              <Field
                label={
                  <>
                    I agree with the{" "}
                    <a href="#" className="text-blue-500 hover:underline">
                      terms and conditions
                    </a>
                    .{" "}
                  </>
                }
                required={true}
                name="agree"
                component={Checkbox}
                value={values.agree}
              />
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

export default Register;
