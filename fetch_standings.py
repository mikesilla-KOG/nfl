#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
import json
import re

# Map team abbreviations to full names
TEAM_NAMES = {
    'NE': 'New England Patriots', 'BUF': 'Buffalo Bills', 'MIA': 'Miami Dolphins', 'NYJ': 'New York Jets',
    'BAL': 'Baltimore Ravens', 'PIT': 'Pittsburgh Steelers', 'CIN': 'Cincinnati Bengals', 'CLE': 'Cleveland Browns',
    'IND': 'Indianapolis Colts', 'JAX': 'Jacksonville Jaguars', 'HOU': 'Houston Texans', 'TEN': 'Tennessee Titans',
    'DEN': 'Denver Broncos', 'LAC': 'Los Angeles Chargers', 'KC': 'Kansas City Chiefs', 'LV': 'Las Vegas Raiders',
    'PHI': 'Philadelphia Eagles', 'DAL': 'Dallas Cowboys', 'WAS': 'Washington Commanders', 'NYG': 'New York Giants',
    'CHI': 'Chicago Bears', 'GB': 'Green Bay Packers', 'DET': 'Detroit Lions', 'MIN': 'Minnesota Vikings',
    'TB': 'Tampa Bay Buccaneers', 'CAR': 'Carolina Panthers', 'ATL': 'Atlanta Falcons', 'NO': 'New Orleans Saints',
    'LAR': 'Los Angeles Rams', 'SEA': 'Seattle Seahawks', 'SF': 'San Francisco 49ers', 'ARI': 'Arizona Cardinals'
}

def fetch_nfl_standings():
    url = "https://plaintextsports.com/nfl/2025/standings"
    
    try:
        print(f"Fetching from {url}...")
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        print("Data fetched successfully")
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Parse all different views
        division_data = parse_division_view(soup)
        conference_data = parse_conference_view(soup)
        league_data = parse_league_view(soup)
        playoffs_data = parse_playoffs_view(soup)
        
        return {
            'division': division_data,
            'conference': conference_data,
            'league': league_data,
            'playoffs': playoffs_data
        }
    
    except Exception as e:
        print(f"Error fetching standings: {e}")
        return None

def parse_team_line(text):
    """Parse a team line and return team data"""
    match = re.search(r'^([A-Z]{2,3})(?:-[a-z])?\s+(\d+)\s+(\d+)\s+(\d+)', text)
    if match:
        abbr = match.group(1)
        wins = int(match.group(2))
        losses = int(match.group(3))
        ties = int(match.group(4))
        team_name = TEAM_NAMES.get(abbr, abbr)
        
        return {
            'name': team_name,
            'abbr': abbr,
            'wins': wins,
            'losses': losses,
            'ties': ties
        }
    return None

def parse_division_view(soup):
    """Parse division standings"""
    afc_divisions = {'East': [], 'North': [], 'South': [], 'West': []}
    nfc_divisions = {'East': [], 'North': [], 'South': [], 'West': []}
    afc_abbrs = {'East': set(), 'North': set(), 'South': set(), 'West': set()}
    nfc_abbrs = {'East': set(), 'North': set(), 'South': set(), 'West': set()}
    
    current_conference = None
    current_division = None
    
    for element in soup.find_all('div'):
        text = element.get_text().strip()
        
        # Detect division headers
        if 'AFC East:' in text:
            current_conference, current_division = 'AFC', 'East'
            continue
        elif 'AFC North:' in text:
            current_conference, current_division = 'AFC', 'North'
            continue
        elif 'AFC South:' in text:
            current_conference, current_division = 'AFC', 'South'
            continue
        elif 'AFC West:' in text:
            current_conference, current_division = 'AFC', 'West'
            continue
        elif 'NFC East:' in text:
            current_conference, current_division = 'NFC', 'East'
            continue
        elif 'NFC North:' in text:
            current_conference, current_division = 'NFC', 'North'
            continue
        elif 'NFC South:' in text:
            current_conference, current_division = 'NFC', 'South'
            continue
        elif 'NFC West:' in text:
            current_conference, current_division = 'NFC', 'West'
            continue
        
        # Parse team data
        team_data = parse_team_line(text)
        if team_data and current_conference and current_division:
            if current_conference == 'AFC':
                # Only add if we have less than 4 teams in this division and not a duplicate
                if len(afc_divisions[current_division]) < 4 and team_data['abbr'] not in afc_abbrs[current_division]:
                    afc_divisions[current_division].append(team_data)
                    afc_abbrs[current_division].add(team_data['abbr'])
            elif current_conference == 'NFC':
                # Only add if we have less than 4 teams in this division and not a duplicate
                if len(nfc_divisions[current_division]) < 4 and team_data['abbr'] not in nfc_abbrs[current_division]:
                    nfc_divisions[current_division].append(team_data)
                    nfc_abbrs[current_division].add(team_data['abbr'])
    
    return {'AFC': afc_divisions, 'NFC': nfc_divisions}

