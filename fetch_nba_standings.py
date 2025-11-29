#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
import json
import re

# Map team abbreviations to full names
TEAM_NAMES = {
    'ATL': 'Atlanta Hawks', 'BOS': 'Boston Celtics', 'BKN': 'Brooklyn Nets', 'CHA': 'Charlotte Hornets',
    'CHI': 'Chicago Bulls', 'CLE': 'Cleveland Cavaliers', 'DAL': 'Dallas Mavericks', 'DEN': 'Denver Nuggets',
    'DET': 'Detroit Pistons', 'GSW': 'Golden State Warriors', 'GS': 'Golden State Warriors', 
    'HOU': 'Houston Rockets', 'IND': 'Indiana Pacers', 'LAC': 'Los Angeles Clippers', 'LAL': 'Los Angeles Lakers',
    'MEM': 'Memphis Grizzlies', 'MIA': 'Miami Heat', 'MIL': 'Milwaukee Bucks', 'MIN': 'Minnesota Timberwolves',
    'NOP': 'New Orleans Pelicans', 'NO': 'New Orleans Pelicans', 'NYK': 'New York Knicks', 'NY': 'New York Knicks',
    'OKC': 'Oklahoma City Thunder', 'ORL': 'Orlando Magic', 'PHI': 'Philadelphia 76ers', 'PHX': 'Phoenix Suns',
    'POR': 'Portland Trail Blazers', 'SAC': 'Sacramento Kings', 'SAS': 'San Antonio Spurs', 'SA': 'San Antonio Spurs',
    'TOR': 'Toronto Raptors', 'UTA': 'Utah Jazz', 'WAS': 'Washington Wizards', 'WSH': 'Washington Wizards'
}

def fetch_nba_standings():
    url = "https://plaintextsports.com/nba/2025-2026/standings"
    
    try:
        print(f"Fetching NBA from {url}...")
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        print("NBA data fetched successfully")
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Parse all different views
        division_data = parse_division_view(soup)
        conference_data = parse_conference_view(soup)
        # Build league data from conference data (all teams, flat list, unique)
        league_teams = []
        seen = set()
        for conf in conference_data:
            for team in conference_data[conf]:
                abbr = team.get('abbr')
                if abbr and abbr not in seen:
                    league_teams.append(team)
                    seen.add(abbr)
        playoffs_data = parse_playoffs_view(soup)
        return {
            'division': division_data,
            'conference': conference_data,
            'league': league_teams,
            'playoffs': playoffs_data
        }
    
    except Exception as e:
        print(f"Error fetching NBA standings: {e}")
        return None

def parse_team_line(text):
    """Parse a team line and return team data (NBA has no ties, just W-L)"""
    match = re.search(r'^([A-Z]{2,3})(?:-[a-z])?\s+(\d+)\s+(\d+)', text)
    if match:
        abbr = match.group(1)
        wins = int(match.group(2))
        losses = int(match.group(3))
        team_name = TEAM_NAMES.get(abbr, abbr)
        
        return {
            'name': team_name,
            'abbr': abbr,
            'wins': wins,
            'losses': losses
        }
    return None

def parse_division_view(soup):
    """Parse division standings"""
    # Map NBA Cup groups to traditional NBA divisions for frontend compatibility
    east_map = {'A': 'Atlantic', 'B': 'Central', 'C': 'Southeast'}
    west_map = {'A': 'Northwest', 'B': 'Pacific', 'C': 'Southwest'}
    eastern_divisions = {'Atlantic': [], 'Central': [], 'Southeast': []}
    western_divisions = {'Northwest': [], 'Pacific': [], 'Southwest': []}
    eastern_abbrs = set()
    western_abbrs = set()
    current_conference = None
    current_group = None
    in_group = False
    for element in soup.find_all('div'):
        text = element.get_text().strip()
        # Detect NBA Cup group headers
        if text.startswith('East A:'):
            current_conference, current_group, in_group = 'Eastern', 'A', True
            continue
        elif text.startswith('East B:'):
            current_conference, current_group, in_group = 'Eastern', 'B', True
            continue
        elif text.startswith('East C:'):
            current_conference, current_group, in_group = 'Eastern', 'C', True
            continue
        elif text.startswith('West A:'):
            current_conference, current_group, in_group = 'Western', 'A', True
            continue
        elif text.startswith('West B:'):
            current_conference, current_group, in_group = 'Western', 'B', True
            continue
        elif text.startswith('West C:'):
            current_conference, current_group, in_group = 'Western', 'C', True
            continue
        elif text == '' or text.startswith('*') or 'plaintextsports' in text:
            in_group = False
            continue
        # Parse teams in group
        if in_group and current_conference and current_group:
            group_match = re.search(r'\d+:\[?([A-Z]{2,3})\]?.*?(\d+)-(\d+)', text)
            if group_match:
                abbr = group_match.group(1)
                wins = int(group_match.group(2))
                losses = int(group_match.group(3))
                team_data = {
                    'name': TEAM_NAMES.get(abbr, abbr),
                    'abbr': abbr,
                    'wins': wins,
                    'losses': losses
                }
                if current_conference == 'Eastern':
                    div = east_map[current_group]
                    if abbr not in eastern_abbrs:
                        eastern_divisions[div].append(team_data)
                        eastern_abbrs.add(abbr)
                elif current_conference == 'Western':
                    div = west_map[current_group]
                    if abbr not in western_abbrs:
                        western_divisions[div].append(team_data)
                        western_abbrs.add(abbr)
    return {'Eastern': eastern_divisions, 'Western': western_divisions}

