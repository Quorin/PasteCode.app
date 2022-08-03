import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <form>
        <h2 className="text-3xl text-zinc-200 mb-10 font-semibold">
          Create new paste
        </h2>
        <div className="mb-6">
          <label
            htmlFor="title"
            className="block mb-2 text-sm font-medium text-zinc-300 after:content-['*'] after:ml-0.5 after:text-red-500"
          >
            Title
          </label>
          <input
            id="title"
            className="border text-sm rounded-lg block w-full p-2.5 bg-zinc-700 border-zinc-600 placeholder-zinc-500 text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            placeholder="In file included from a.cpp:1:0,
            from a.cpp:1,
            from a.cpp:1,
            from a.cpp:1,
            from a.cpp:1:
a.cpp:2:1: error: ‘p’ does not name a type"
            required
          ></input>
        </div>
        <div className="mb-6">
          <label
            htmlFor="description"
            className="block mb-2 text-sm font-medium text-zinc-300"
          >
            Description
          </label>
          <input
            id="description"
            className="border text-sm rounded-lg block w-full p-2.5 bg-zinc-700 border-zinc-600 placeholder-zinc-500 text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            placeholder="ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'by pwd' at line 1"
          ></input>
        </div>
        <div className="mb-6">
          {" "}
          <label
            htmlFor="body"
            className="block mb-2 text-sm font-medium text-zinc-300 after:content-['*'] after:ml-0.5 after:text-red-500"
          >
            Body
          </label>
          <textarea
            id="body"
            className="block min-h-[30vh] max-h-[50vh] p-2.5 w-full text-sm rounded-lg border bg-zinc-700 border-zinc-600 placeholder-zinc-500 text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            placeholder="c++ foo.cpp -o foo -ferror-limit=-1
            In file included from foo.cpp:2:
            In file included from /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/../lib/c++/v1/map:422:
            /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/../lib/c++/v1/__config:347:11: error: expected identifier or '{'
            namespace std {
                      ^
            foo.cpp:1:13: note: expanded from macro 'std'
            #define std +
                        ^"
            required
          ></textarea>
        </div>

        <div className="mb-6">
          <div className="flex justify-between flex-col md:flex-row">
            <div className="flex gap-5 mb-6 md:mb-0">
              <div className="w-1/2 md:w-auto">
                <label
                  htmlFor="expiration"
                  className="block mb-2 text-sm font-medium text-zinc-400 after:content-['*'] after:ml-0.5 after:text-red-500"
                >
                  Expiration
                </label>
                <select
                  defaultValue={"never"}
                  id="expiration"
                  className="border text-sm rounded-lg block w-full p-2.5 bg-zinc-700 border-zinc-600 placeholder-zinc-500 text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                >
                  <option value="never">Never</option>
                  <option value="year">1 Year</option>
                  <option value="month">1 Month</option>
                  <option value="week">1 Week</option>
                  <option value="day">1 Day</option>
                  <option value="hour">1 Hour</option>
                  <option value="10m">10 Minutes</option>
                </select>
              </div>
              <div className="w-1/2 md:w-auto">
                <label
                  htmlFor="style"
                  className="block mb-2 text-sm font-medium text-zinc-400 after:content-['*'] after:ml-0.5 after:text-red-500"
                >
                  Style
                </label>
                <select
                  defaultValue={"cpp"}
                  id="style"
                  className="border text-sm rounded-lg block w-full p-2.5 bg-zinc-700 border-zinc-600 placeholder-zinc-500 text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                >
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
              </div>
            </div>

            <div className="flex self-center md:self-end gap-5">
              <button
                type="submit"
                className="text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-10 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
              >
                Submit
              </button>
              <button
                type="reset"
                className="text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-red-600 hover:bg-red-700 focus:ring-red-800"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Home;
