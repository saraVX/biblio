const REGEX_EMAIL = /^\S+@\S+\.\S+$/;

export const validerNom = (nom) =>
  nom.trim() ? null : 'Le nom est obligatoire';

export const validerPrenom = (prenom) =>
  prenom.trim() ? null : 'Le prénom est obligatoire';

export const validerEmail = (email) =>
  REGEX_EMAIL.test(email) ? null : 'Email invalide';

export const validerTelephone = (telephone) =>
  !telephone || /^[0-9+ ]{8,15}$/.test(telephone)
    ? null
    : 'Téléphone invalide';

export const validerMdp = (mdp) =>
  mdp.length >= 6 ? null : '6 caractères minimum';

export const validerConfirmation = (mdp, confirmation) =>
  mdp === confirmation ? null : 'Les mots de passe diffèrent';

export const validerCgu = (cgu) =>
  cgu ? null : 'Vous devez accepter les CGU';

export const validerFormulaire = (form, cgu) => {
  const resultats = {
    nom: validerNom(form.nom),
    prenom: validerPrenom(form.prenom),
    email: validerEmail(form.email),
    telephone: validerTelephone(form.telephone),
    mdp: validerMdp(form.mdp),
    confirmation: validerConfirmation(form.mdp, form.confirmation),
    cgu: validerCgu(cgu),
  };

  return Object.fromEntries(
    Object.entries(resultats).filter(
      ([, message]) => message !== null
    )
  );
};