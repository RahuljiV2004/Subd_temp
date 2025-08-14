import json
import pandas as pd

# Path to your JSON file
json_file = "full_output.json"

# Read JSON lines into a list
data = []
with open(json_file, 'r', encoding='utf-8') as f:
    for line in f:
        if line.strip():
            data.append(json.loads(line))


# Flatten the JSON for Excel: expand nested structures
df = pd.json_normalize(data)

# Save to Excel
excel_file = "output.xlsx"
df.to_excel(excel_file, index=False)

print(f"Excel file saved as {excel_file}")