def parse_conference_view(soup):
    """Parse conference standings from NBA Cup knockout round section"""
    eastern_teams = []
    western_teams = []
    eastern_abbrs = set()
    western_abbrs = set()
    current_conference = None
    in_group = False
    for element in soup.find_all('div'):
        text = element.get_text().strip()
        # Detect NBA Cup group headers
        if text.startswith('East') and ':' in text:
            current_conference = 'Eastern'
            in_group = True
            continue
        elif text.startswith('West') and ':' in text:
            current_conference = 'Western'
            in_group = True
            continue
        # Knockout round headers
        elif 'Eastern Conference Knockout Round:' in text:
            current_conference = 'Eastern'
            in_group = False
            continue
        elif 'Western Conference Knockout Round:' in text:
            current_conference = 'Western'
            in_group = False
            continue
        elif text.startswith('*') or 'plaintextsports' in text:
            in_group = False
            current_conference = None
            continue
        # Parse teams in group sections (e.g., 1:[TOR](...)  4-0 ...)
        if in_group and current_conference:
            group_match = re.search(r'\d+:\[?([A-Z]{2,3})\]?.*?(\d+)-(\d+)', text)
            if group_match:
                abbr = group_match.group(1)
                wins = int(group_match.group(2))
                losses = int(group_match.group(3))
                team_data = {
                    'name': TEAM_NAMES.get(abbr, abbr),
                    'abbr': abbr,
                    'wins': wins,
                    'losses': losses
                }
                if current_conference == 'Eastern' and abbr not in eastern_abbrs:
                    eastern_teams.append(team_data)
                    eastern_abbrs.add(abbr)
                elif current_conference == 'Western' and abbr not in western_abbrs:
                    western_teams.append(team_data)
                    western_abbrs.add(abbr)
    # Only keep unique teams per conference (should be 15 each)
    return {'Eastern': eastern_teams[:15], 'Western': western_teams[:15]}

def parse_league_view(soup):
    """Parse league standings (all 30 teams)"""
    all_teams = []
    all_abbrs = set()
    in_league_section = False
    
    for element in soup.find_all('div'):
        text = element.get_text().strip()
        
        if text == 'NBA:':
            in_league_section = True
            continue
        elif 'Eastern Conference' in text or 'Western Conference' in text:
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
    eastern_playoffs = {'division_leaders': [], 'wild_card': [], 'eliminated': []}
    western_playoffs = {'division_leaders': [], 'wild_card': [], 'eliminated': []}
    eastern_abbrs = {'division_leaders': set(), 'wild_card': set(), 'eliminated': set()}
    western_abbrs = {'division_leaders': set(), 'wild_card': set(), 'eliminated': set()}
    
    current_conference = None
    
    for element in soup.find_all('div'):
        text = element.get_text().strip()
        
        if 'Eastern Conference' in text:
            current_conference = 'Eastern'
        elif 'Western Conference' in text:
            current_conference = 'Western'
        
        # Parse team with seed number (e.g., "1:BOS  15  3")
        seed_match = re.search(r'^(\d+):([A-Z]{2,3})\s+(\d+)\s+(\d+)', text)
        if seed_match:
            seed = int(seed_match.group(1))
            abbr = seed_match.group(2)
            wins = int(seed_match.group(3))
            losses = int(seed_match.group(4))
            
            team_data = {
                'seed': seed,
                'name': TEAM_NAMES.get(abbr, abbr),
                'abbr': abbr,
                'wins': wins,
                'losses': losses
            }
            
            # Seeds 1-6 are playoff teams, rest are play-in or out
            target_section = 'division_leaders' if seed <= 6 else 'wild_card'
            
            if current_conference == 'Eastern' and abbr not in eastern_abbrs[target_section]:
                eastern_playoffs[target_section].append(team_data)
                eastern_abbrs[target_section].add(abbr)
            elif current_conference == 'Western' and abbr not in western_abbrs[target_section]:
                western_playoffs[target_section].append(team_data)
                western_abbrs[target_section].add(abbr)
        else:
            # Eliminated teams (marked with -e)
            eliminated_match = re.search(r'^([A-Z]{2,3})-e\s+(\d+)\s+(\d+)', text)
            if eliminated_match:
                abbr = eliminated_match.group(1)
                wins = int(eliminated_match.group(2))
                losses = int(eliminated_match.group(3))
                
                team_data = {
                    'name': TEAM_NAMES.get(abbr, abbr),
                    'abbr': abbr,
                    'wins': wins,
                    'losses': losses
                }
                
                if current_conference == 'Eastern' and abbr not in eastern_abbrs['eliminated']:
                    eastern_playoffs['eliminated'].append(team_data)
                    eastern_abbrs['eliminated'].add(abbr)
                elif current_conference == 'Western' and abbr not in western_abbrs['eliminated']:
                    western_playoffs['eliminated'].append(team_data)
                    western_abbrs['eliminated'].add(abbr)
    
    return {'Eastern': eastern_playoffs, 'Western': western_playoffs}

if __name__ == "__main__":
    standings = fetch_nba_standings()
    if standings:
        print(json.dumps(standings, indent=2))
    else:
        print("Failed to fetch NBA standings")
