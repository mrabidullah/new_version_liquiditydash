/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './js/**/*.js'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        bg: 'var(--bg)', surf: 'var(--surf)', ink: 'var(--ink)', mut: 'var(--mut)', cap: 'var(--cap)',
        line: 'var(--line)', hov: 'var(--hov)', pri: 'var(--pri)', onpri: 'var(--onpri)',
        acc: '#F2B705', navy: { 900: '#0A1220', 600: '#172B5E' }
      }
    }
  }
}
