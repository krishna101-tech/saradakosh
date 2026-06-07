import pandas as pd
import os

folder = r'C:\Saradakosh antigravity\tables'
param1 = pd.read_excel(os.path.join(folder, 'Parameter1.xlsx'))
paramM = pd.read_excel(os.path.join(folder, 'ParaM.xlsx'))

india = param1[(param1['Para1'] == 'India') & (param1['Type'] == 'Place1')]['ParaID'].iloc[0]

# Get Place2 children of India
p2_ids = paramM[paramM['ChildID'] == india]['ParentID'].tolist()
p2_df = param1[param1['ParaID'].isin(p2_ids)].sort_values('Sequence')
print('Place2 children of India:')
print(p2_df[['Para1', 'Sequence']].head())

# Get Place3 children for all
for _, row in p2_df.head(2).iterrows():
    print(f"\nChildren of {row['Para1']}:")
    p3_ids = paramM[paramM['ChildID'] == row['ParaID']]['ParentID'].tolist()
    p3_df = param1[param1['ParaID'].isin(p3_ids)].sort_values('Sequence')
    print(p3_df[['Para1', 'Sequence']].to_string())
