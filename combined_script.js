let currentLeague = 'nfl';
let currentView = 'division';
let nflData = null;
let nbaData = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set up league button listeners
    document.querySelectorAll('.league-button').forEach(button => {
        button.addEventListener('click', () => {
            const league = button.dataset.league;
            switchLeague(league);
        });
    });

    // Set up view button listeners
    document.querySelectorAll('.view-button').forEach(button => {
        button.addEventListener('click', () => {
            currentView = button.dataset.view;
            document.querySelectorAll('.view-button').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            renderCurrentView();
        });
    });

    // Set up refresh button
    document.getElementById('refresh-btn').addEventListener('click', () => {
        fetchStandings(currentLeague, true);
    });

    // Initial load
    switchLeague('nfl');
});

function switchLeague(league) {
    currentLeague = league;
    
    // Update button states
    document.querySelectorAll('.league-button').forEach(button => {
        button.classList.toggle('active', button.dataset.league === league);
    });
    
    // Update header
    const title = document.getElementById('league-title');
    const seasonText = document.getElementById('season-text');
    
    if (league === 'nfl') {
        title.textContent = 'NFL Team Standings';
        seasonText.textContent = '2025 Season';
    } else {
        title.textContent = 'NBA Team Standings';
        seasonText.textContent = '2025-2026 Season';
    }
    
    fetchStandings(league);
}

async function fetchStandings(league, forceRefresh = false) {
    const loadingDiv = document.getElementById('loading');
    const contentDiv = document.getElementById('content');
    
    loadingDiv.style.display = 'block';
    contentDiv.style.display = 'none';
    
    try {
        const port = league === 'nfl' ? 8000 : 8001;
        const response = await fetch(`http://localhost:${port}/api/standings`);
        const data = await response.json();
        
        if (league === 'nfl') {
            nflData = data;
        } else {
            nbaData = data;
        }
        
        renderCurrentView();
        
        loadingDiv.style.display = 'none';
        contentDiv.style.display = 'block';
    } catch (error) {
        loadingDiv.innerHTML = `<p>Error loading ${league.toUpperCase()} data: ${error.message}</p>`;
    }
}

function renderCurrentView() {
    const data = currentLeague === 'nfl' ? nflData : nbaData;
    if (!data) return;
    
    switch (currentView) {
        case 'division':
            renderDivisionView(data);
            break;
        case 'conference':
            renderConferenceView(data);
            break;
        case 'league':
            renderLeagueView(data);
            break;
        case 'playoffs':
            renderPlayoffsView(data);
            break;
    }
}

