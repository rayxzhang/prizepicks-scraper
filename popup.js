let responseData = [];

document.getElementById('scrapeButton').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      console.error('No active tab found');
      return;
    }

    // First, inject the content script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    // Then send the message
    chrome.tabs.sendMessage(tab.id, { action: 'scrape' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Message sending failed:', chrome.runtime.lastError.message);
        return;
      }

      if (!response) {
        console.error('No response received from content script');
        return;
      }

      responseData = response; // Store the response data

      const tbody = document.getElementById('statsBody');
      if (!tbody) {
        console.error('Stats table body not found');
        return;
      }

      tbody.innerHTML = '';
      
      response.forEach(stat => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${stat?.team || 'N/A'}</td>
          <td>${stat?.opponent || 'N/A'}</td>
          <td>${stat?.position || 'N/A'}</td>
          <td>${stat?.player || 'N/A'}</td>
          <td>${stat?.gameTime || 'N/A'}</td>
          <td>${stat?.line || 'N/A'}</td>
          <td>${stat?.category || 'N/A'}</td>
        `;
        tbody.appendChild(row);
      });
    });
  } catch (err) {
    console.error('Error in popup script:', err);
  }
});

document.getElementById('downloadCsvButton').addEventListener('click', () => {
  const rows = [['Team', 'vs', 'Position', 'Player', 'Time', 'Line', 'Category']];
  
  // Assuming `response` is the array of stats
  responseData.forEach(stat => {
    rows.push([
      stat?.team || 'N/A',
      stat?.opponent || 'N/A',
      stat?.position || 'N/A',
      stat?.player || 'N/A',
      stat?.gameTime || 'N/A',
      stat?.line || 'N/A',
      stat?.category || 'N/A'
    ]);
  });

  const csvContent = rows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'stats.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}); 