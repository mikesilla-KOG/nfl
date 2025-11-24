// NFL Teams data - will be fetched from API
let nflData = {
    division: null,
    conference: null,
    league: null,
    playoffs: null
};

let currentView = 'division';

// Fetch live NFL standings data
async function fetchNFLStandings() {
    console.log('Fetching NFL standings from plaintextsports.com...');
    try {
        // Fetch from our local API that scrapes plaintextsports.com
        const response = await fetch('/api/standings');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response received:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Store all data
        nflData = data;
        
        // Render the current view
        renderView(currentView);
        
        // Update last updated time
        updateLastUpdatedTime();
        
        // Update header to show it's live data
        const season = document.querySelector('.season');
        if (season) {
            season.textContent = '2025-2026 Season - Live Data';
        }
        
        console.log('Live data loaded successfully');
        
    } catch (error) {
        console.error('Error fetching NFL standings:', error);
        // Use fallback data
        loadFallbackData();
    }
}

// Render the selected view
function renderView(view) {
    currentView = view;
    
    // Hide all views
    document.querySelectorAll('.view-content').forEach(v => v.classList.remove('active'));
    
    // Show selected view
    const viewElement = document.getElementById(`${view}-view`);
    if (viewElement) {
        viewElement.classList.add('active');
    }
    
    // Render content based on view
    switch(view) {
        case 'division':
            renderDivisionView();
            break;
        case 'conference':
            renderConferenceView();
            break;
        case 'league':
            renderLeagueView();
            break;
        case 'playoffs':
            renderPlayoffsView();
            break;
    }
}

// Render division view
function renderDivisionView() {
    console.log('Rendering division view', nflData.division);
    if (!nflData.division) {
        console.error('No division data available');
        return;
    }
    
    const divisionView = document.getElementById('division-view');
    
    // Clear existing content
    divisionView.innerHTML = '';
    
    // Create container for two columns
    const container = document.createElement('div');
    container.className = 'conferences-container';
    
    // Create AFC column
    const afcColumn = document.createElement('div');
    afcColumn.className = 'conference-column';
    afcColumn.innerHTML = '<h2 style="color: #1e3c72; font-size: 1.8em; margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #e8eaf6 0%, #f3e5f5 100%); border-left: 6px solid #1e3c72;">AFC (American Football Conference)</h2>';
    
    const afcDivisions = nflData.division.AFC;
    const divisionOrder = ['East', 'North', 'South', 'West'];
    
    divisionOrder.forEach(division => {
        if (afcDivisions[division]) {
            afcColumn.innerHTML += createDivisionTable(`AFC ${division}`, afcDivisions[division]);
        }
    });
    
    // Create NFC column
    const nfcColumn = document.createElement('div');
    nfcColumn.className = 'conference-column';
    nfcColumn.innerHTML = '<h2 style="color: #1e3c72; font-size: 1.8em; margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #e8eaf6 0%, #f3e5f5 100%); border-left: 6px solid #1e3c72;">NFC (National Football Conference)</h2>';
    
    const nfcDivisions = nflData.division.NFC;
    
    divisionOrder.forEach(division => {
        if (nfcDivisions[division]) {
            nfcColumn.innerHTML += createDivisionTable(`NFC ${division}`, nfcDivisions[division]);
        }
    });
    
    container.appendChild(afcColumn);
    container.appendChild(nfcColumn);
    divisionView.appendChild(container);
    
    console.log('Division view rendered');
}

// Get team logo URL
function getTeamLogo(teamName) {
    // Map team names to their ESPN logo URLs
    const teamLogos = {
        'New England Patriots': 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
        'Buffalo Bills': 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
        'Miami Dolphins': 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png',
        'New York Jets': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png',
        'Baltimore Ravens': 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',
        'Pittsburgh Steelers': 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png',
        'Cincinnati Bengals': 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',
        'Cleveland Browns': 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png',
        'Indianapolis Colts': 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png',
        'Jacksonville Jaguars': 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png',
        'Houston Texans': 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png',
        'Tennessee Titans': 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png',
        'Denver Broncos': 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png',
        'Los Angeles Chargers': 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png',
        'Kansas City Chiefs': 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
        'Las Vegas Raiders': 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png',
        'Philadelphia Eagles': 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
        'Dallas Cowboys': 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
        'Washington Commanders': 'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png',
        'New York Giants': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
        'Chicago Bears': 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
        'Green Bay Packers': 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
        'Detroit Lions': 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png',
        'Minnesota Vikings': 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png',
        'Tampa Bay Buccaneers': 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png',
        'Carolina Panthers': 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png',
        'Atlanta Falcons': 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png',
        'New Orleans Saints': 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png',
        'Los Angeles Rams': 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',
        'Seattle Seahawks': 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
        'San Francisco 49ers': 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
        'Arizona Cardinals': 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png'
    };
    
    return teamLogos[teamName] || '';
}

