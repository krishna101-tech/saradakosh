import pandas as pd

access = pd.read_excel('c:/Saradakosh antigravity/reports/Ref report from access.xlsx')
generated = pd.read_excel('c:/Saradakosh antigravity/reports/Generated_Ref_Report_Table.xlsx')

# Check columns
if list(access.columns) != list(generated.columns):
    print("Columns mismatch!")
    print("Access:", list(access.columns))
    print("Generated:", list(generated.columns))
else:
    print("Columns match exactly.")

# Sort both to compare rows ignoring order
access_sorted = access.sort_values(by=['ParaMatrix_ParaID', 'Parameter1_ParaID', 'Parameter1_1_ParaID']).reset_index(drop=True).fillna('')
generated_sorted = generated.sort_values(by=['ParaMatrix_ParaID', 'Parameter1_ParaID', 'Parameter1_1_ParaID']).reset_index(drop=True).fillna('')

for c in access_sorted.columns:
    access_sorted[c] = access_sorted[c].astype(str).str.strip().str.replace('.0', '')
    generated_sorted[c] = generated_sorted[c].astype(str).str.strip().str.replace('.0', '')

if access_sorted.equals(generated_sorted):
    print("Data matches perfectly! 100% equivalent.")
else:
    print("Data mismatch.")
