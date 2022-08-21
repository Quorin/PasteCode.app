export const getQueryArg = (argName: string | string[] | undefined) =>
  Array.isArray(argName) ? argName[0] : argName
