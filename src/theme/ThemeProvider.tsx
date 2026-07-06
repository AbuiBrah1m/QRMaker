import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggle: () => undefined,
})

/**
 * Provides the current theme and a toggle. The choice is persisted to
 * localStorage and applied by toggling the `dark` class on <html>, which drives
 * all of the CSS variables defined in index.css.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('qr-studio-theme') as Theme | null
    return stored ?? 'dark'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('qr-studio-theme', theme)
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }),
    [theme],
  )

  return <ThemeContext.Provider value={ value }>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
