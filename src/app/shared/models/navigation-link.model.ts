export interface NavigationLink {
  label: string;
  /**
   * Router link path used across navigation components.
   * Use absolute paths for clarity, e.g. `/contact`.
   */
  path: string;
  /**
   * Marks routes that should only match on an exact URL (e.g. the home page).
   */
  exact?: boolean;
}

