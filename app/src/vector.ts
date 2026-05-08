import Database from 'better-sqlite3';
import * as sqlite_vss from 'sqlite-vss';
import { GoogleGenerativeAI } from '@google/generative-ai';

const vectorDb = new Database('./db/sqlite/tech_assets.db');

// sqlite-vss エクステンションのロード
sqlite_vss.load(vectorDb);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-embedding-2"});

// テーブルの初期化
vectorDb.exec(`
  DROP TABLE IF EXISTS tech_vectors;
  DROP TABLE IF EXISTS tech_metadata;
  CREATE TABLE tech_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectName TEXT,
    techName TEXT,
    createDate TEXT,
    description TEXT
  );
  CREATE VIRTUAL TABLE tech_vectors USING vss0(
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
    const resultEmbed = await model.embedContent(inputText);
    const embedding = resultEmbed.embedding.values;
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
  //const metadata = await vectorDb.prepare('SELECT * FROM tech_metadata').all();
  const vectors = await vectorDb.prepare('SELECT rowid, embedding FROM tech_vectors').all();
  return { vectors };
};