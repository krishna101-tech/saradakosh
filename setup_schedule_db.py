import sqlite3
import urllib.request
import csv
from io import StringIO

DB_FILE = 'saradakosh.db'
CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTf9NQNnH7EQodlRZalA0JEaPy91ahzvsAQO1ByUer8m8SbprkopNYucNvJzzLlPjuenXvpexZg7k1B/pub?output=csv'

def setup_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Create Settings Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS schedule_settings (
            id INTEGER PRIMARY KEY,
            start_date TEXT,
            google_meet_link TEXT
        )
    ''')

    # Create Topics Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS schedule_topics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_idx INTEGER,
            name TEXT,
            playlist_link TEXT
        )
    ''')

    # Insert default settings if empty
    cursor.execute('SELECT COUNT(*) FROM schedule_settings')
    if cursor.fetchone()[0] == 0:
        # Default start date (a Monday) and placeholder link
        cursor.execute('''
            INSERT INTO schedule_settings (id, start_date, google_meet_link)
            VALUES (1, '2024-06-03', 'https://meet.google.com/xyz-abcd-efg')
        ''')
        print("Inserted default settings.")

    # Fetch and insert topics if empty
    cursor.execute('SELECT COUNT(*) FROM schedule_topics')
    if cursor.fetchone()[0] == 0:
        print("Fetching topics from Google Sheets...")
        try:
            req = urllib.request.Request(CSV_URL, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                csv_data = response.read().decode('utf-8')
            
            reader = csv.reader(StringIO(csv_data))
            for idx, row in enumerate(reader):
                if not row: continue
                name = row[0].strip()
                link = row[1].strip() if len(row) > 1 else ''
                cursor.execute('''
                    INSERT INTO schedule_topics (order_idx, name, playlist_link)
                    VALUES (?, ?, ?)
                ''', (idx, name, link))
            print(f"Inserted {idx + 1} topics successfully.")
        except Exception as e:
            print(f"Failed to fetch CSV: {e}")
    else:
        print("Topics table already populated. Skipping CSV migration.")

    conn.commit()
    conn.close()
    print("Database setup complete.")

if __name__ == '__main__':
    setup_db()
