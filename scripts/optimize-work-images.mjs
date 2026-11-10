import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const root = path.resolve("public/assets/work");
const maxEdge = 2000;
const quality = 78;

async function optimizeDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let saved = 0;
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      saved += await optimizeDir(full);
      continue;
    }
    if (!/\.jpe?g$/i.test(entry.name)) continue;

    const before = (await fs.stat(full)).size;
    const temp = `${full}.tmp.jpg`;
    await sharp(full)
      .rotate()
      .resize({
        width: maxEdge,
        height: maxEdge,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality, mozjpeg: true })
      .toFile(temp);

    const after = (await fs.stat(temp)).size;
    if (after < before) {
      await fs.rename(temp, full);
      saved += before - after;
      console.log(
        `  ✓ ${path.relative(root, full)} ${(before / 1024 / 1024).toFixed(1)}MB → ${(after / 1024 / 1024).toFixed(1)}MB`
      );
    } else {
      await fs.unlink(temp);
      console.log(`  · ${path.relative(root, full)} kept`);
    }
  }
  return saved;
}

const total = await optimizeDir(root);
console.log(`\nSaved ${(total / 1024 / 1024).toFixed(1)} MB total`);
