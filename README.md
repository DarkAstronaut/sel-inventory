# SEL Bar Inventory

A lightweight, offline-capable mobile web application for tracking inventory counts across multiple categories.

## Features

- **Category-Based Organization**: Items are grouped by categories (e.g., Walmart, Sams, Online).
- **Offline Functionality**: Works fully offline.
- **Single File Portability**: Includes a Python script to bundle all assets into a single HTML file (`inventory_offline.html`) for easy sharing and usage on mobile devices.
- **One-Tap Actions**:
  - Increment/Decrement counts.
  - Clear counts for specific categories.
  - "Clear All" to reset the entire inventory.
- **Export**: Generates a formatted text summary of the inventory to copy to the clipboard.

## Structure

- `index.html`: Main entry point for development.
- `styles.css`: Stylesheet with custom color coding for categories.
- `script.js`: Core logic for state management and UI interactions.
- `data.js`: Configuration file containing the inventory categories and items.
- `bundle.py`: Utility script to merge HTML, CSS, and JS into a single portable file.

## How to Use

1. **Development**: Open `index.html` in any web browser.
2. **Bundle for Mobile**: Run the python script to generate the offline file.
   ```bash
   python bundle.py
   ```
   This creates `inventory_offline.html`.
3. **Deploy**: Send `inventory_offline.html` to your mobile device (e.g., via AirDrop, Email, or File Manager).

## Customization

- **Add/Remove Items**: Edit `data.js` to modify the inventory list.
- **Change Colors**: Edit `categoryColors` object in `script.js`.
