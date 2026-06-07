import pandas as pd
import glob
import os

folder = r'C:\Saradakosh antigravity\tables'
files = glob.glob(os.path.join(folder, '*.xlsx'))

for file in files:
    print(f'\n--- {os.path.basename(file)} ---')
    try:
        df = pd.read_excel(file, nrows=5)
        print('Columns:', df.columns.tolist())
        print('First 2 rows:')
        print(df.head(2).to_string())
    except Exception as e:
        print('Error reading file:', e)