function renderDivisionView(data) {
    const container = document.getElementById('standings-container');
    const conferences = currentLeague === 'nfl' 
        ? [{ name: 'AFC', key: 'AFC' }, { name: 'NFC', key: 'NFC' }]
        : [{ name: 'Eastern', key: 'Eastern' }, { name: 'Western', key: 'Western' }];
    
    const divisionOrder = currentLeague === 'nfl'
        ? ['East', 'North', 'South', 'West']
        : currentLeague === 'nba' 
            ? { Eastern: ['Atlantic', 'Central', 'Southeast'], Western: ['Northwest', 'Pacific', 'Southwest'] }
            : [];
    
    let html = '<div class="conferences-container">';
    
    conferences.forEach(conf => {
        html += `<div class="conference-section">
            <h2 class="conference-title">${conf.name} Conference</h2>`;
        
        const divisions = currentLeague === 'nfl' 
            ? divisionOrder 
            : divisionOrder[conf.key];
        
        divisions.forEach(division => {
            const teams = data.division[conf.key][division] || [];
            html += `
                <div class="division-section">
                    <h3 class="division-title">${conf.key} ${division}</h3>
                    <table class="standings-table">
                        <thead>
                            <tr>
                                <th>Team</th>
                                <th>W</th>
                                <th>L</th>
                                ${currentLeague === 'nfl' ? '<th>T</th>' : ''}
                            </tr>
                        </thead>
                        <tbody>`;
            
            teams.forEach(team => {
                const logo = getTeamLogo(team.name);
                html += `
                    <tr>
                        <td class="team-name">
                            <img src="${logo}" alt="${team.name}" class="team-logo">
                            ${team.name}
                        </td>
                        <td>${team.wins}</td>
                        <td>${team.losses}</td>
                        ${currentLeague === 'nfl' ? `<td>${team.ties || 0}</td>` : ''}
                    </tr>`;
            });
            
            html += `</tbody></table></div>`;
        });
        
        html += `</div>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function renderConferenceView(data) {
    const container = document.getElementById('standings-container');
    const conferences = currentLeague === 'nfl' 
        ? ['AFC', 'NFC']
        : ['Eastern', 'Western'];
    
    let html = '<div class="conferences-container">';
    
    conferences.forEach(conf => {
        const teams = data.conference[conf] || [];
        html += `
            <div class="conference-section">
                <h2 class="conference-title">${conf} Conference</h2>
                <table class="standings-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Team</th>
                            <th>W</th>
                            <th>L</th>
                            ${currentLeague === 'nfl' ? '<th>T</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>`;
        
        teams.forEach((team, index) => {
            const logo = getTeamLogo(team.name);
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td class="team-name">
                        <img src="${logo}" alt="${team.name}" class="team-logo">
                        ${team.name}
                    </td>
                    <td>${team.wins}</td>
                    <td>${team.losses}</td>
                    ${currentLeague === 'nfl' ? `<td>${team.ties || 0}</td>` : ''}
                </tr>`;
        });
        
        html += `</tbody></table></div>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function renderLeagueView(data) {
    const container = document.getElementById('standings-container');
    const teams = data.league || [];
    
    let html = `
        <div class="league-view">
            <h2 class="conference-title">${currentLeague.toUpperCase()} Standings</h2>
            <table class="standings-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Team</th>
                        <th>W</th>
                        <th>L</th>
                        ${currentLeague === 'nfl' ? '<th>T</th>' : ''}
                    </tr>
                </thead>
                <tbody>`;
    
    teams.forEach((team, index) => {
        const logo = getTeamLogo(team.name);
        html += `
            <tr>
                <td>${index + 1}</td>
                <td class="team-name">
                    <img src="${logo}" alt="${team.name}" class="team-logo">
                    ${team.name}
                </td>
                <td>${team.wins}</td>
                <td>${team.losses}</td>
                ${currentLeague === 'nfl' ? `<td>${team.ties || 0}</td>` : ''}
            </tr>`;
    });
    
    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

function renderPlayoffsView(data) {
    const container = document.getElementById('standings-container');
    const conferences = currentLeague === 'nfl' 
        ? ['AFC', 'NFC']
        : ['Eastern', 'Western'];
    
    let html = '<div class="conferences-container">';
    
    conferences.forEach(conf => {
        const teams = (data.playoffs && data.playoffs[conf]) || [];
        html += `
            <div class="conference-section">
                <h2 class="conference-title">${conf} Playoff Picture</h2>
                <table class="standings-table">
                    <thead>
                        <tr>
                            <th>Seed</th>
                            <th>Team</th>
                            <th>W</th>
                            <th>L</th>
                            ${currentLeague === 'nfl' ? '<th>T</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>`;
        
        teams.forEach((team, index) => {
            const logo = getTeamLogo(team.name);
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td class="team-name">
                        <img src="${logo}" alt="${team.name}" class="team-logo">
                        ${team.name}
                    </td>
                    <td>${team.wins}</td>
                    <td>${team.losses}</td>
                    ${currentLeague === 'nfl' ? `<td>${team.ties || 0}</td>` : ''}
                </tr>`;
        });
        
        html += `</tbody></table></div>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function getTeamLogo(teamName) {
    const logos = currentLeague === 'nfl' ? getNFLLogos() : getNBALogos();
    return logos[teamName] || '';
}

function getNFLLogos() {
    return {
        'Arizona Cardinals': 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png',
        'Atlanta Falcons': 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png',
        'Baltimore Ravens': 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',
        'Buffalo Bills': 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
        'Carolina Panthers': 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png',
        'Chicago Bears': 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
        'Cincinnati Bengals': 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',
        'Cleveland Browns': 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png',
        'Dallas Cowboys': 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
        'Denver Broncos': 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png',
        'Detroit Lions': 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png',
        'Green Bay Packers': 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
        'Houston Texans': 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png',
        'Indianapolis Colts': 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png',
        'Jacksonville Jaguars': 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png',
        'Kansas City Chiefs': 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
        'Las Vegas Raiders': 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png',
        'Los Angeles Chargers': 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png',
        'Los Angeles Rams': 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',
        'Miami Dolphins': 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png',
        'Minnesota Vikings': 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png',
        'New England Patriots': 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
        'New Orleans Saints': 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png',
        'New York Giants': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
        'New York Jets': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png',
        'Philadelphia Eagles': 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
        'Pittsburgh Steelers': 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png',
        'San Francisco 49ers': 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
        'Seattle Seahawks': 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
        'Tampa Bay Buccaneers': 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png',
        'Tennessee Titans': 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png',
        'Washington Commanders': 'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png'
    };
}

function getNBALogos() {
    return {
        'Atlanta Hawks': 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png',
        'Boston Celtics': 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
        'Brooklyn Nets': 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png',
        'Charlotte Hornets': 'https://a.espncdn.com/i/teamlogos/nba/500/cha.png',
        'Chicago Bulls': 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
        'Cleveland Cavaliers': 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png',
        'Dallas Mavericks': 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png',
        'Denver Nuggets': 'https://a.espncdn.com/i/teamlogos/nba/500/den.png',
        'Detroit Pistons': 'https://a.espncdn.com/i/teamlogos/nba/500/det.png',
        'Golden State Warriors': 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png',
        'Houston Rockets': 'https://a.espncdn.com/i/teamlogos/nba/500/hou.png',
        'Indiana Pacers': 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png',
        'Los Angeles Clippers': 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png',
        'Los Angeles Lakers': 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
        'Memphis Grizzlies': 'https://a.espncdn.com/i/teamlogos/nba/500/mem.png',
        'Miami Heat': 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png',
        'Milwaukee Bucks': 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png',
        'Minnesota Timberwolves': 'https://a.espncdn.com/i/teamlogos/nba/500/min.png',
        'New Orleans Pelicans': 'https://a.espncdn.com/i/teamlogos/nba/500/no.png',
        'New York Knicks': 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png',
        'Oklahoma City Thunder': 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png',
        'Orlando Magic': 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png',
        'Philadelphia 76ers': 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png',
        'Phoenix Suns': 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png',
        'Portland Trail Blazers': 'https://a.espncdn.com/i/teamlogos/nba/500/por.png',
        'Sacramento Kings': 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png',
        'San Antonio Spurs': 'https://a.espncdn.com/i/teamlogos/nba/500/sa.png',
        'Toronto Raptors': 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png',
        'Utah Jazz': 'https://a.espncdn.com/i/teamlogos/nba/500/utah.png',
        'Washington Wizards': 'https://a.espncdn.com/i/teamlogos/nba/500/wsh.png'
    };
}
