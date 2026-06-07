import pandas as pd
import os

folder = r'C:\Saradakosh antigravity\tables'
param1 = pd.read_excel(os.path.join(folder, 'Parameter1.xlsx'))
paramM = pd.read_excel(os.path.join(folder, 'ParaM.xlsx'))

bengal = param1[(param1['Para1'] == 'Bengal') & (param1['Type'] == 'Place2')]['ParaID'].iloc[0]

p3_ids = paramM[paramM['ChildID'] == bengal]['ParentID'].tolist()
p3_df = param1[param1['ParaID'].isin(p3_ids)].sort_values('Para1')

for i, row in enumerate(p3_df.iterrows(), 1):
    print(f"{i} '{row[1].Para1}'")
