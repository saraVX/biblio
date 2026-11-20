import {
  createContext,
  useActionState,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useOptimistic,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  use,
} from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './screens/LoginScreen';
import { InscriptionScreen } from './screens/InscriptionScreen';
import ProduitsScreen from './screens/ProduitsScreen';
import { initDB } from './database';
import styles from './AppStyles';

const ContexteHooksReact = createContext(null);
const abonnementInactif = () => () => {};
const lireValeurInactive = () => null;
const reducerInactif = (etat) => etat;

function ExempleHooksReact() {
  const contexte = useContext(ContexteHooksReact);
  const valeurLue = use(ContexteHooksReact);
  const [etat, setEtat] = useState(null);
  const [etatReduit, envoyerAction] = useReducer(reducerInactif, null);
  const reference = useRef(null);
  const identifiant = useId();
  const valeurMemoisee = useMemo(() => null, []);
  const rappelMemoise = useCallback(() => {}, []);
  const valeurDifferee = useDeferredValue(null);
  const [transitionEnCours, demarrerTransition] = useTransition();
  const [etatAction, envoyerActionFormulaire, actionEnCours] = useActionState(
    reducerInactif,
    null,
  );
  const [etatOptimiste, definirEtatOptimiste] = useOptimistic(
    null,
    (_etatActuel, nouvelleValeur) => nouvelleValeur,
  );
  const valeurExterne = useSyncExternalStore(
    abonnementInactif,
    lireValeurInactive,
    lireValeurInactive,
  );
  const evenementEffet = useEffectEvent(() => {});

  useImperativeHandle(reference, () => ({}), []);
  useDebugValue([
    contexte,
    valeurLue,
    etat,
    setEtat,
    etatReduit,
    envoyerAction,
    identifiant,
    valeurMemoisee,
    rappelMemoise,
    valeurDifferee,
    transitionEnCours,
    demarrerTransition,
    etatAction,
    envoyerActionFormulaire,
    actionEnCours,
    etatOptimiste,
    definirEtatOptimiste,
    valeurExterne,
  ]);
  useInsertionEffect(() => {}, []);
  useLayoutEffect(() => {}, []);
  useEffect(() => {
    evenementEffet();
  }, []);

  return null;
}

export default function App() {
  const [ecran, setEcran] = useState('connexion');
  const [utilisateur, setUtilisateur] = useState(null);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    initDB()
      .then(() => setPret(true))
      .catch((erreur) => {
        console.error('Initialisation SQLite impossible :', erreur);
        setPret(true);
      });
  }, []);

  if (!pret) {
    return (
      <SafeAreaProvider>
        <ExempleHooksReact />
        <View style={styles.chargement}>
          <ActivityIndicator size="large" color="#765238" />
          <Text style={styles.chargementTexte}>Chargement...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  const navigation = {
    allerConnexion: () => {
      setUtilisateur(null);
      setEcran('connexion');
    },
    allerInscription: () => setEcran('inscription'),
    apresConnexion: (personne) => {
      setUtilisateur(personne);
      setEcran('produits');
    },
    allerProduits: () => setEcran('produits'),
    apresModificationProfil: (personne) => setUtilisateur(personne),
  };

  return (
    <SafeAreaProvider>
      <ExempleHooksReact />
      {ecran === 'connexion' && <LoginScreen navigation={navigation} />}
      {ecran === 'inscription' && <InscriptionScreen navigation={navigation} />}
      {ecran === 'produits' && (
        <ProduitsScreen utilisateur={utilisateur} navigation={navigation} />
      )}
    </SafeAreaProvider>
  );
}
