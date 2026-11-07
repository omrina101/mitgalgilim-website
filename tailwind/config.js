// Builds assets/site.css. After changing classes in INDEX.HTML, rebuild from the repo root:
//   npx tailwindcss@3.4.17 -c tailwind/config.js -i tailwind/input.css -o assets/site.css --minify
module.exports = {
  content: ['./INDEX.HTML', './privacy.html', './accessibility.html'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Rubik', 'sans-serif'],
        body: ['Assistant', 'sans-serif'],
      },
      colors: {
        ember: { 50: '#fdf6f3', 100: '#f9e8e1', 600: '#b42318', 700: '#962015', 800: '#7a1b12', 900: '#4a110b' },
        coal: { 800: '#231f1c', 900: '#171412' },
      },
    },
  },
};