// Create a table for a division
function createDivisionTable(title, teams, hideTitle = false) {
    const sortedTeams = sortTeamsByRecord([...teams]);
    let html = `
        <div class="division-section">`;
    
    if (!hideTitle) {
        html += `<h3>${title}</h3>`;
    }
    
    html += `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Team</th>
                            <th>W</th>
                            <th>L</th>
                            <th>T</th>
                            <th>Win %</th>
                        </tr>
                    </thead>
                    <tbody>`;
    
    sortedTeams.forEach((team, index) => {
        const winPct = calculateWinPercentage(team.wins, team.losses, team.ties);
        const logoUrl = getTeamLogo(team.name);
        html += `
            <tr>
                <td>${index + 1}</td>
                <td class="team-name">
                    ${logoUrl ? `<img src="${logoUrl}" alt="${team.name}" class="team-logo">` : ''}
                    <span>${team.name}</span>
                </td>
                <td>${team.wins}</td>
                <td>${team.losses}</td>
                <td>${team.ties}</td>
                <td class="win-percentage">${winPct}</td>
            </tr>`;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>`;
    
    return html;
}

// Render conference view
function renderConferenceView() {
    console.log('Rendering conference view', nflData.division);
    if (!nflData.division) {
        console.error('No division data available');
        return;
    }
    
    const conferenceView = document.getElementById('conference-view');
    
    // Clear existing content
    conferenceView.innerHTML = '';
    
    // Create container for two columns
    const container = document.createElement('div');
    container.className = 'conferences-container';
    
    // Create AFC column - combine all AFC division teams
    const afcColumn = document.createElement('div');
    afcColumn.className = 'conference-column';
    afcColumn.innerHTML = '<h2 style="color: #1e3c72; font-size: 1.8em; margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #e8eaf6 0%, #f3e5f5 100%); border-left: 6px solid #1e3c72;">AFC (American Football Conference)</h2>';
    
    const afcDivisions = nflData.division.AFC;
    const divisionOrder = ['East', 'North', 'South', 'West'];
    
    // Combine all AFC teams into one array
    let allAfcTeams = [];
    divisionOrder.forEach(division => {
        if (afcDivisions[division]) {
            allAfcTeams = allAfcTeams.concat(afcDivisions[division]);
        }
    });
    
    console.log('Total AFC teams:', allAfcTeams.length);
    
    // Create single table for all AFC teams
    afcColumn.innerHTML += createDivisionTable('AFC', allAfcTeams, true);
    
    // Create NFC column - combine all NFC division teams
    const nfcColumn = document.createElement('div');
    nfcColumn.className = 'conference-column';
    nfcColumn.innerHTML = '<h2 style="color: #1e3c72; font-size: 1.8em; margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #e8eaf6 0%, #f3e5f5 100%); border-left: 6px solid #1e3c72;">NFC (National Football Conference)</h2>';
    
    const nfcDivisions = nflData.division.NFC;
    
    // Combine all NFC teams into one array
    let allNfcTeams = [];
    divisionOrder.forEach(division => {
        if (nfcDivisions[division]) {
            console.log(`NFC ${division}:`, nfcDivisions[division].length, 'teams');
            allNfcTeams = allNfcTeams.concat(nfcDivisions[division]);
        }
    });
    
    console.log('Total NFC teams:', allNfcTeams.length);
    
    // Create single table for all NFC teams
    nfcColumn.innerHTML += createDivisionTable('NFC', allNfcTeams, true);
    
    container.appendChild(afcColumn);
    container.appendChild(nfcColumn);
    conferenceView.appendChild(container);
    
    console.log('Conference view rendered with AFC/NFC columns');
}

// Render league view
function renderLeagueView() {
    console.log('Rendering league view', nflData.league);
    if (!nflData.league || !Array.isArray(nflData.league)) {
        console.error('No league data available');
        return;
    }
    
    const tbody = document.getElementById('league-tbody');
    if (!tbody) {
        console.error('League tbody not found');
        return;
    }
    
    const sortedTeams = sortTeamsByRecord([...nflData.league]);
    
    tbody.innerHTML = '';
    
    sortedTeams.forEach((team, index) => {
        const row = document.createElement('tr');
        const winPct = calculateWinPercentage(team.wins, team.losses, team.ties);
        const logoUrl = getTeamLogo(team.name);
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td class="team-name">
                ${logoUrl ? `<img src="${logoUrl}" alt="${team.name}" class="team-logo">` : ''}
                <span>${team.name}</span>
            </td>
            <td>${team.wins}</td>
            <td>${team.losses}</td>
            <td>${team.ties}</td>
            <td class="win-percentage">${winPct}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    console.log('League view rendered');
}

// Render playoffs view
function renderPlayoffsView() {
    console.log('Rendering playoffs view', nflData.playoffs);
    if (!nflData.playoffs) {
        console.error('No playoffs data available');
        return;
    }
    
    const afcPlayoffs = document.getElementById('afc-playoffs');
    const nfcPlayoffs = document.getElementById('nfc-playoffs');
    
    if (!afcPlayoffs || !nfcPlayoffs) {
        console.error('Playoff containers not found');
        return;
    }
    
    afcPlayoffs.innerHTML = createPlayoffSection(nflData.playoffs.AFC || {});
    nfcPlayoffs.innerHTML = createPlayoffSection(nflData.playoffs.NFC || {});
    console.log('Playoffs view rendered');
}

// Create playoff section HTML
function createPlayoffSection(playoffData) {
    let html = '';
    
    // Division Leaders
    if (playoffData.division_leaders && playoffData.division_leaders.length > 0) {
        html += `
            <div class="playoff-section">
                <h3>Division Leaders</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Seed</th>
                                <th>Team</th>
                                <th>W</th>
                                <th>L</th>
                                <th>T</th>
                                <th>Win %</th>
                            </tr>
                        </thead>
                        <tbody>`;
        
        playoffData.division_leaders.forEach(team => {
            const winPct = calculateWinPercentage(team.wins, team.losses, team.ties);
            const logoUrl = getTeamLogo(team.name);
            html += `
                <tr>
                    <td>${team.seed}</td>
                    <td class="team-name">
                        ${logoUrl ? `<img src="${logoUrl}" alt="${team.name}" class="team-logo">` : ''}
                        <span>${team.name}</span>
                    </td>
                    <td>${team.wins}</td>
                    <td>${team.losses}</td>
                    <td>${team.ties}</td>
                    <td class="win-percentage">${winPct}</td>
                </tr>`;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>`;
    }
    
    // Wild Card
    if (playoffData.wild_card && playoffData.wild_card.length > 0) {
        html += `
            <div class="playoff-section">
                <h3>Wild Card</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Seed</th>
                                <th>Team</th>
                                <th>W</th>
                                <th>L</th>
                                <th>T</th>
                                <th>Win %</th>
                            </tr>
                        </thead>
                        <tbody>`;
        
        playoffData.wild_card.forEach(team => {
            const winPct = calculateWinPercentage(team.wins, team.losses, team.ties);
            const logoUrl = getTeamLogo(team.name);
            html += `
                <tr>
                    <td>${team.seed}</td>
                    <td class="team-name">
                        ${logoUrl ? `<img src="${logoUrl}" alt="${team.name}" class="team-logo">` : ''}
                        <span>${team.name}</span>
                    </td>
                    <td>${team.wins}</td>
                    <td>${team.losses}</td>
                    <td>${team.ties}</td>
                    <td class="win-percentage">${winPct}</td>
                </tr>`;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>`;
    }
    
    // Eliminated teams
    if (playoffData.eliminated && playoffData.eliminated.length > 0) {
        html += `<div class="playoff-separator">Playoff Cutoff Line</div>`;
        html += `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Team</th>
                            <th>W</th>
                            <th>L</th>
                            <th>T</th>
                            <th>Win %</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        playoffData.eliminated.forEach((team, index) => {
            const winPct = calculateWinPercentage(team.wins, team.losses, team.ties);
            const logoUrl = getTeamLogo(team.name);
            html += `
                <tr style="opacity: 0.6;">
                    <td>-</td>
                    <td class="team-name">
                        ${logoUrl ? `<img src="${logoUrl}" alt="${team.name}" class="team-logo">` : ''}
                        <span>${team.name}</span>
                    </td>
                    <td>${team.wins}</td>
                    <td>${team.losses}</td>
                    <td>${team.ties}</td>
                    <td class="win-percentage">${winPct}</td>
                </tr>`;
        });
        
        html += `
                    </tbody>
                </table>
            </div>`;
    }
    
    return html;
}

// Fallback data with current 2024 season standings (Week 12)
function loadFallbackData() {
    console.log('Loading fallback data...');
    
    // Simple fallback - just conference view
    nflData.conference = {
        AFC: [
            { name: 'Kansas City Chiefs', wins: 10, losses: 1, ties: 0 },
            { name: 'Buffalo Bills', wins: 9, losses: 2, ties: 0 }
        ],
        NFC: [
            { name: 'Detroit Lions', wins: 10, losses: 1, ties: 0 },
            { name: 'Philadelphia Eagles', wins: 9, losses: 2, ties: 0 }
        ]
    };
    
    nflData.league = [...nflData.conference.AFC, ...nflData.conference.NFC];
    nflData.division = { AFC: {}, NFC: {} };
    nflData.playoffs = { AFC: {}, NFC: {} };
    
    renderView(currentView);
    updateLastUpdatedTime();
    
    // Show message that we're using cached data
    const season = document.querySelector('.season');
    if (season) {
        season.textContent = '2024-2025 Season - Cached Data (API Error)';
    }
}

// Update last updated timestamp
function updateLastUpdatedTime() {
    const footer = document.querySelector('footer p');
    const now = new Date();
    const timeString = now.toLocaleString('en-US', { 
        dateStyle: 'full', 
        timeStyle: 'short' 
    });
    footer.textContent = `Last Updated: ${timeString}`;
}

// Calculate win percentage
function calculateWinPercentage(wins, losses, ties) {
    const totalGames = wins + losses + ties;
    if (totalGames === 0) return 0;
    // Ties count as 0.5 wins in NFL standings
    return ((wins + (ties * 0.5)) / totalGames).toFixed(3);
}

// Sort teams by record (win percentage, then wins as tiebreaker)
function sortTeamsByRecord(teams) {
    return teams.sort((a, b) => {
        const aWinPct = parseFloat(calculateWinPercentage(a.wins, a.losses, a.ties));
        const bWinPct = parseFloat(calculateWinPercentage(b.wins, b.losses, b.ties));
        
        // First sort by win percentage
        if (bWinPct !== aWinPct) {
            return bWinPct - aWinPct;
        }
        
        // If win percentages are equal, sort by total wins
        return b.wins - a.wins;
    });
}

// Populate table with team data
function populateTable(conference, teams, tbodyId) {
    const tbody = document.getElementById(tbodyId);
    const sortedTeams = sortTeamsByRecord([...teams]);
    
    tbody.innerHTML = '';
    
    sortedTeams.forEach((team, index) => {
        const row = document.createElement('tr');
        const winPct = calculateWinPercentage(team.wins, team.losses, team.ties);
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td class="team-name">${team.name}</td>
            <td>${team.wins}</td>
            <td>${team.losses}</td>
            <td>${team.ties}</td>
            <td class="win-percentage">${winPct}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing...');
    
    // Setup tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            // Update active tab
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            
            // Render the selected view
            const view = button.getAttribute('data-view');
            console.log('Switching to view:', view);
            renderView(view);
        });
    });
    
    // Show initial loading message
    const afcDiv = document.getElementById('afc-divisions');
    const nfcDiv = document.getElementById('nfc-divisions');
    if (afcDiv) afcDiv.innerHTML = '<p style="text-align: center; padding: 40px;">Loading live data...</p>';
    if (nfcDiv) nfcDiv.innerHTML = '<p style="text-align: center; padding: 40px;">Loading live data...</p>';
    
    // Fetch live data
    fetchNFLStandings();
});
