
import * as SQLite from 'expo-sqlite';

let dbPromise;

export const getDb = () => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('biblio.db');
  }

  return dbPromise;
};

export const getDB = getDb;
