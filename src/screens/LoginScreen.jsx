
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { initDB, verifierConnexion } from '../database';

export default function LoginScreen({ navigation }) {

  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [chargement, setChargement] = useState(false);

  const connecter = async () => {
    if (!email.trim() || !mdp) {
      Alert.alert('Champs manquants', 'Remplis ton e-mail et ton mot de passe.');
      return;
    }

    try {
      setChargement(true);

      await initDB();

      const utilisateur = await verifierConnexion(email, mdp);

      if (!utilisateur) {
        Alert.alert(
          'Connexion refusée',
          'Adresse e-mail ou mot de passe incorrect.'
        );
        return;
      }

      Alert.alert(
        'Bienvenue !',
        `Bonjour ${utilisateur.prenom} !`,
        [
          {
            text: 'Continuer',
            onPress: () => navigation?.apresConnexion(utilisateur),
          },
        ]
      );
    } catch (erreur) {
      Alert.alert(
        'Erreur',
        erreur.message || 'Impossible de se connecter.'
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
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
        >
          <Text style={styles.logo}>📚 Biblio</Text>

          <View style={styles.groupe}>
            <Text style={styles.label}>Adresse e-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="exemple@email.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.groupe}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Ton mot de passe"
              placeholderTextColor="#999"
              value={mdp}
              onChangeText={setMdp}
              secureTextEntry
            />
          </View>

          <Pressable
            style={styles.bouton}
            onPress={connecter}
            disabled={chargement}
          >
            <Text style={styles.boutonTexte}>
              {chargement ? 'Connexion...' : 'Se connecter'}
            </Text>
          </Pressable>

          <Text style={styles.question}>
            Tu n&apos;as pas encore de compte ?
          </Text>

          <Pressable onPress={() => navigation?.allerInscription()}>
            <Text style={styles.lien}>Créer un compte</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8F3EC',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#765238',
    textAlign: 'center',
    marginBottom: 35,
  },
  groupe: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B3525',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8C8B7',
    borderRadius: 10,
    padding: 15,
    fontSize: 15,
    color: '#333333',
  },
  bouton: {
    backgroundColor: '#765238',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  boutonTexte: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  question: {
    textAlign: 'center',
    color: '#4B3525',
    marginTop: 30,
  },
  lien: {
    textAlign: 'center',
    color: '#765238',
    fontWeight: 'bold',
    marginTop: 10,
  },
});
