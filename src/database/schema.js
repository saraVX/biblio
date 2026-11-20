
import { getDB } from './connexion';
import { initProduits } from './produits';

export const initDB = async () => {
  const db = await getDB();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS utilisateurs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      telephone TEXT,
      adresse TEXT,
      latitude REAL,
      longitude REAL,
      mot_de_passe_hash TEXT NOT NULL,
      newsletter INTEGER DEFAULT 0,
      date_creation TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  for (const colonne of [
    'ALTER TABLE utilisateurs ADD COLUMN adresse TEXT',
    'ALTER TABLE utilisateurs ADD COLUMN latitude REAL',
    'ALTER TABLE utilisateurs ADD COLUMN longitude REAL',
  ]) {
    try {
      await db.execAsync(colonne);
    } catch (erreur) {
      if (!erreur.message?.includes('duplicate column name')) throw erreur;
    }
  }

  await initProduits();
};
