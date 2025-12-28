import { ref, watchEffect } from "vue";

const THEME_KEY = "juancharge-theme";

export function useTheme() {
  // Initialize from localStorage or system preference
  const isDark = ref(localStorage.getItem(THEME_KEY) === "dark");

  // Apply theme to document
  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem(THEME_KEY, "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem(THEME_KEY, "light");
    }
  };

  const toggleTheme = () => {
    isDark.value = !isDark.value;
    applyTheme();
  };

  // Watch for changes and apply immediately (conceptually, though function call handles it)
  // But strictly speaking, we just need to ensure it's applied on mount.
  // We can call applyTheme() implicitly when `isDark` changes if we watch it,
  // or just rely on toggleTheme. Let's watch it for reactivity simplicity.

  watchEffect(() => {
    applyTheme();
  });

  return {
    isDark,
    toggleTheme,
  };
}
