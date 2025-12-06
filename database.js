const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'newsletter.db');

// Initialize database
function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
    });

    // Create subscribers table
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS subscribers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          active INTEGER DEFAULT 1,
          unsubscribe_token TEXT UNIQUE
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
      });

      // Create deals table for tracking sent deals
      db.run(`
        CREATE TABLE IF NOT EXISTS deals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          business_name TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          discount TEXT,
          valid_until TEXT,
          source_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          sent_at DATETIME
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(db);
      });
    });
  });
}

// Get database instance
function getDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(db);
    });
  });
}

// Add subscriber
function addSubscriber(email, name = null) {
  return new Promise((resolve, reject) => {
    getDatabase().then(db => {
      const unsubscribeToken = require('crypto').randomBytes(32).toString('hex');
      db.run(
        'INSERT INTO subscribers (email, name, unsubscribe_token) VALUES (?, ?, ?)',
        [email, name, unsubscribeToken],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint')) {
              reject(new Error('Email already subscribed'));
            } else {
              reject(err);
            }
          } else {
            resolve({ id: this.lastID, email, unsubscribeToken });
          }
          db.close();
        }
      );
    }).catch(reject);
  });
}

// Get all active subscribers
function getActiveSubscribers() {
  return new Promise((resolve, reject) => {
    getDatabase().then(db => {
      db.all('SELECT * FROM subscribers WHERE active = 1', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
        db.close();
      });
    }).catch(reject);
  });
}

// Unsubscribe
function unsubscribe(token) {
  return new Promise((resolve, reject) => {
    getDatabase().then(db => {
      db.run(
        'UPDATE subscribers SET active = 0 WHERE unsubscribe_token = ?',
        [token],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
          db.close();
        }
      );
    }).catch(reject);
  });
}

// Save deal
function saveDeal(deal) {
  return new Promise((resolve, reject) => {
    getDatabase().then(db => {
      db.run(
        `INSERT INTO deals (business_name, title, description, discount, valid_until, source_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          deal.businessName,
          deal.title,
          deal.description,
          deal.discount,
          deal.validUntil,
          deal.sourceUrl
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
          db.close();
        }
      );
    }).catch(reject);
  });
}

// Mark deal as sent
function markDealAsSent(dealId) {
  return new Promise((resolve, reject) => {
    getDatabase().then(db => {
      db.run(
        'UPDATE deals SET sent_at = CURRENT_TIMESTAMP WHERE id = ?',
        [dealId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
          db.close();
        }
      );
    }).catch(reject);
  });
}

module.exports = {
  initDatabase,
  addSubscriber,
  getActiveSubscribers,
  unsubscribe,
  saveDeal,
  markDealAsSent
};