def parse_conference_view(soup):
    """Parse conference standings (all teams in each conference)"""
    afc_teams = []
    nfc_teams = []
    afc_abbrs = set()
    nfc_abbrs = set()
    
    current_conference = None
    in_conference_section = False
    
    for element in soup.find_all('div'):
        text = element.get_text().strip()
        
        if 'American Football Conference:' in text:
            current_conference = 'AFC'
            in_conference_section = True
            continue
        elif 'National Football Conference:' in text:
            current_conference = 'NFC'
            in_conference_section = True
            continue
        elif 'NFL:' in text or 'Division Leaders:' in text:
            in_conference_section = False
            current_conference = None
            continue
        
        if in_conference_section and current_conference:
            team_data = parse_team_line(text)
            if team_data:
                if current_conference == 'AFC' and team_data['abbr'] not in afc_abbrs and len(afc_teams) < 16:
                    afc_teams.append(team_data)
                    afc_abbrs.add(team_data['abbr'])
                elif current_conference == 'NFC' and team_data['abbr'] not in nfc_abbrs and len(nfc_teams) < 16:
                    nfc_teams.append(team_data)
                    nfc_abbrs.add(team_data['abbr'])
    
    return {'AFC': afc_teams, 'NFC': nfc_teams}

def parse_league_view(soup):
    """Parse league standings (all 32 teams)"""
    all_teams = []
    all_abbrs = set()
    in_league_section = False
    
    for element in soup.find_all('div'):
        text = element.get_text().strip()
        
        if text == 'NFL:':
            in_league_section = True
            continue
        elif 'Division Leaders:' in text or 'American Football Conference' in text:
            in_league_section = False
            continue
        
        if in_league_section:
            team_data = parse_team_line(text)
            if team_data and team_data['abbr'] not in all_abbrs:
                all_teams.append(team_data)
                all_abbrs.add(team_data['abbr'])
    
    return all_teams

def parse_playoffs_view(soup):
    """Parse playoff picture"""
    afc_playoffs = {'division_leaders': [], 'wild_card': [], 'eliminated': []}
    nfc_playoffs = {'division_leaders': [], 'wild_card': [], 'eliminated': []}
    afc_abbrs = {'division_leaders': set(), 'wild_card': set(), 'eliminated': set()}
    nfc_abbrs = {'division_leaders': set(), 'wild_card': set(), 'eliminated': set()}
    
    current_conference = None
    current_section = None
    
    for element in soup.find_all('div'):
        text = element.get_text().strip()
        
        if 'American Football Conference' in text:
            current_conference = 'AFC'
        elif 'National Football Conference' in text:
            current_conference = 'NFC'
        
        if 'Division Leaders:' in text:
            current_section = 'division_leaders'
            continue
        elif 'Wild Card:' in text:
            current_section = 'wild_card'
            continue
        elif '============' in text:
            current_section = 'eliminated'
            continue
        
        # Parse team with seed number (e.g., "1:NE  10  2  0")
        # Exclude teams with -e suffix (eliminated teams don't have seeds)
        seed_match = re.search(r'^(\d+):([A-Z]{2,3})\s+(\d+)\s+(\d+)\s+(\d+)', text)
        if seed_match:
            seed = int(seed_match.group(1))
            abbr = seed_match.group(2)
            wins = int(seed_match.group(3))
            losses = int(seed_match.group(4))
            ties = int(seed_match.group(5))
            
            team_data = {
                'seed': seed,
                'name': TEAM_NAMES.get(abbr, abbr),
                'abbr': abbr,
                'wins': wins,
                'losses': losses,
                'ties': ties
            }
            
            if current_conference == 'AFC' and current_section and abbr not in afc_abbrs[current_section]:
                afc_playoffs[current_section].append(team_data)
                afc_abbrs[current_section].add(abbr)
            elif current_conference == 'NFC' and current_section and abbr not in nfc_abbrs[current_section]:
                nfc_playoffs[current_section].append(team_data)
                nfc_abbrs[current_section].add(abbr)
        else:
            # Regular team without seed - check for eliminated teams (marked with -e)
            # Only parse eliminated teams if they have the -e suffix
            eliminated_match = re.search(r'^([A-Z]{2,3})-e\s+(\d+)\s+(\d+)\s+(\d+)', text)
            if eliminated_match:
                abbr = eliminated_match.group(1)
                wins = int(eliminated_match.group(2))
                losses = int(eliminated_match.group(3))
                ties = int(eliminated_match.group(4))
                
                team_data = {
                    'name': TEAM_NAMES.get(abbr, abbr),
                    'abbr': abbr,
                    'wins': wins,
                    'losses': losses,
                    'ties': ties
                }
                
                if current_conference == 'AFC' and abbr not in afc_abbrs['eliminated']:
                    afc_playoffs['eliminated'].append(team_data)
                    afc_abbrs['eliminated'].add(abbr)
                elif current_conference == 'NFC' and abbr not in nfc_abbrs['eliminated']:
                    nfc_playoffs['eliminated'].append(team_data)
                    nfc_abbrs['eliminated'].add(abbr)
    
    return {'AFC': afc_playoffs, 'NFC': nfc_playoffs}

if __name__ == "__main__":
    standings = fetch_nfl_standings()
    if standings:
        print(json.dumps(standings, indent=2))
    else:
        print("Failed to fetch standings")
