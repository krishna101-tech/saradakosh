import sqlite3
conn = sqlite3.connect('saradakosh.db')
c = conn.cursor()
c.execute("UPDATE schedule_settings SET google_meet_link = 'https://meet.google.com/wmv-cztw-ohw'")
conn.commit()
conn.close()
print("Link updated successfully.")
