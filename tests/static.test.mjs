import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("GitHub Pagesに必要なファイルがそろっている", async () => {
  const required = [
    "index.html",
    "styles.css",
    "app.mjs",
    "quiz-core.mjs",
    ".nojekyll",
    "assets/tech-nexus-guide.pdf",
    "assets/lesson-2.pdf",
  ];

  for (const relativePath of required) {
    const stat = await fs.stat(path.join(root, relativePath));
    assert.ok(stat.isFile(), `${relativePath} should be a file`);
  }
});

test("HTMLが存在するローカルファイルだけを参照する", async () => {
  const html = await fs.readFile(path.join(root, "index.html"), "utf8");
  const refs = [...html.matchAll(/(?:href|src)="(\.\/[^"#]+)(?:#[^"]*)?"/g)].map((match) => match[1]);

  for (const ref of refs) {
    const stat = await fs.stat(path.join(root, ref.replace(/^\.\//, "")));
    assert.ok(stat.isFile(), `${ref} should exist`);
  }
});

test("人間プログラミングとPython実行画面を含まない", async () => {
  const html = await fs.readFile(path.join(root, "index.html"), "utf8");
  assert.equal(html.includes("人間プログラミング"), false);
  assert.equal(html.includes("data-view=\"game\""), false);
  assert.equal(html.includes("run-program"), false);
});
