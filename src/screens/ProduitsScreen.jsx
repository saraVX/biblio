import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import styles from './ProduitsStyles';
import {
  initDb,
  listerProduits,
  modifierUtilisateur,
  listerCategories,
} from '../database';

const formaterPrix = (prix) =>
  `${Number(prix).toFixed(2).replace('.', ',')} €`;

function CarteLivre({
  livre,
  favori,
  quantiteAuPanier,
  onBasculerFavori,
  onAjouterAuPanier,
}) {
  const stockEpuise = livre.stock === 0;
  const limitePanierAtteinte = quantiteAuPanier >= livre.stock;

  return (
    <View style={styles.carte}>
      <Image source={{ uri: livre.image }} style={styles.couverture} />
      <View style={styles.carteInformations}>
        <Text style={styles.nom}>{livre.nom}</Text>
        <Text style={styles.categorie}>{livre.categorie}</Text>
        <Text style={styles.prix}>{formaterPrix(livre.prix)}</Text>
        <Text style={[styles.stock, livre.stock === 0 && styles.rupture]}>
          {livre.stock === 0 ? 'Indisponible' : `${livre.stock} exemplaires`}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ajouter ${livre.nom} au panier`}
          disabled={stockEpuise || limitePanierAtteinte}
          onPress={() => onAjouterAuPanier(livre)}
          style={[
            styles.boutonPanier,
            (stockEpuise || limitePanierAtteinte) && styles.boutonDesactive,
          ]}
        >
          <Text style={styles.texteBoutonPanier}>
            {stockEpuise
              ? 'Indisponible'
              : limitePanierAtteinte
                ? 'Stock maximum'
                : 'Ajouter au panier'}
          </Text>
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        onPress={() => onBasculerFavori(livre.id)}
        style={styles.boutonFavori}
      >
        <Text style={styles.iconeFavori}>{favori ? '♥' : '♡'}</Text>
      </Pressable>
    </View>
  );
}

function CartePanier({ livre, onModifierQuantite, onRetirer }) {
  return (
    <View style={styles.cartePanier}>
      <View style={styles.informationsPanier}>
        <Text style={styles.nom}>{livre.nom}</Text>
        <Text style={styles.prix}>{formaterPrix(livre.prix)}</Text>
        <Text style={styles.sousTotal}>
          Sous-total : {formaterPrix(livre.prix * livre.quantite)}
        </Text>
      </View>
      <View style={styles.commandesPanier}>
        <View style={styles.controleQuantite}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Retirer un exemplaire de ${livre.nom}`}
            onPress={() => onModifierQuantite(livre.id, -1)}
            style={styles.boutonQuantite}
          >
            <Text style={styles.texteBoutonQuantite}>−</Text>
          </Pressable>
          <Text style={styles.quantite}>{livre.quantite}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ajouter un exemplaire de ${livre.nom}`}
            disabled={livre.quantite >= livre.stock}
            onPress={() => onModifierQuantite(livre.id, 1)}
            style={[
              styles.boutonQuantite,
              livre.quantite >= livre.stock && styles.boutonDesactive,
            ]}
          >
            <Text style={styles.texteBoutonQuantite}>+</Text>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Supprimer ${livre.nom} du panier`}
          onPress={() => onRetirer(livre.id)}
        >
          <Text style={styles.lienRetirer}>Supprimer</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ProduitsScreen({ utilisateur, navigation }) {
  const [livres, setLivres] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [categorieActive, setCategorieActive] = useState(null);
  const [favoris, setFavoris] = useState([]);
  const [onglet, setOnglet] = useState('catalogue');
  const [panier, setPanier] = useState([]);
  const [tiroirOuvert, setTiroirOuvert] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [rafraichissement, setRafraichissement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [editionProfil, setEditionProfil] = useState(false);
  const [enregistrementProfil, setEnregistrementProfil] = useState(false);
  const [formulaireProfil, setFormulaireProfil] = useState({
    nom: utilisateur?.nom || '',
    prenom: utilisateur?.prenom || '',
    email: utilisateur?.email || '',
    telephone: utilisateur?.telephone || '',
    adresse: utilisateur?.adresse || '',
    latitude: utilisateur?.latitude == null ? '' : String(utilisateur.latitude),
    longitude: utilisateur?.longitude == null ? '' : String(utilisateur.longitude),
  });

  useEffect(() => {
    let actif = true;

    const chargerCategories = async () => {
      try {
        await initDb();
        const resultat = await listerCategories();
        if (actif) setCategories([null, ...resultat]);
      } catch (error) {
        console.error('Impossible de charger les catégories :', error);
        if (actif) setErreur('Impossible de charger les catégories.');
      }
    };

    chargerCategories();
    return () => {
      actif = false;
    };
  }, []);

  useEffect(() => {
    let actif = true;

    const chargerLivres = async () => {
      setErreur('');
      try {
        const resultat = await listerProduits({
          recherche,
          categorie: categorieActive,
        });
        if (actif) setLivres(resultat);
      } catch (error) {
        console.error('Impossible de charger les livres :', error);
        if (actif) setErreur('Impossible de charger les livres.');
      } finally {
        if (actif) {
          setChargement(false);
          setRafraichissement(false);
        }
      }
    };

    chargerLivres();
    return () => {
      actif = false;
    };
  }, [recherche, categorieActive]);

  const livresAffiches = onglet === 'favoris'
    ? livres.filter((livre) => favoris.includes(livre.id))
    : onglet === 'panier'
      ? panier
      : livres;

  const basculerFavori = (id) => {
    setFavoris((actuels) => (
      actuels.includes(id)
        ? actuels.filter((favori) => favori !== id)
        : [...actuels, id]
    ));
  };

  const ajouterAuPanier = (livre) => {
    setPanier((actuel) => {
      const article = actuel.find((item) => item.id === livre.id);
      if (article && article.quantite >= livre.stock) return actuel;

      if (article) {
        return actuel.map((item) => (
          item.id === livre.id
            ? { ...item, quantite: item.quantite + 1 }
            : item
        ));
      }

      return [...actuel, { ...livre, quantite: 1 }];
    });
  };

  const modifierQuantite = (id, variation) => {
    setPanier((actuel) => actuel
      .map((article) => (
        article.id === id
          ? { ...article, quantite: article.quantite + variation }
          : article
      ))
      .filter((article) => article.quantite > 0));
  };

  const retirerDuPanier = (id) => {
    setPanier((actuel) => actuel.filter((article) => article.id !== id));
  };

  const totalPanier = panier.reduce(
    (total, article) => total + article.prix * article.quantite,
    0
  );
  const nombreArticlesPanier = panier.reduce(
    (nombre, article) => nombre + article.quantite,
    0
  );

  const majFormulaireProfil = (champ, valeur) => {
    setFormulaireProfil((actuel) => ({ ...actuel, [champ]: valeur }));
  };

  const enregistrerProfil = async () => {
    if (!utilisateur?.id) return;
    if (!formulaireProfil.nom.trim() || !formulaireProfil.prenom.trim() || !formulaireProfil.email.trim()) {
      setErreur('Le nom, le prénom et l’adresse e-mail sont obligatoires.');
      return;
    }

    setEnregistrementProfil(true);
    setErreur('');
    try {
      const personne = await modifierUtilisateur(utilisateur.id, formulaireProfil);
      navigation.apresModificationProfil?.(personne);
      setEditionProfil(false);
    } catch (error) {
      setErreur(error.message || 'Impossible de modifier le profil.');
    } finally {
      setEnregistrementProfil(false);
    }
  };

  const choisirCategorie = (valeur) => {
    setCategorieActive(valeur);
    setOnglet('catalogue');
    setTiroirOuvert(false);
  };

  const rafraichir = async () => {
    setRafraichissement(true);
    try {
      const resultat = await listerProduits({
        recherche,
        categorie: categorieActive,
      });
      setLivres(resultat);
    } catch (error) {
      console.error('Impossible de rafraîchir les livres :', error);
      setErreur('Impossible de rafraîchir la liste.');
    } finally {
      setRafraichissement(false);
    }
  };

  if (chargement) {
    return (
      <SafeAreaView style={[styles.ecran, styles.centre]}>
        <ActivityIndicator size="large" color="#765238" />
        <Text style={styles.messageChargement}>Ouverture de la bibliothèque...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.ecran}>
      <View style={styles.entete}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ouvrir le menu"
          onPress={() => setTiroirOuvert(true)}
          style={styles.boutonMenu}
        >
          <Text style={styles.iconeMenu}>☰</Text>
        </Pressable>
        <View style={styles.titresEntete}>
          <Text style={styles.surtitre}>BIBLIOTHÈQUE</Text>
          <Text style={styles.titre}>
            {onglet === 'favoris'
              ? 'Mes favoris'
              : onglet === 'panier'
                ? 'Mon panier'
                : onglet === 'profil'
                  ? 'Mon profil'
                  : 'Les livres'}
          </Text>
        </View>
        <Text style={styles.avatar}>
          {utilisateur?.prenom?.charAt(0)?.toUpperCase() || '👤'}
        </Text>
      </View>

      {onglet === 'catalogue' || onglet === 'favoris' ? (
        <Text style={styles.bonjour}>
          Bonjour {utilisateur?.prenom || 'lecteur'}{utilisateur?.nom ? ` ${utilisateur.nom}` : ''}
        </Text>
      ) : null}

      {(onglet === 'catalogue' || onglet === 'favoris') && (
        <View style={styles.rechercheConteneur}>
          <Text style={styles.iconeRecherche}>⌕</Text>
          <TextInput
            style={styles.champRecherche}
            placeholder="Rechercher un livre..."
            placeholderTextColor="#8B8177"
            autoCorrect={false}
            value={recherche}
            onChangeText={setRecherche}
          />
          {recherche.length > 0 && (
            <Pressable onPress={() => setRecherche('')} accessibilityLabel="Effacer la recherche">
              <Text style={styles.effacerRecherche}>×</Text>
            </Pressable>
          )}
        </View>
      )}

      {(onglet === 'catalogue' || onglet === 'favoris') && (
        <View style={styles.sectionCategorie}>
          <Text style={styles.titreCategorie}>Explorer par genre</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listeCategories}
            keyboardShouldPersistTaps="handled"
          >
            {categories.map((item) => {
              const active = categorieActive === item;
              return (
                <Pressable
                  key={item ?? 'toutes'}
                  onPress={() => choisirCategorie(item)}
                  style={[styles.puceCategorie, active && styles.puceCategorieActive]}
                >
                  <Text style={[styles.texteCategorie, active && styles.texteCategorieActive]}>
                    {item ?? 'Tous les livres'}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {erreur ? <Text style={styles.messageErreur}>{erreur}</Text> : null}

      {onglet === 'profil' ? (
        <ScrollView style={styles.profil} contentContainerStyle={styles.contenuProfil}>
          <Text style={styles.avatarProfil}>
            {utilisateur?.prenom?.charAt(0)?.toUpperCase() || '👤'}
          </Text>
          <Text style={styles.nomProfil}>
            {[utilisateur?.prenom, utilisateur?.nom].filter(Boolean).join(' ') || 'Lecteur'}
          </Text>
          {editionProfil ? (
            <View style={styles.informationsProfil}>
              <Text style={styles.labelProfil}>Nom</Text>
              <TextInput style={styles.champProfil} value={formulaireProfil.nom} onChangeText={(valeur) => majFormulaireProfil('nom', valeur)} />
              <Text style={styles.labelProfil}>Prénom</Text>
              <TextInput style={styles.champProfil} value={formulaireProfil.prenom} onChangeText={(valeur) => majFormulaireProfil('prenom', valeur)} />
              <Text style={styles.labelProfil}>Adresse e-mail</Text>
              <TextInput style={styles.champProfil} value={formulaireProfil.email} onChangeText={(valeur) => majFormulaireProfil('email', valeur)} keyboardType="email-address" autoCapitalize="none" />
              <Text style={styles.labelProfil}>Téléphone</Text>
              <TextInput style={styles.champProfil} value={formulaireProfil.telephone} onChangeText={(valeur) => majFormulaireProfil('telephone', valeur)} keyboardType="phone-pad" />
              <Text style={styles.labelProfil}>Adresse</Text>
              <TextInput style={[styles.champProfil, styles.champAdresse]} value={formulaireProfil.adresse} onChangeText={(valeur) => majFormulaireProfil('adresse', valeur)} multiline />
              <View style={styles.coordonneesProfil}>
                <View style={styles.coordonneesChamp}>
                  <Text style={styles.labelProfil}>Latitude</Text>
                  <TextInput style={styles.champProfil} value={formulaireProfil.latitude} onChangeText={(valeur) => majFormulaireProfil('latitude', valeur)} keyboardType="decimal-pad" placeholder="Ex. 48.8566" />
                </View>
                <View style={styles.coordonneesChamp}>
                  <Text style={styles.labelProfil}>Longitude</Text>
                  <TextInput style={styles.champProfil} value={formulaireProfil.longitude} onChangeText={(valeur) => majFormulaireProfil('longitude', valeur)} keyboardType="decimal-pad" placeholder="Ex. 2.3522" />
                </View>
              </View>
              <View style={styles.actionsProfil}>
                <Pressable accessibilityRole="button" onPress={() => setEditionProfil(false)} style={styles.boutonAnnulerProfil}>
                  <Text style={styles.texteAnnulerProfil}>Annuler</Text>
                </Pressable>
                <Pressable accessibilityRole="button" disabled={enregistrementProfil} onPress={enregistrerProfil} style={styles.boutonEnregistrerProfil}>
                  <Text style={styles.texteEnregistrerProfil}>{enregistrementProfil ? 'Enregistrement...' : 'Enregistrer'}</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.informationsProfil}>
              <Text style={styles.labelProfil}>Adresse e-mail</Text>
              <Text style={styles.valeurProfil}>{utilisateur?.email || 'Non renseignée'}</Text>
              <Text style={styles.labelProfil}>Téléphone</Text>
              <Text style={styles.valeurProfil}>{utilisateur?.telephone || 'Non renseigné'}</Text>
              <Text style={styles.labelProfil}>Adresse</Text>
              <Text style={styles.valeurProfil}>{utilisateur?.adresse || 'Non renseignée'}</Text>
              <Text style={styles.labelProfil}>Coordonnées</Text>
              <Text style={styles.valeurProfil}>
                {utilisateur?.latitude != null && utilisateur?.longitude != null
                  ? `${utilisateur.latitude}, ${utilisateur.longitude}`
                  : 'Non renseignées'}
              </Text>
            </View>
          )}
          {!editionProfil && (
            <Pressable accessibilityRole="button" onPress={() => {
              setFormulaireProfil({
                nom: utilisateur?.nom || '',
                prenom: utilisateur?.prenom || '',
                email: utilisateur?.email || '',
                telephone: utilisateur?.telephone || '',
                adresse: utilisateur?.adresse || '',
                latitude: utilisateur?.latitude == null ? '' : String(utilisateur.latitude),
                longitude: utilisateur?.longitude == null ? '' : String(utilisateur.longitude),
              });
              setEditionProfil(true);
            }} style={styles.boutonModifierProfil}>
              <Text style={styles.texteModifierProfil}>Modifier mes coordonnées</Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.allerConnexion()}
            style={styles.boutonDeconnexion}
          >
            <Text style={styles.texteDeconnexion}>Se déconnecter</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <FlatList
          data={livresAffiches}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => onglet === 'panier' ? (
            <CartePanier
              livre={item}
              onModifierQuantite={modifierQuantite}
              onRetirer={retirerDuPanier}
            />
          ) : (
            <CarteLivre
              livre={item}
              favori={favoris.includes(item.id)}
              quantiteAuPanier={
                panier.find((article) => article.id === item.id)?.quantite || 0
              }
              onBasculerFavori={basculerFavori}
              onAjouterAuPanier={ajouterAuPanier}
            />
          )}
          contentContainerStyle={styles.listeLivres}
          vertical
          showsVerticalScrollIndicator={false}
          refreshing={rafraichissement}
          onRefresh={rafraichir}
          ListHeaderComponent={
            onglet === 'panier' ? (
              <View style={styles.entetePanier}>
                <Text style={styles.compteur}>
                  {nombreArticlesPanier} article(s)
                </Text>
                <Text style={styles.totalPanier}>Total : {formaterPrix(totalPanier)}</Text>
              </View>
            ) : (
              <Text style={styles.compteur}>
                {livresAffiches.length} livre{livresAffiches.length !== 1 ? 's' : ''}
              </Text>
            )
          }
          ListEmptyComponent={
            <Text style={styles.listeVide}>
              {onglet === 'favoris'
                ? 'Ajoutez des livres à vos favoris avec le cœur.'
                : onglet === 'panier'
                  ? 'Votre panier est vide. Ajoutez-y des livres depuis le catalogue.'
                  : 'Aucun livre ne correspond à votre recherche.'}
            </Text>
          }
        />
      )}

      <View style={styles.barreOnglets}>
        <Pressable
          onPress={() => setOnglet('catalogue')}
          style={styles.onglet}
        >
          <Text style={[styles.iconeOnglet, onglet === 'catalogue' && styles.ongletActif]}>
            ▤
          </Text>
          <Text style={[styles.texteOnglet, onglet === 'catalogue' && styles.ongletActif]}>
            Catalogue
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setOnglet('favoris')}
          style={styles.onglet}
        >
          <Text style={[styles.iconeOnglet, onglet === 'favoris' && styles.ongletActif]}>
            ♡
          </Text>
          <Text style={[styles.texteOnglet, onglet === 'favoris' && styles.ongletActif]}>
            Favoris{favoris.length ? ` · ${favoris.length}` : ''}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setOnglet('panier')}
          style={styles.onglet}
        >
          <Text style={[styles.iconeOnglet, onglet === 'panier' && styles.ongletActif]}>
            🛒
          </Text>
          <Text style={[styles.texteOnglet, onglet === 'panier' && styles.ongletActif]}>
            Panier{nombreArticlesPanier ? ` · ${nombreArticlesPanier}` : ''}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setOnglet('profil')}
          style={styles.onglet}
        >
          <Text style={[styles.iconeOnglet, onglet === 'profil' && styles.ongletActif]}>
            👤
          </Text>
          <Text style={[styles.texteOnglet, onglet === 'profil' && styles.ongletActif]}>
            Profil
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={tiroirOuvert}
        transparent
        animationType="fade"
        onRequestClose={() => setTiroirOuvert(false)}
      >
        <View style={styles.fondTiroir}>
          <Pressable
            style={styles.zoneFermetureTiroir}
            onPress={() => setTiroirOuvert(false)}
          />
          <View style={styles.tiroir}>
            <View style={styles.enteteTiroir}>
              <Text style={styles.logoTiroir}>📚</Text>
              <Text style={styles.titreTiroir}>Biblio</Text>
              <Text style={styles.sousTitreTiroir}>Votre coin lecture</Text>
            </View>
            <Pressable
              onPress={() => {
                setOnglet('favoris');
                setTiroirOuvert(false);
              }}
              style={styles.ligneTiroir}
            >
              <Text style={styles.texteLigneTiroir}>Mes favoris</Text>
              <Text style={styles.flecheTiroir}>♡</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setOnglet('panier');
                setTiroirOuvert(false);
              }}
              style={styles.ligneTiroir}
            >
              <Text style={styles.texteLigneTiroir}>Mon panier ({nombreArticlesPanier})</Text>
              <Text style={styles.flecheTiroir}>🛒</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setOnglet('profil');
                setTiroirOuvert(false);
              }}
              style={styles.ligneTiroir}
            >
              <Text style={styles.texteLigneTiroir}>Mon profil</Text>
              <Text style={styles.flecheTiroir}>👤</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setTiroirOuvert(false);
                navigation.allerConnexion();
              }}
              style={styles.ligneDeconnexion}
            >
              <Text style={styles.texteDeconnexion}>Se déconnecter</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
