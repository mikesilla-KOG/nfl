# NFL Team Standings Website

A clean, responsive website displaying NFL team standings sorted by record and grouped by conference (AFC/NFC).

## 🚀 Quick Start

1. **Run the website:**
   ```bash
   cd /workspaces/nfl
   python3 -m http.server 8000
   ```

2. **Open in browser:**
   - Visit: `http://localhost:8000`

## 📊 How to Update Team Records

### Option 1: Edit the JavaScript File

1. Open `script.js`
2. Find the `nflTeams` object (around line 1-2)
3. Update the wins, losses, and ties for each team:
   ```javascript
   { name: 'Kansas City Chiefs', wins: 10, losses: 1, ties: 0 }
   ```
4. Save the file
5. Click the **"Refresh Data"** button on the website (or press F5)

### Option 2: Quick Update via Terminal

Run this command to edit the data:
```bash
code /workspaces/nfl/script.js
```

Then update the records and save.

## 📁 File Structure

```
/workspaces/nfl/
├── index.html      # Main HTML structure
├── styles.css      # Styling and responsive design
├── script.js       # Team data and sorting logic
└── README.md       # This file
```

## 🎨 Features

- ✅ Sorted by best record (win percentage)
- ✅ Grouped by AFC and NFC conferences
- ✅ Win/Loss/Tie columns with percentages
- ✅ Responsive design for mobile and desktop
- ✅ Gold/Silver/Bronze badges for top 3 teams
- ✅ One-click refresh button

## 🔄 Refresh Process

**The refresh button reloads the page to display any changes you made to `script.js`.**

To update standings:
1. Edit team records in `script.js`
2. Save the file
3. Click "Refresh Data" button on the website

## 📝 Data Format

Each team entry requires:
- `name`: Team name (string)
- `wins`: Number of wins (integer)
- `losses`: Number of losses (integer)
- `ties`: Number of ties (integer)

Example:
```javascript
{ name: 'Detroit Lions', wins: 10, losses: 1, ties: 0 }
```

## 🏈 Current Season

**2025-2026 NFL Season - Week 12**

Last Updated: November 24, 2025

---

Made with ❤️ for NFL fans