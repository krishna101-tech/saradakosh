import sqlite3

def main():
    conn = sqlite3.connect(r'C:\Saradakosh antigravity\saradakosh.db')
    cursor = conn.cursor()
    
    # Insert mappings from field1
    cursor.execute('''
        INSERT INTO event_parameters (event_id, parameter_id)
        SELECT id, CAST(CAST(field1 AS REAL) AS INTEGER) 
        FROM events 
        WHERE field1 IS NOT NULL AND field1 != 'NaN' AND field1 != ''
        EXCEPT 
        SELECT event_id, parameter_id FROM event_parameters
    ''')
    field1_count = cursor.rowcount
    
    # Insert mappings from field2
    cursor.execute('''
        INSERT INTO event_parameters (event_id, parameter_id)
        SELECT id, CAST(CAST(field2 AS REAL) AS INTEGER) 
        FROM events 
        WHERE field2 IS NOT NULL AND field2 != 'NaN' AND field2 != ''
        EXCEPT 
        SELECT event_id, parameter_id FROM event_parameters
    ''')
    field2_count = cursor.rowcount
    
    conn.commit()
    conn.close()
    
    print(f"Successfully recovered {field1_count} relationships from Field1")
    print(f"Successfully recovered {field2_count} relationships from Field2")
    print(f"Total missing relationships restored: {field1_count + field2_count}")

if __name__ == '__main__':
    main()
