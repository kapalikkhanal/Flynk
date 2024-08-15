/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}", // Include all files in the app directory and subdirectories
    "./<custom directory>/**/*.{js,jsx,ts,tsx}" // Replace <custom directory> with your actual directory name
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}