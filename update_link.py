from database_path import connect_database
conn = connect_database()
c = conn.cursor()
c.execute("UPDATE schedule_settings SET google_meet_link = 'https://meet.google.com/wmv-cztw-ohw'")
conn.commit()
conn.close()
print("Link updated successfully.")
