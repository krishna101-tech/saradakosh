import pandas as pd
import os

folder = r"c:\Saradakosh antigravity"
output_path = os.path.join(folder, "Reports_List.xlsx")

reports = [
    "Interactive Ref Report",
    "References Report (List)",
    "References Report (Table)",
    "Life of Shri Ramakrishna",
    "Sarada Devi",
    "Vivekananda",
    "Shri Ramakrishna Math",
    "Shri Ramakrishna Mission",
    "Mega Period",
    "Person Report",
    "Places Report",
    "Type Report"
]

# Create a DataFrame with the report names and an empty column for instructions
df = pd.DataFrame({
    "Report Name": reports,
    "Instructions": [""] * len(reports)
})

# Save to Excel
df.to_excel(output_path, index=False)
print(f"Successfully generated {output_path}")
