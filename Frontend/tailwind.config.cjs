/** @type {import('tailwindcss').Config} */
   module.exports = {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
       "./node_modules/flowbite/**/*.js" 
     ],
     theme: {
       extend: {
         colors: {
           'light-bg': "#ffffff",
           'dark-bg': "#242424",
           'light-text': "#213547",
           'dark-text': "#ffffff",
           'accent': "#111111",
           'muted': "#f5f5f5",
         },
         fontFamily: {
           sans: ["Inter", "sans-serif"]
         }
       },
     },
     plugins: [
       require('flowbite/plugin') 
     ],
   }