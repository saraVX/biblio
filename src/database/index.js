
export { getDB } from './connexion';
export { initDB } from './schema';
export { initDB as initDb } from './schema';

export {
  insererUtilisateur,
  verifierConnexion,
  modifierUtilisateur,
  listerUtilisateurs,
} from './utilisateurs';

export {
  initProduits,
  listerProduits,
  compterProduits,
  listerCategories,
  insererProduit,
  rechercherProduits,
} from './produits';
