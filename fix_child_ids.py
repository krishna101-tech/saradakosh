import sqlite3
import pandas as pd

def main():
    # We will use the original DU1.xlsx to determine the physical sequential order
    # since MS Access export balyaparva.xls preserves that implicit grouping.
    df = pd.read_excel(r'C:\Saradakosh antigravity\tables\DU1.xlsx')
    
    conn = sqlite3.connect(r'C:\Saradakosh antigravity\saradakosh.db')
    cursor = conn.cursor()
    
    updates = []
    last_parent_id = None
    
    for idx, row in df.iterrows():
        if pd.isna(row['ID']): continue
        
        eid = int(row['ID'])
        etype = str(row['Type']).strip() if pd.notna(row['Type']) else ''
        
        # In this dataset, Type 'S' or 's' generally denotes a sub-event
        if etype.lower() == 's':
            if last_parent_id is not None:
                updates.append((last_parent_id, eid))
        else:
            # For any other type (0, I, etc.), it's considered a parent
            last_parent_id = eid
            
    # Perform the mass update
    cursor.executemany('UPDATE events SET child_id = ? WHERE id = ?', updates)
    conn.commit()
    conn.close()
    
    print(f"Successfully linked {len(updates)} sub-events to their respective parents!")

if __name__ == '__main__':
    main()
