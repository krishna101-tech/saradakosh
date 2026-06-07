import pandas as pd
import json

p1 = pd.read_excel('c:/Saradakosh antigravity/tables/Parameter1.xlsx')
pm = pd.read_excel('c:/Saradakosh antigravity/tables/ParaM.xlsx')

with open('output.txt', 'w', encoding='utf-8') as f:
    f.write("ParaID 629 in Parameter1:\n")
    f.write(str(p1[p1['ParaID'] == 629].to_dict('records')) + '\n')

    f.write("\nParaID 811 in Parameter1:\n")
    f.write(str(p1[p1['ParaID'] == 811].to_dict('records')) + '\n')

    f.write("\nParaID 577 in Parameter1:\n")
    f.write(str(p1[p1['ParaID'] == 577].to_dict('records')) + '\n')

    f.write("\nParaM where ChildID = 629:\n")
    f.write(str(pm[pm['ChildID'] == 629].to_dict('records')) + '\n')

    f.write("\nParaM where ParentID = 629:\n")
    f.write(str(pm[pm['ParentID'] == 629].to_dict('records')) + '\n')
