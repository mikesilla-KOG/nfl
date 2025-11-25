import fetch_standings
import json

print("Fetching data...")
data = fetch_standings.fetch_nfl_standings()

if data:
    print("\n=== CONFERENCE DATA ===")
    print(f"AFC teams: {len(data['conference']['AFC'])}")
    print(f"NFC teams: {len(data['conference']['NFC'])}")
    
    print("\n=== AFC CONFERENCE ===")
    for i, team in enumerate(data['conference']['AFC'][:5], 1):
        print(f"{i}. {team['abbr']} - {team['wins']}-{team['losses']}-{team['ties']}")
    
    print("\n=== NFC CONFERENCE ===")
    for i, team in enumerate(data['conference']['NFC'][:5], 1):
        print(f"{i}. {team['abbr']} - {team['wins']}-{team['losses']}-{team['ties']}")
else:
    print("Failed to fetch data")
