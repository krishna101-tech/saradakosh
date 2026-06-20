import sqlite3

def main():
    conn = sqlite3.connect(r'C:\Saradakosh antigravity\saradakosh.db')
    cursor = conn.cursor()
    
    # Reset all child_ids for sub-events that we incorrectly updated
    cursor.execute('UPDATE events SET child_id = NULL WHERE type COLLATE NOCASE = \'s\'')
    
    # Fetch events ordered by sequence
    # Note: We filter out NULL sequence to avoid breaking the logical chronological order
    cursor.execute('''
        SELECT id, type, sequence 
        FROM events 
        WHERE sequence IS NOT NULL 
        ORDER BY sequence ASC
    ''')
    events = cursor.fetchall()
    
    updates = []
    last_parent_id = None
    
    for evt in events:
        eid, etype, seq = evt
        etype_str = str(etype).strip() if etype is not None else ''
        
        if etype_str.lower() == 's':
            if last_parent_id is not None:
                updates.append((last_parent_id, eid))
        else:
            # We treat any non-'S' as a potential parent because the MS Access logic 
            # implies 'S' items fall under whatever immediately preceded them in the sequence.
            last_parent_id = eid
            
    # Apply correct updates
    cursor.executemany('UPDATE events SET child_id = ? WHERE id = ?', updates)
    conn.commit()
    conn.close()
    
    print(f"Correctly linked {len(updates)} sub-events based on exact Sequence order!")

if __name__ == '__main__':
    main()
