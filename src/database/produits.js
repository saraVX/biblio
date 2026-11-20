import { getDb } from './connexion';

const LIVRES_DE_DEPART = [
  ['Le Petit Prince', 'Jeunesse', 9.9, 12, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=320&h=460&q=80'],
  ['Les Misérables', 'Classiques', 19.9, 7, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=320&h=460&q=80'],
  ['L’Étranger', 'Romans', 11.5, 15, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=320&h=460&q=80'],
  ['Harry Potter à l’école des sorciers', 'Fantasy', 22, 22, 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=320&h=460&q=80'],
  ['Tintin au Tibet', 'BD', 15, 0, 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=320&h=460&q=80'],
  ['Apprendre React Native', 'Informatique', 34.9, 11, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=320&h=460&q=80'],
];

export const initProduits = async () => {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS produits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      categorie TEXT NOT NULL,
      prix REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      auteur TEXT,
      description TEXT
    );
  `);

  const colonnes = await db.getAllAsync('PRAGMA table_info(produits)');
  for (const colonne of ['image', 'auteur', 'description']) {
    if (!colonnes.some((existante) => existante.name === colonne)) {
      await db.execAsync(`ALTER TABLE produits ADD COLUMN ${colonne} TEXT`);
    }
  }

  await db.withTransactionAsync(async () => {
    const ancienneTable = await db.getFirstAsync(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
      'livres'
    );

    if (ancienneTable) {
      const anciensLivres = await db.getAllAsync('SELECT * FROM livres');
      for (const livre of anciensLivres) {
        const nom = livre.titre?.trim();
        if (!nom) continue;

        const existe = await db.getFirstAsync(
          'SELECT id FROM produits WHERE nom = ?',
          nom
        );
        if (existe) {
          await db.runAsync(
            `UPDATE produits
             SET auteur = COALESCE(auteur, ?),
                 description = COALESCE(description, ?)
             WHERE id = ?`,
            livre.auteur || '',
            livre.description || '',
            existe.id
          );
          continue;
        }

        const prix = Number.parseFloat(String(livre.prix ?? '').replace(',', '.'));
        const stock = Number(livre.disponible) === 0 ? 0 : 1;
        await db.runAsync(
          `INSERT INTO produits
           (nom, categorie, prix, stock, image, auteur, description)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          nom,
          livre.categorie || 'Autre',
          Number.isFinite(prix) ? prix : 0,
          stock,
          livre.image || '',
          livre.auteur || '',
          livre.description || ''
        );
      }

      await db.execAsync('DROP TABLE livres');
    }

    const { nombre } = await db.getFirstAsync(
      'SELECT COUNT(*) AS nombre FROM produits'
    );
    if (nombre === 0) {
      for (const [nom, categorie, prix, stock, image] of LIVRES_DE_DEPART) {
        await db.runAsync(
          'INSERT INTO produits (nom, categorie, prix, stock, image) VALUES (?, ?, ?, ?, ?)',
          nom,
          categorie,
          prix,
          stock,
          image
        );
      }
    }

    await db.execAsync('DROP TABLE IF EXISTS migrations');
  });
};

const FILTRE = 'nom LIKE ? AND (? IS NULL OR categorie = ?)';
const parametresFiltre = (recherche, categorie) => [
  `%${recherche.trim()}%`,
  categorie,
  categorie,
];

export const listerProduits = async ({
  recherche = '',
  categorie = null,
  limite = -1,
  decalage = 0,
} = {}) => {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT id, nom, categorie, prix, stock, image FROM produits
     WHERE ${FILTRE}
     ORDER BY nom, id
     LIMIT ? OFFSET ?`,
    ...parametresFiltre(recherche, categorie),
    limite,
    decalage
  );
};

export const compterProduits = async ({ recherche = '', categorie = null } = {}) => {
  const db = await getDb();
  const { n } = await db.getFirstAsync(
    `SELECT COUNT(*) AS n FROM produits WHERE ${FILTRE}`,
    ...parametresFiltre(recherche, categorie)
  );
  return n;
};

export const listerCategories = async () => {
  const db = await getDb();
  const lignes = await db.getAllAsync(
    'SELECT DISTINCT categorie FROM produits ORDER BY categorie'
  );
  return lignes.map((ligne) => ligne.categorie);
};

export const insererProduit = async (nom, categorie, prix, stock) => {
  const db = await getDb();
  const resultat = await db.runAsync(
    'INSERT INTO produits (nom, categorie, prix, stock) VALUES (?, ?, ?, ?)',
    nom,
    categorie,
    prix,
    stock
  );
  return resultat.lastInsertRowId;
};

export const rechercherProduits = async (recherche) =>
  listerProduits({ recherche });
