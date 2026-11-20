 
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8F3EC',
  },

  contenu: {
    padding: 24,
    paddingBottom: 40,
  },

  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#765238',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },

  titre: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#4B3525',
    textAlign: 'center',
    marginBottom: 10,
  },

  sousTitre: {
    fontSize: 15,
    color: '#806D5C',
    textAlign: 'center',
    marginBottom: 30,
  },

  groupe: {
    marginBottom: 17,
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
    padding: 14,
    fontSize: 15,
    color: '#333333',
  },

  inputErreur: {
    borderColor: '#C0392B',
  },

  erreur: {
    color: '#C0392B',
    fontSize: 13,
    marginTop: 5,
  },

  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    gap: 12,
  },

  optionTexte: {
    flex: 1,
    color: '#4B3525',
    fontSize: 14,
  },

  bouton: {
    backgroundColor: '#765238',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25,
  },

  boutonTexte: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default styles;
