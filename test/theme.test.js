import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../public/theme.js", import.meta.url), "utf8");

function setup({ stored = null, dark = false, rejectRead = false, rejectWrite = false, hasSelect = true } = {}) {
  const documentEvents = new Map();
  const selectEvents = new Map();
  const mediaEvents = new Map();
  const writes = [];
  const root = { dataset: {}, style: {} };
  const meta = { content: "" };
  const select = {
    value: "",
    addEventListener: (name, listener) => selectEvents.set(name, listener),
  };
  const media = {
    matches: dark,
    addEventListener: (name, listener) => mediaEvents.set(name, listener),
  };
  runInNewContext(source, {
    document: {
      documentElement: root,
      querySelector: selector => selector === 'meta[name="theme-color"]' ? meta : hasSelect ? select : null,
      addEventListener: (name, listener) => documentEvents.set(name, listener),
    },
    matchMedia: query => {
      assert.equal(query, "(prefers-color-scheme: dark)");
      return media;
    },
    localStorage: {
      getItem: key => {
        assert.equal(key, "xinzhi-theme-v1");
        if (rejectRead) throw new Error("Storage denied");
        return stored;
      },
      setItem: (key, value) => {
        if (rejectWrite) throw new Error("Storage denied");
        writes.push([key, value]);
      },
    },
  });
  return {
    root, meta, select, writes,
    ready: () => documentEvents.get("DOMContentLoaded")(),
    change: value => {
      select.value = value;
      selectEvents.get("change")();
    },
    system: dark => {
      media.matches = dark;
      mediaEvents.get("change")();
    },
  };
}

function assertTheme(app, theme) {
  assert.equal(app.root.dataset.theme, theme);
  assert.equal(app.root.style.colorScheme, theme);
  assert.equal(app.meta.content, theme === "dark" ? "#1c1c1a" : "#faf9f6");
}

test("system preference applies synchronously before the selector binds", () => {
  const app = setup({ dark: true });
  assertTheme(app, "dark");
  assert.equal(app.select.value, "");
  app.ready();
  assert.equal(app.select.value, "system");
});

test("invalid stored modes fall back to system without changing storage", () => {
  for (const stored of ["", "Dark", "auto", "null", "<script>"]) {
    const app = setup({ stored, dark: true });
    app.ready();
    assertTheme(app, "dark");
    assert.equal(app.select.value, "system");
    assert.deepEqual(app.writes, []);
  }
});

test("stored explicit modes override the system preference", () => {
  for (const stored of ["light", "dark"]) {
    const app = setup({ stored, dark: stored === "light" });
    app.ready();
    assertTheme(app, stored);
    assert.equal(app.select.value, stored);
  }
});

test("storage read rejection still applies the system theme", () => {
  const app = setup({ rejectRead: true });
  app.ready();
  assertTheme(app, "light");
  assert.equal(app.select.value, "system");
});

test("light and dark selections apply immediately and persist only their own key", () => {
  const app = setup();
  app.ready();
  app.change("dark");
  assertTheme(app, "dark");
  app.change("light");
  assertTheme(app, "light");
  assert.deepEqual(app.writes, [["xinzhi-theme-v1", "dark"], ["xinzhi-theme-v1", "light"]]);
});

test("storage write rejection does not prevent selection or system tracking", () => {
  const app = setup({ rejectWrite: true });
  app.ready();
  app.change("dark");
  assertTheme(app, "dark");
  app.change("system");
  assertTheme(app, "light");
  app.system(true);
  assertTheme(app, "dark");
});

test("system changes apply only in system mode and resume after selecting system", () => {
  const app = setup({ stored: "system" });
  app.ready();
  app.system(true);
  assertTheme(app, "dark");
  app.change("light");
  app.system(false);
  app.system(true);
  assertTheme(app, "light");
  app.change("system");
  assertTheme(app, "dark");
  app.system(false);
  assertTheme(app, "light");
});

test("missing theme selector does not prevent system theme updates", () => {
  const app = setup({ hasSelect: false });
  assert.doesNotThrow(app.ready);
  app.system(true);
  assertTheme(app, "dark");
});
