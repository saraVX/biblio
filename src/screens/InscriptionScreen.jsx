 
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import styles from './InscriptionStyles';
import { validerFormulaire } from '../utils/validation';
import { initDB, insererUtilisateur } from '../database';

const Champ = ({
  label,
  champ,
  placeholder,
  clavier = 'default',
  secret = false,
  valeur,
  erreur,
  onChange,
}) => (
  <View style={styles.groupe}>
    <Text style={styles.label}>{label}</Text>

    <TextInput
      style={[styles.input, erreur ? styles.inputErreur : null]}
      placeholder={placeholder}
      placeholderTextColor="#999"
      value={valeur}
      onChangeText={onChange}
      keyboardType={clavier}
      secureTextEntry={secret}
      autoCapitalize={champ === 'email' ? 'none' : 'sentences'}
    />

    {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}
  </View>
);

export const InscriptionScreen = ({ navigation }) => {

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    mdp: '',
    confirmation: '',
  });

  const [newsletter, setNewsletter] = useState(false);
  const [cgu, setCgu] = useState(false);
  const [erreurs, setErreurs] = useState({});
  const [chargement, setChargement] = useState(false);

  const maj = (champ, valeur) => {
    setForm((ancien) => ({
      ...ancien,
      [champ]: valeur,
    }));
  };

  const envoyer = async () => {
    const erreursFormulaire = validerFormulaire(form, cgu);
    setErreurs(erreursFormulaire);

    if (Object.keys(erreursFormulaire).length > 0) {
      Alert.alert('Erreur', 'Vérifie les informations du formulaire.');
      return;
    }

    try {
      setChargement(true);

      await initDB();
      await insererUtilisateur(form, newsletter);

      Alert.alert(
        'Inscription réussie',
        'Ton compte Biblio a été créé !',
        [
          {
            text: 'Voir le catalogue',
            onPress: () => navigation?.allerConnexion(),
          },
        ]
      );
    } catch (erreur) {
      Alert.alert(
        'Inscription impossible',
        erreur.message || 'Une erreur est survenue.'
      );
    } finally {
      setChargement(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.contenu}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
        >
          <Text style={styles.logo}>📚 Biblio</Text>

          <Text style={styles.titre}>Créer un compte</Text>

          <Text style={styles.sousTitre}>
            Rejoins notre bibliothèque !
          </Text>

          <Champ
            label="Nom"
            champ="nom"
            placeholder="Ton nom"
            valeur={form.nom}
            erreur={erreurs.nom}
            onChange={(valeur) => maj('nom', valeur)}
          />

          <Champ
            label="Prénom"
            champ="prenom"
            placeholder="Ton prénom"
            valeur={form.prenom}
            erreur={erreurs.prenom}
            onChange={(valeur) => maj('prenom', valeur)}
          />

          <Champ
            label="Adresse e-mail"
            champ="email"
            placeholder="exemple@email.com"
            clavier="email-address"
            valeur={form.email}
            erreur={erreurs.email}
            onChange={(valeur) => maj('email', valeur)}
          />

          <Champ
            label="Téléphone (facultatif)"
            champ="telephone"
            placeholder="Ton numéro"
            clavier="phone-pad"
            valeur={form.telephone}
            erreur={erreurs.telephone}
            onChange={(valeur) => maj('telephone', valeur)}
          />

          <Champ
            label="Mot de passe"
            champ="mdp"
            placeholder="6 caractères minimum"
            secret
            valeur={form.mdp}
            erreur={erreurs.mdp}
            onChange={(valeur) => maj('mdp', valeur)}
          />

          <Champ
            label="Confirmer le mot de passe"
            champ="confirmation"
            placeholder="Confirme ton mot de passe"
            secret
            valeur={form.confirmation}
            erreur={erreurs.confirmation}
            onChange={(valeur) => maj('confirmation', valeur)}
          />

          <View style={styles.option}>
            <Text style={styles.optionTexte}>
              Recevoir les actualités de Biblio
            </Text>
            <Switch value={newsletter} onValueChange={setNewsletter} />
          </View>

          <View style={styles.option}>
            <Text style={styles.optionTexte}>
              J&apos;accepte les conditions d&apos;utilisation
            </Text>
            <Switch value={cgu} onValueChange={setCgu} />
          </View>

          {erreurs.cgu ? (
            <Text style={styles.erreur}>{erreurs.cgu}</Text>
          ) : null}

          <Pressable
            style={styles.bouton}
            onPress={envoyer}
            disabled={chargement}
          >
            <Text style={styles.boutonTexte}>
              {chargement ? 'Inscription...' : 'Créer mon compte'}
            </Text>
          </Pressable>

          <Text style={{ textAlign: 'center', marginTop: 22, color: '#4B3525' }}>
            Tu as déjà un compte ?
          </Text>

          <Pressable onPress={() => navigation?.allerConnexion()}>
            <Text style={{
              textAlign: 'center',
              color: '#765238',
              fontWeight: 'bold',
              marginTop: 8,
            }}>
              Se connecter
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
