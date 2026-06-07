import pandas as pd

# Load tables
p1 = pd.read_excel('c:/Saradakosh antigravity/tables/Parameter1.xlsx')
matrix = pd.read_excel('c:/Saradakosh antigravity/tables/Matrix.xlsx')
du1 = pd.read_excel('c:/Saradakosh antigravity/tables/DU1.xlsx')

# Get all Ref ParaIDs
ref_ids = set(p1[p1['Type'] == 'Ref']['ParaID'].dropna().astype(str).str.replace('.0', ''))

print(f"Total Ref ParaIDs: {len(ref_ids)}")

# Let's check Matrix M1, M2, M3, M4
matrix_m1 = set(matrix['M1'].dropna().astype(str).str.replace('.0', ''))
matrix_m2 = set(matrix['M2'].dropna().astype(str).str.replace('.0', ''))
matrix_m3 = set(matrix['M3'].dropna().astype(str).str.replace('.0', ''))
matrix_m4 = set(matrix['M4'].dropna().astype(str).str.replace('.0', ''))

print(f"Intersection with M1: {len(ref_ids.intersection(matrix_m1))}")
print(f"Intersection with M2: {len(ref_ids.intersection(matrix_m2))}")
print(f"Intersection with M3: {len(ref_ids.intersection(matrix_m3))}")
print(f"Intersection with M4: {len(ref_ids.intersection(matrix_m4))}")

# Check if DU1 has direct references
du1_cols = du1.columns
print("DU1 columns:", list(du1_cols))

# Are there any string matches in DU1 columns?
for col in ['ID', 'ChildID', 'Sequence', 'DU', 'Ref', 'Type', 'yr']:
    if col in du1_cols:
        du1_vals = set(du1[col].dropna().astype(str).str.replace('.0', ''))
        intersect = ref_ids.intersection(du1_vals)
        if len(intersect) > 0:
            print(f"Intersection with DU1['{col}']: {len(intersect)}")
