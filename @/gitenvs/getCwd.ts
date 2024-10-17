export const getCwd = () => {
  const cwd = process.env.GITENVS_DIR || process.cwd()
  return cwd
}
