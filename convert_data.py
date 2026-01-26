
import json
import os

input_file = "InventoryList.txt"
output_file = "data.js"

inventory = []
current_category = None

try:
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        if line.startswith('*') and line.endswith('*'):
            category_name = line[1:-1]
            current_category = {
                "category": category_name,
                "items": []
            }
            inventory.append(current_category)
        elif current_category is not None:
            # Clean up item text (remove non-ascii if needed, though utf-8 handles it)
            current_category["items"].append({
                "name": line,
                "count": 0
            })

    js_content = f"const inventoryData = {json.dumps(inventory, indent=4)};"

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_content)

    print(f"Successfully created {output_file}")

except Exception as e:
    print(f"Error: {e}")
