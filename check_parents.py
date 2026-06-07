import pandas as pd
import os

folder = r'C:\Saradakosh antigravity\tables'
param1 = pd.read_excel(os.path.join(folder, 'Parameter1.xlsx'))
paramM = pd.read_excel(os.path.join(folder, 'ParaM.xlsx'))

sadhan_parva = param1[param1['Para1'] == 'Sadhan Parva']
if not sadhan_parva.empty:
    sadhan_parva_id = sadhan_parva.iloc[0]['ParaID']
    sadhan_parents = paramM[paramM['ParentID'] == sadhan_parva_id]['ChildID'].tolist()
    print('Sadhan Parva Parents:')
    print(param1[param1['ParaID'].isin(sadhan_parents)][['ParaID', 'Para1', 'Type']].to_string())

avatar_parva = param1[param1['Para1'] == 'Avatar Parva']
if not avatar_parva.empty:
    avatar_parva_id = avatar_parva.iloc[0]['ParaID']
    avatar_parents = paramM[paramM['ParentID'] == avatar_parva_id]['ChildID'].tolist()
    print('\nAvatar Parva Parents:')
    print(param1[param1['ParaID'].isin(avatar_parents)][['ParaID', 'Para1', 'Type']].to_string())

tour_north_india = param1[param1['Para1'].astype(str).str.contains('Tour of North India', na=False, case=False)]
print('\nTour of North India:')
print(tour_north_india[['ParaID', 'Para1', 'Type']].to_string())
if not tour_north_india.empty:
    tour_id = tour_north_india.iloc[0]['ParaID']
    tour_children = paramM[paramM['ChildID'] == tour_id]['ParentID'].tolist()
    print('Tour Children:')
    print(param1[param1['ParaID'].isin(tour_children)][['ParaID', 'Para1', 'Type']].to_string())
