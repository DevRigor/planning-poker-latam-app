import type { Config } from "tailwindcss"
import defaultConfig from "shadcn/ui/tailwind.config"

const config: Config = {
  ...defaultConfig,
  content: [
    ...defaultConfig.content,
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    ...defaultConfig.theme,
    extend: {
      ...defaultConfig.theme.extend,
      colors: {
        ...defaultConfig.theme.extend.colors,
        border: "hsl(214.3 31.8% 91.4%)",
        input: "hsl(214.3 31.8% 91.4%)",
        ring: "hsl(221.2 83.2% 53.3%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(222.2 84% 4.9%)",
        primary: {
          ...defaultConfig.theme.extend.colors.primary,
          DEFAULT: "hsl(221.2 83.2% 53.3%)",
          foreground: "hsl(210 40% 98%)",
        },
        secondary: {
          ...defaultConfig.theme.extend.colors.secondary,
          DEFAULT: "hsl(210 40% 96%)",
          foreground: "hsl(222.2 84% 4.9%)",
        },
        destructive: {
          ...defaultConfig.theme.extend.colors.destructive,
          DEFAULT: "hsl(0 84.2% 60.2%)",
          foreground: "hsl(210 40% 98%)",
        },
        muted: {
          ...defaultConfig.theme.extend.colors.muted,
          DEFAULT: "hsl(210 40% 96%)",
          foreground: "hsl(215.4 16.3% 46.9%)",
        },
        accent: {
          ...defaultConfig.theme.extend.colors.accent,
          DEFAULT: "hsl(210 40% 96%)",
          foreground: "hsl(222.2 84% 4.9%)",
        },
        popover: {
          ...defaultConfig.theme.extend.colors.popover,
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(222.2 84% 4.9%)",
        },
        card: {
          ...defaultConfig.theme.extend.colors.card,
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(222.2 84% 4.9%)",
        },
      },
      borderRadius: {
        ...defaultConfig.theme.extend.borderRadius,
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
    },
  },
  plugins: [...defaultConfig.plugins, require("tailwindcss-animate")],
}

export default config
