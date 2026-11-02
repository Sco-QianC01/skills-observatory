(() => {
  const key = "xinzhi-theme-v1";
  const modes = ["system", "light", "dark"];
  const preference = matchMedia("(prefers-color-scheme: dark)");
  let mode = "system";

  try {
    const stored = localStorage.getItem(key);
    if (modes.includes(stored)) mode = stored;
  } catch {}

  const apply = () => {
    const theme = mode === "system" ? (preference.matches ? "dark" : "light") : mode;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#1c1c1a" : "#faf9f6";
  };

  apply();
  preference.addEventListener("change", () => {
    if (mode === "system") apply();
  });

  document.addEventListener("DOMContentLoaded", () => {
    apply();
    const select = document.querySelector("select#theme");
    if (!select) return;
    select.value = mode;
    select.addEventListener("change", () => {
      mode = modes.includes(select.value) ? select.value : "system";
      apply();
      try {
        localStorage.setItem(key, mode);
      } catch {}
    });
  });
})();
