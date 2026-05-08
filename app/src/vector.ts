import Database from 'better-sqlite3';
import * as sqlite_vss from 'sqlite-vss';

const vectorDb = new Database('./db/sqlite/tech_assets.db');

// sqlite-vss エクステンションのロード
sqlite_vss.load(vectorDb);

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
    embedding(3)
  );
`);

export const saveToVector = (items: any[]) => {
  const insertMetadata = vectorDb.prepare(
    'INSERT INTO tech_metadata (projectName, techName, createDate, description) VALUES (?, ?, ?, ?)'
  );
  const insertVector = vectorDb.prepare(
    'INSERT INTO tech_vectors (rowid, embedding) VALUES (?, ?)'
  );

  const transaction = vectorDb.transaction((data) => {
    // 既存データの削除（簡易的な全入れ替えを想定）
    vectorDb.prepare('DELETE FROM tech_metadata').run();
    vectorDb.prepare('DELETE FROM tech_vectors').run();

    for (const item of data) {
      const result = insertMetadata.run(item.projectName, item.techName, item.createDate, item.description);
      const rowid = result.lastInsertRowid;
      insertVector.run(rowid, JSON.stringify(item.vector));
    }
  });

  transaction(items);
};

export const getVectorCount = () => {
  return vectorDb.prepare('SELECT count(*) as count FROM tech_metadata').get() as { count: number };
};

export const getVectors = async () => {
  //const metadata = await vectorDb.prepare('SELECT * FROM tech_metadata').all();
  const vectors = await vectorDb.prepare('SELECT rowid, embedding FROM tech_vectors').all();
  return { vectors };
};