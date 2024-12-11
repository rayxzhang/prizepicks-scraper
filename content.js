function scrapeStats() {
  try {
    const stats = [];
    const playerCards = document.querySelectorAll(PLAYER_CARD_SELECTOR);
    const selectedLeague = getSelectedLeague();
    
    console.log('Found player cards:', playerCards.length); // Debug log

    if (!playerCards || playerCards.length === 0) {
      console.log('No player cards found');
      return [];
    }

    playerCards.forEach(card => {
      try {
        const stat = {
          player: card.querySelector(PLAYER_NAME_SELECTOR)?.textContent?.trim() || 'N/A',
          teamPosition: card.querySelector(PLAYER_TEAM_POSITION_SELECTOR)?.textContent?.trim() || 'N/A',
          line: card.querySelector(PLAYER_STAT_VALUE_SELECTOR)?.textContent?.trim() || 'N/A',
          category: card.querySelector(PLAYER_STAT_TYPE_SELECTOR)?.textContent?.trim() || 'N/A',
          opponent: card.querySelector(PLAYER_OPPONENT_SELECTOR)?.textContent?.trim() || 'N/A',
          gameTime: card.querySelector(PLAYER_GAME_TIME_SELECTOR)?.textContent?.trim() || 'N/A'
        };

        // Split team-position into separate fields
        const [team, position] = stat.teamPosition.split(' - ');
        stat.team = team;
        stat.position = position;
        
        stats.push(stat);
      } catch (cardErr) {
        console.error('Error processing card:', cardErr);
      }
    });

    console.log('Scraped stats:', stats); // Debug log
    return {
      league: selectedLeague,
      stats: stats
    };
  } catch (err) {
    console.error('Error in scrapeStats:', err);
    return {
      league: 'unknown',
      stats: []
    };
  }
}

// Player card selectors
const PLAYER_CARD_SELECTOR = 'li[aria-label*="-"]';
const PLAYER_NAME_SELECTOR = '#test-player-name';
const PLAYER_TEAM_POSITION_SELECTOR = '#test-team-position';
const PLAYER_STAT_VALUE_SELECTOR = '.heading-md span';
const PLAYER_STAT_TYPE_SELECTOR = '.text-soClean-140 .break-words';
const PLAYER_GAME_TIME_SELECTOR = 'time span.body-sm';
const PLAYER_OPPONENT_SELECTOR = 'time span.text-soClean-100';

// Add this function after the existing selectors
const LEAGUE_BUTTON_SELECTOR = 'button.league-old[aria-selected="true"] .name';

function getSelectedLeague() {
  const leagueElement = document.querySelector(LEAGUE_BUTTON_SELECTOR);
  return leagueElement?.textContent || 'unknown';
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request); // Debug log
  
  if (request.action === 'scrape') {
    const stats = scrapeStats();
    console.log('Sending response:', stats); // Debug log
    sendResponse(stats);
    return true; // Keep the message channel open
  }
});

// Log when content script loads
console.log('Content script loaded'); 