import pandas as pd
import os

folder = r'C:\Saradakosh antigravity\tables'
param1 = pd.read_excel(os.path.join(folder, 'Parameter1.xlsx'))
paramM = pd.read_excel(os.path.join(folder, 'ParaM.xlsx'))

# All Place2 items
p2_items = param1[param1['Type'] == 'Place2'].sort_values('Para1')

p2_idx = 1
for _, p2 in p2_items.iterrows():
    p3_ids = paramM[paramM['ChildID'] == p2.ParaID]['ParentID'].tolist()
    p3_items = param1[param1['ParaID'].isin(p3_ids)].sort_values('Para1')
    
    # Prune Place2 if no Place3 children?
    if len(p3_items) == 0:
        continue
        
    print(f"{p2_idx} {p2.Para1}")
    
    p3_idx = 1
    for _, p3 in p3_items.iterrows():
        p4_ids = paramM[paramM['ChildID'] == p3.ParaID]['ParentID'].tolist()
        p4_items = param1[param1['ParaID'].isin(p4_ids)].sort_values('Para1')
        
        # Print Place3 even if it has no Place4 children?
        print(f"    {p3_idx} {p3.Para1}")
        
        p4_idx = 1
        for _, p4 in p4_items.iterrows():
            print(f"        {p4_idx} {p4.Para1}")
            p4_idx += 1
            
        p3_idx += 1
        
    p2_idx += 1
