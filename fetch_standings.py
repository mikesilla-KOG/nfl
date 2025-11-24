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
        response = requests.get(url)
        response.raise_for_status()
        
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
                # Only add if we have less than 4 teams in this division
                if len(afc_divisions[current_division]) < 4 and team_data not in afc_divisions[current_division]:
                    afc_divisions[current_division].append(team_data)
            elif current_conference == 'NFC':
                # Only add if we have less than 4 teams in this division
                if len(nfc_divisions[current_division]) < 4 and team_data not in nfc_divisions[current_division]:
                    nfc_divisions[current_division].append(team_data)
    
    return {'AFC': afc_divisions, 'NFC': nfc_divisions}

def parse_conference_view(soup):
    """Parse conference standings (all teams in each conference)"""
    afc_teams = []
    nfc_teams = []
    
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
            continue
        
        if in_conference_section:
            team_data = parse_team_line(text)
            if team_data:
                if current_conference == 'AFC' and team_data not in afc_teams:
                    afc_teams.append(team_data)
                elif current_conference == 'NFC' and team_data not in nfc_teams:
                    nfc_teams.append(team_data)
    
    return {'AFC': afc_teams, 'NFC': nfc_teams}

def parse_league_view(soup):
    """Parse league standings (all 32 teams)"""
    all_teams = []
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
            if team_data and team_data not in all_teams:
                all_teams.append(team_data)
    
    return all_teams

def parse_playoffs_view(soup):
    """Parse playoff picture"""
    afc_playoffs = {'division_leaders': [], 'wild_card': [], 'eliminated': []}
    nfc_playoffs = {'division_leaders': [], 'wild_card': [], 'eliminated': []}
    
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
        seed_match = re.search(r'^(\d+):([A-Z]{2,3})(?:-[a-z])?\s+(\d+)\s+(\d+)\s+(\d+)', text)
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
            
            if current_conference == 'AFC' and current_section:
                if team_data not in afc_playoffs[current_section]:
                    afc_playoffs[current_section].append(team_data)
            elif current_conference == 'NFC' and current_section:
                if team_data not in nfc_playoffs[current_section]:
                    nfc_playoffs[current_section].append(team_data)
        else:
            # Regular team without seed (eliminated teams)
            team_data = parse_team_line(text)
            if team_data and current_section == 'eliminated':
                if current_conference == 'AFC' and team_data not in afc_playoffs['eliminated']:
                    afc_playoffs['eliminated'].append(team_data)
                elif current_conference == 'NFC' and team_data not in nfc_playoffs['eliminated']:
                    nfc_playoffs['eliminated'].append(team_data)
    
    return {'AFC': afc_playoffs, 'NFC': nfc_playoffs}

if __name__ == "__main__":
    standings = fetch_nfl_standings()
    if standings:
        print(json.dumps(standings, indent=2))
    else:
        print("Failed to fetch standings")
