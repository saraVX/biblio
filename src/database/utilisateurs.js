
import * as Crypto from 'expo-crypto';
import { getDB } from './connexion';

const creerEmpreinte = async (motDePasse) => {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    motDePasse
  );
};

export const insererUtilisateur = async (form, newsletter) => {
  const db = await getDB();
  const empreinte = await creerEmpreinte(form.mdp);

  try {
    const resultat = await db.runAsync(
      `INSERT INTO utilisateurs
      (nom, prenom, email, telephone, mot_de_passe_hash, newsletter)
      VALUES (?, ?, ?, ?, ?, ?)`,
      form.nom.trim(),
      form.prenom.trim(),
      form.email.trim().toLowerCase(),
      form.telephone.trim(),
      empreinte,
      newsletter ? 1 : 0
    );

    return resultat.lastInsertRowId;
  } catch (erreur) {
    if (erreur.message?.includes('UNIQUE')) {
      throw new Error('Cette adresse e-mail est déjà utilisée.');
    }

    throw erreur;
  }
};

export const verifierConnexion = async (email, motDePasse) => {
  const db = await getDB();
  const empreinte = await creerEmpreinte(motDePasse);

  const utilisateur = await db.getFirstAsync(
    `SELECT id, nom, prenom, email, telephone, adresse, latitude, longitude
     FROM utilisateurs
     WHERE email = ? AND mot_de_passe_hash = ?`,
    email.trim().toLowerCase(),
    empreinte
  );

  return utilisateur || null;
};

export const modifierUtilisateur = async (id, form) => {
  const db = await getDB();
  const latitude = form.latitude.trim() === '' ? null : Number(form.latitude);
  const longitude = form.longitude.trim() === '' ? null : Number(form.longitude);

  if (
    (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) ||
    (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180))
  ) {
    throw new Error('Les coordonnées saisies ne sont pas valides.');
  }

  try {
    await db.runAsync(
      `UPDATE utilisateurs
       SET nom = ?, prenom = ?, email = ?, telephone = ?, adresse = ?, latitude = ?, longitude = ?
       WHERE id = ?`,
      form.nom.trim(),
      form.prenom.trim(),
      form.email.trim().toLowerCase(),
      form.telephone.trim(),
      form.adresse.trim(),
      latitude,
      longitude,
      id
    );

    return db.getFirstAsync(
      `SELECT id, nom, prenom, email, telephone, adresse, latitude, longitude
       FROM utilisateurs WHERE id = ?`,
      id
    );
  } catch (erreur) {
    if (erreur.message?.includes('UNIQUE')) {
      throw new Error('Cette adresse e-mail est déjà utilisée.');
    }
    throw erreur;
  }
};

export const listerUtilisateurs = async () => {
  const db = await getDB();

  return db.getAllAsync(
    `SELECT id, nom, prenom, email, telephone, newsletter
     FROM utilisateurs
     ORDER BY id DESC`
  );
};
