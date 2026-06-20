import sqlite3
import pandas as pd

def main():
    conn = sqlite3.connect(r'C:\Saradakosh antigravity\saradakosh.db')
    cursor = conn.cursor()
    
    print("Loading DU1.xlsx to restore original ChildID mappings...")
    df = pd.read_excel(r'C:\Saradakosh antigravity\tables\DU1.xlsx')
    
    # We want to restore the child_id column exactly as it was in DU1.xlsx
    # First, reset all child_ids to NULL to wipe out my incorrect inferred mappings
    cursor.execute('UPDATE events SET child_id = NULL')
    
    # Filter rows that have a valid ChildID
    valid_child_ids = df[df['ChildID'].notna() & (df['ChildID'] != '')]
    
    updates = []
    for _, row in valid_child_ids.iterrows():
        eid = int(row['ID'])
        try:
            cid = int(float(row['ChildID']))
            updates.append((cid, eid))
        except ValueError:
            pass
            
    cursor.executemany('UPDATE events SET child_id = ? WHERE id = ?', updates)
    conn.commit()
    conn.close()
    
    print(f"Successfully restored {len(updates)} pristine parent-child relationships from DU1.xlsx!")

if __name__ == '__main__':
    main()
