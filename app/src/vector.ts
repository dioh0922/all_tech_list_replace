import Database from 'better-sqlite3';
import * as sqlite_vss from 'sqlite-vss';
import { generateEmbedding } from './genai.js';
import { mkdir } from 'fs/promises';

await mkdir('./db/sqlite', { recursive: true });
const vectorDb = new Database('./db/sqlite/tech_assets.db');

// sqlite-vss エクステンションのロード
const loadExtension = (db: any, getPathFn: () => string) => {
  const path = getPathFn();
  // better-sqlite3 (SQLite) は Linux で .so を自動補完するため、拡張子を除去して渡す
  const pathWithoutExt = path.replace(/\.(so|dylib|dll)$/, "");

  try {
    db.loadExtension(pathWithoutExt);
    console.log(`Successfully loaded extension: ${pathWithoutExt}`);
  } catch (e: any) {
    console.error(`Failed to load extension from ${pathWithoutExt}. Error: ${e.message}`);
    // フォールバックとして元のパスでも試すが、エラーは再スローする
    try {
      db.loadExtension(path);
      console.log(`Successfully loaded extension (fallback): ${path}`);
    } catch (fallbackError: any) {
      console.error(`Fallback failed for ${path}. Error: ${fallbackError.message}`);
      throw e; // 最初のエラーをスローする
    }
  }
};


const vss = sqlite_vss as any;
loadExtension(vectorDb, vss.getVectorLoadablePath);
loadExtension(vectorDb, vss.getVssLoadablePath);

// テーブルの初期化
vectorDb.exec(`
  CREATE TABLE IF NOT EXISTS tech_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectName TEXT,
    techName TEXT,
    createDate TEXT,
    description TEXT
  );
  CREATE VIRTUAL TABLE IF NOT EXISTS tech_vectors USING vss0(
    embedding(768)
  );
`);

export const saveToVector = async (items: any[]) => {
  const insertMetadata = vectorDb.prepare(
    'INSERT INTO tech_metadata (projectName, techName, createDate, description) VALUES (?, ?, ?, ?)'
  );
  const insertVector = vectorDb.prepare(
    'INSERT INTO tech_vectors (rowid, embedding) VALUES (?, ?)'
  );

  // 既存データの削除（初期化時にDROPしているので、ここでは不要だが念のため）
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
    const rowid = result.lastInsertRowid;
    insertVector.run(rowid, JSON.stringify(embedding));
  }
};

export const getVectorCount = () => {
  return vectorDb.prepare('SELECT count(*) as count FROM tech_metadata').get() as { count: number };
};

export const getVectors = async () => {
  const vectors = await vectorDb.prepare('SELECT rowid, embedding FROM tech_vectors').all();
  return { vectors };
};

export const searchNearVector = async (text: string) => {
  const inputEmbedding = await generateEmbedding(text)
  const results = vectorDb.prepare(`
    SELECT tm.projectName, tm.techName, tm.createDate, tm.description 
    FROM tech_vectors v
    JOIN tech_metadata tm ON v.rowid = tm.id
    WHERE vss_search(v.embedding, vss_search_params(?, 5))
    ORDER BY v.distance ASC
    LIMIT 5;
  `).all(JSON.stringify(inputEmbedding))
  return results;
}

export const isEmpty = () => {
  const countResult = vectorDb.prepare('SELECT COUNT(*) as count FROM tech_metadata').get() as { count: number };
  if (countResult.count > 0) {
    return false
  }
  return true
}