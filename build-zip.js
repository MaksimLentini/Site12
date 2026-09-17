#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════
// BUILD-ZIP.js — Создаёт ZIP архив всего проекта MegaChat
// Запуск: node build-zip.js
// ═══════════════════════════════════════════════════════════
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { readdir, stat } from 'fs/promises';
import { join, resolve, relative } from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const OUTPUT = join(__dirname, 'megachat.zip');
const SOURCE = __dirname;

// Файлы и папки которые НЕ включаем в архив
const EXCLUDE = [
  'node_modules',
  'server/node_modules',
  '.git',
  'megachat.zip',
  'data',
  'backups',
  'uploads',
  'logs',
  '.env',
  '.DS_Store',
  'Thumbs.db',
];

async function shouldInclude(path) {
  const name = path.split('/').pop() || path;
  return !EXCLUDE.some(ex => name === ex || name.startsWith('.'));
}

async function addDirectory(archive, dirPath, zipPath = '') {
  const entries = await readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    const relPath = join(zipPath, entry.name);
    
    if (!await shouldInclude(relPath)) continue;
    
    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      await addDirectory(archive, fullPath, relPath);
    } else if (stats.isFile()) {
      archive.file(fullPath, { name: relPath });
    }
  }
}

async function build() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   MegaChat — Создание ZIP архива        ║');
  console.log('╚══════════════════════════════════════════╝\n');

  const output = createWriteStream(OUTPUT);
  const archive = archiver('zip', { zlib: { level: 9 } });

  let totalSize = 0;
  let fileCount = 0;

  output.on('close', () => {
    totalSize = archive.pointer();
    console.log(`\n✅ Готово!`);
    console.log(`   📦 Файл: ${OUTPUT}`);
    console.log(`   📊 Размер: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   📁 Файлов: ${fileCount}`);
    console.log(`\n📋 Инструкция:`);
    console.log(`   1. Распакуйте megachat.zip`);
    console.log(`   2. cd megachat/server`);
    console.log(`   3. npm install`);
    console.log(`   4. npm start`);
    console.log(`   5. Откройте http://localhost:3001\n`);
  });

  archive.on('error', (err) => { throw err; });
  archive.on('entry', (entry) => {
    fileCount++;
    process.stdout.write(`\r   Добавлено файлов: ${fileCount}`);
  });

  archive.pipe(output);

  console.log('📦 Упаковка файлов...\n');

  // Добавляем корневые файлы
  const rootFiles = ['package.json', 'README.md', 'index.html', 'vite.config.js', 'tsconfig.json'];
  for (const file of rootFiles) {
    const path = join(SOURCE, file);
    if (existsSync(path)) {
      archive.file(path, { name: file });
    }
  }

  // Добавляем папки
  const dirs = ['src', 'server', 'public'];
  for (const dir of dirs) {
    const path = join(SOURCE, dir);
    if (existsSync(path)) {
      await addDirectory(archive, path, dir);
    }
  }

  // Добавляем dist если есть
  const distPath = join(SOURCE, 'dist');
  if (existsSync(distPath)) {
    await addDirectory(archive, distPath, 'dist');
  }

  await archive.finalize();
}

build().catch(err => {
  console.error('❌ Ошибка:', err.message);
  process.exit(1);
});
