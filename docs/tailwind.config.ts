import defaultTheme from 'tailwindcss/defaultTheme'
import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        red: {
          50: "#FFF5F6",
          100: "#FEEBED",
          200: "#FED7DB",
          300: "#FDBFC4",
          400: "#FCA6AD",
          500: "#FB848E",
          600: "#FA6672",
          700: "#F83445",
          800: "#DE0719",
          900: "#A30512",
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'DM Sans fallback', ...defaultTheme.fontFamily.sans],
      },
    },
  },
}
