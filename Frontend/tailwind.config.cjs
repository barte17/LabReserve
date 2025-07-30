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
           // Główna paleta kolorów - biały i czerwony z ciemnymi akcentami
           primary: {
             50: '#fef2f2',
             100: '#fee2e2', 
             200: '#fecaca',
             300: '#fca5a5',
             400: '#f87171',
             500: '#ef4444',  // Główny czerwony
             600: '#dc2626',  // Ciemniejszy czerwony
             700: '#b91c1c',
             800: '#991b1b',
             900: '#7f1d1d',
           },
           secondary: {
             50: '#f8fafc',
             100: '#f1f5f9',
             200: '#e2e8f0',
             300: '#cbd5e1',
             400: '#94a3b8',
             500: '#64748b',
             600: '#475569',
             700: '#334155',  // Ciemny akcent
             800: '#1e293b',
             900: '#0f172a',
           },
           neutral: {
             50: '#fafafa',
             100: '#f5f5f5',
             200: '#e5e5e5',
             300: '#d4d4d4',
             400: '#a3a3a3',
             500: '#737373',
             600: '#525252',
             700: '#404040',
             800: '#262626',
             900: '#171717',
           }
         },
         fontFamily: {
           sans: ["Inter", "system-ui", "sans-serif"],
           display: ["Inter", "system-ui", "sans-serif"]
         },
         boxShadow: {
           'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
           'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
           'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
         },
         animation: {
           'fade-in': 'fadeIn 0.5s ease-in-out',
           'slide-up': 'slideUp 0.3s ease-out',
           'scale-in': 'scaleIn 0.2s ease-out',
         },
         keyframes: {
           fadeIn: {
             '0%': { opacity: '0' },
             '100%': { opacity: '1' },
           },
           slideUp: {
             '0%': { transform: 'translateY(10px)', opacity: '0' },
             '100%': { transform: 'translateY(0)', opacity: '1' },
           },
           scaleIn: {
             '0%': { transform: 'scale(0.95)', opacity: '0' },
             '100%': { transform: 'scale(1)', opacity: '1' },
           },
         }
       },
     },
     plugins: [
       require('flowbite/plugin') 
     ],
   }