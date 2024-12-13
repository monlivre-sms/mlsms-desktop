import { open } from 'sqlite';
import sqlite3 from 'sqlite3'; // Used with sqlite@5

// import Database from 'better-sqlite3';

console.log(open, sqlite3);

export function getDb(dbFile) {
	// V5: Not working due to sqlite3 install problem
	return open({
		filename: dbFile,
		driver: sqlite3.Database,
	});

	// const sqlite3Caller = sqlite3.verbose();
	// const db = new sqlite3Caller.Database(dbFile);
	// return Promise.resolve(db);

	// V3
	// return sqlite.open(dbFile, { Promise });


	// return new Database(dbFile);
}

export default {};
