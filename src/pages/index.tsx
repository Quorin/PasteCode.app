import { Field, Form, Formik, FormikHelpers } from 'formik'
import type { NextPage } from 'next'
import Button from '../components/Button'
import Input from '../components/Input'
import Select, { Option } from '../components/Select'
import Textarea from '../components/Textarea'

const values = {
  title: '',
  description: '',
  content: '',
  expiration: 'never',
  style: 'cpp',
}

type FormValues = typeof values

const Home: NextPage = () => {
  const handleSubmit = (
    values: FormValues,
    helpers: FormikHelpers<FormValues>,
  ) => {
    console.log(values)
  }

  return (
    <div className="flex flex-col gap-6">
      <Formik initialValues={values} onSubmit={handleSubmit}>
        {({ handleSubmit, values }) => (
          <Form onSubmit={handleSubmit}>
            <h2 className="text-3xl text-zinc-200 mb-10 font-semibold">
              Create new paste
            </h2>
            <div className="mb-6">
              <Field
                name="title"
                component={Input}
                label="Title"
                placeholder="In file included from a.cpp:1:0,
              from a.cpp:1,
              from a.cpp:1,
              from a.cpp:1,
              from a.cpp:1:
  a.cpp:2:1: error: ‘p’ does not name a type"
                required={true}
              />
            </div>
            <div className="mb-6">
              <Field
                name="description"
                component={Input}
                label="Description"
                placeholder={
                  "ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'by pwd' at line 1"
                }
              />
            </div>
            <div className="mb-6">
              <Field
                name="content"
                component={Textarea}
                required
                label="Content"
                placeholder="c++ foo.cpp -o foo -ferror-limit=-1
              In file included from foo.cpp:2:
              In file included from /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/../lib/c++/v1/map:422:
              /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/../lib/c++/v1/__config:347:11: error: expected identifier or '{'
              namespace std {
                        ^
              foo.cpp:1:13: note: expanded from macro 'std'
              #define std +
                          ^"
              />
            </div>
            <div className="mb-6">
              <div className="flex justify-between flex-col md:flex-row">
                <div className="flex gap-5 mb-6 md:mb-0">
                  <div className="w-1/2 md:w-auto">
                    <Field
                      label="Expiration"
                      name="expiration"
                      value={values.expiration}
                      component={Select}
                      options={
                        [
                          { key: 'never', value: 'Never' },
                          { key: 'year', value: '1 Year' },
                          { key: 'month', value: '1 Month' },
                          { key: 'week', value: '1 Week' },
                          { key: 'day', value: '1 Day' },
                          { key: 'hour', value: '1 Hour' },
                          { key: '10m', value: '10 Minutes' },
                        ] as Option[]
                      }
                      required
                    ></Field>
                  </div>
                  <div className="w-1/2 md:w-auto">
                    <label
                      htmlFor="style"
                      className="block mb-2 text-sm font-medium text-zinc-300 after:content-['*'] after:ml-0.5 after:text-red-500"
                    >
                      Style
                    </label>
                    <Field
                      name="style"
                      value={values.style}
                      component={Select}
                      required
                      options={
                        [
                          { key: 'cpp', value: 'C++' },
                          { key: 'java', value: 'Java' },
                        ] as Option[]
                      }
                    >
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                    </Field>
                  </div>
                </div>

                <div className="flex self-center md:self-end gap-5">
                  <Button type="submit" className="px-10">
                    Submit
                  </Button>
                  <Button
                    type="reset"
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-800 px-5"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default Home
