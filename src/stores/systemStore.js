import { defineStore } from 'pinia'
import ua from '@/locales/ua'
import en from '@/locales/en'
import de from '@/locales/de'
import pl from '@/locales/pl'

export const useSystemStore = defineStore('system', {
  state: () => ({
    systemTheme: localStorage.getItem('theme') || 'dark',
    accentColor: localStorage.getItem('accent') || 'green',
    fontSize: localStorage.getItem('fontSize') || 'medium',
    currentLanguage: localStorage.getItem('language') || 'ua',
    // Нова опція для слабких пристроїв
    animationsEnabled: localStorage.getItem('animations') !== 'false',
    locales: { ua, en, de, pl },
  }),

  getters: {
    t: (state) => (path) => {
      const keys = path.split('.')
      let result = state.locales[state.currentLanguage]
      for (const key of keys) {
        if (result?.[key]) result = result[key]
        else return path
      }
      return result
    },
    resolvedTheme: (state) => {
      if (state.systemTheme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return state.systemTheme
    },
  },

  actions: {
    setSystemTheme(theme) {
      this.systemTheme = theme
      localStorage.setItem('theme', theme)
    },
    setAccentColor(color) {
      this.accentColor = color
      localStorage.setItem('accent', color)
    },
    setFontSize(size) {
      this.fontSize = size
      localStorage.setItem('fontSize', size)
    },
    setLanguage(lang) {
      this.currentLanguage = lang
      localStorage.setItem('language', lang)
    },
    toggleAnimations() {
      this.animationsEnabled = !this.animationsEnabled
      localStorage.setItem('animations', this.animationsEnabled)
    },
    initThemeListener() {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', () => {
        if (this.systemTheme === 'system') {
        }
      })
    },
  },
})
