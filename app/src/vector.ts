import Database from 'better-sqlite3';
import * as sqlite_vec from 'sqlite-vec';
import { generateEmbedding } from './genai.js';
import { mkdir } from 'fs/promises';

await mkdir('./db/sqlite', { recursive: true });
const vectorDb = new Database('./db/sqlite/tech_assets.db');

// sqlite-vec エクステンションのロード
sqlite_vec.load(vectorDb);

// テーブルの初期化
try {
  // vss0 モジュールがロードされていないと、vss0 テーブルに対する DROP TABLE は失敗することがある
  // そのため、ここでは仮想テーブルを直接ドロップせず、エラーを無視するか、
  // もし移行が必要ならファイルを削除する運用を推奨する。
  // ここでは tech_vectors が vec0 であることを前提とする。
  vectorDb.exec(`DROP TABLE IF EXISTS tech_vectors;`);
} catch (e) {
  // エラーを無視
}

vectorDb.exec(`
  CREATE TABLE IF NOT EXISTS tech_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectName TEXT,
    techName TEXT,
    createDate TEXT,
    description TEXT
  );
  CREATE VIRTUAL TABLE IF NOT EXISTS tech_vectors USING vec0(
    embedding float[768]
  );
`);

export const saveToVector = async (items: any[]) => {
  const insertMetadata = vectorDb.prepare(
    'INSERT INTO tech_metadata (projectName, techName, createDate, description) VALUES (?, ?, ?, ?)'
  );
  const insertVector = vectorDb.prepare(
    'INSERT INTO tech_vectors (rowid, embedding) VALUES (?, ?)'
  );

  // 既存データの削除
  vectorDb.prepare('DELETE FROM tech_metadata').run();
  vectorDb.prepare('DELETE FROM tech_vectors').run();

  // APIコールを並列実行
  const promises = items.map(async (item) => {
    const inputText = `Project: ${item.projectName}\nTech: ${item.techName}\nDescription: ${item.description}`;
    const embedding = await generateEmbedding(inputText);
    return { item, embedding };
  });

  const results = await Promise.all(promises);

  // DBへの書き込み
  for (const { item, embedding } of results) {
    const result = insertMetadata.run(item.projectName, item.techName, item.createDate, item.description);
    const id = result.lastInsertRowid;
    // sqlite-vec (vec0) は主キーに厳密な整数を要求するため、BigInt() を使用する
    insertVector.run(BigInt(id), new Float32Array(embedding ?? []));
  }
};

export const getVectorCount = () => {
  return vectorDb.prepare('SELECT count(*) as count FROM tech_metadata').get() as { count: number };
};

export const getVectors = async () => {
  const vectors = await vectorDb.prepare('SELECT rowid, embedding FROM tech_vectors').all();
  return { vectors };
};

export const getMeta = async () => {
  const meta = await vectorDb.prepare('SELECT * FROM tech_metadata').all();
  return { meta };
};

export const searchNearVector = async (text: string) => {
  const inputEmbedding = await generateEmbedding(text)
  const results = vectorDb.prepare(`
    SELECT tm.projectName, tm.techName, tm.createDate, tm.description 
    FROM tech_vectors v
    JOIN tech_metadata tm ON v.rowid = tm.id
    WHERE v.embedding MATCH ?
      AND k = 5
    ORDER BY distance
  `).all(new Float32Array(inputEmbedding ?? []))
  return results;
}

export const addVector = async (item: any) => {
  const inputText = `Project: ${item.projectName}\nTech: ${item.techName}\nDescription: ${item.description}`
  const embedding = await generateEmbedding(inputText)
  const insertMetadata = vectorDb.prepare(
    'INSERT INTO tech_metadata (projectName, techName, createDate, description) VALUES (?, ?, ?, ?)'
  )
  const insertVector = vectorDb.prepare(
    'INSERT INTO tech_vectors (rowid, embedding) VALUES (?, ?)'
  )
  const result = insertMetadata.run(item.projectName, item.techName, item.createDate, item.description);
  const id = result.lastInsertRowid;
  // sqlite-vec (vec0) は主キーに厳密な整数を要求するため、BigInt() を使用する
  insertVector.run(BigInt(id), new Float32Array(embedding ?? []));
}

export const selectVectorByItem = async (item: any) => {
  const selectVector = vectorDb.prepare('SELECT * FROM tech_metadata WHERE projectName = ? AND techName = ?')
  .get(item.projectName, item.techName) as any
  return selectVector?.id ?? null
}

export const deleteVectorById = async (id: number) => {
  vectorDb.prepare('DELETE FROM tech_metadata WHERE id = ?').run(id);
  vectorDb.prepare('DELETE FROM tech_vectors WHERE rowid = ?').run(BigInt(id));
}

export const isEmpty = () => {
  const countResult = vectorDb.prepare('SELECT COUNT(*) as count FROM tech_metadata').get() as { count: number };
  if (countResult.count > 0) {
    return false
  }
  return true
}
