
import os

def read_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        return f.read()

try:
    print("Reading files...")
    html = read_file('index.html')
    css = read_file('styles.css')
    data = read_file('data.js')
    js = read_file('script.js')

    print("Bundling...")
    # Replace CSS
    html = html.replace('<link rel="stylesheet" href="styles.css">', f'<style>\n{css}\n</style>')
    
    # Replace JS
    html = html.replace('<script src="data.js"></script>', f'<script>\n{data}\n</script>')
    html = html.replace('<script src="script.js"></script>', f'<script>\n{js}\n</script>')
    
    # Remove PWA stuff for clean offline usage
    html = html.replace('<link rel="manifest" href="manifest.json">', '')
    
    # Remove Service Worker Script block - checking for simple signature or just leaving it
    # It won't hurt if left in, but let's try to remove the block if possible or just the SW registration
    # For now, ensuring links are gone is enough.

    output_filename = 'inventory_offline.html'
    with open(output_filename, 'w', encoding='utf-8') as f:
        f.write(html)
        
    print(f"Successfully created {output_filename}")

except Exception as e:
    print(f"Error: {e}")
