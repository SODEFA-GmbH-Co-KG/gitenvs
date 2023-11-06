/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options} */
const config = {
  singleQuote: true,
  semi: false,
  trailingComma: 'all',
  plugins: ['prettier-plugin-tailwindcss'],
}

export default config
