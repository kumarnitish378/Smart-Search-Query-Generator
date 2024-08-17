const apiKey = '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';
const maxTabs = 10; // Limit to open a maximum of 10 tabs

async function generateQueries(userInput) {
    try {
        console.log('Generating queries for:', userInput);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'Generate search queries based on user input.' },
                    { role: 'user', content: `Generate 10 advanced search queries based on the following input: ${userInput}\
                    Result should be in the JSON format example '''{"1":"result 1", "3":"result 1", "2":"result 1"}'''` }
                ],
                max_tokens: 350
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const data = await response.json();
        console.log('Response from GPT:', data);

        let responseText = data.choices[0].message.content;
        responseText = responseText.trim();

        if (responseText.startsWith('{') && responseText.endsWith('}')) {
            try {
                const queries = JSON.parse(responseText);
                console.log('Parsed queries:', queries);
                return Object.values(queries);
            } catch (jsonError) {
                console.error('Error parsing JSON:', jsonError);
                return [];
            }
        } else {
            console.error('Response is not a valid JSON string:', responseText);
            return [];
        }
    } catch (error) {
        console.error('Error generating queries:', error);
        return [];
    }
}

function displayQueries(queries, userInput) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Clear previous results

    if (userInput) {
        const userQueryElement = document.createElement('div');
        userQueryElement.textContent = `User Query: ${userInput}`;
        resultsContainer.appendChild(userQueryElement);
    }

    if (queries.length) {
        queries.forEach((query, index) => {
            const queryElement = document.createElement('div');
            queryElement.textContent = query;
            queryElement.className = 'query-item'; // Apply CSS class
            queryElement.onclick = () => {
                const queryUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                if (!document.getElementById('auto-toggle').checked) {
                    // Open tabs manually if toggle is off
                    window.open(queryUrl, '_blank', 'noopener,noreferrer');
                }
            };
            resultsContainer.appendChild(queryElement);
        });
    } else {
        resultsContainer.textContent = 'No queries generated.';
    }
}

document.getElementById('search-button').addEventListener('click', async () => {
    const userInput = document.getElementById('search-input').value;
    if (userInput) {
        const queries = await generateQueries(userInput);
        displayQueries(queries, userInput);

        const isAutoOpen = document.getElementById('auto-toggle').checked;

        if (isAutoOpen) {
            // Open each query in a new tab if toggle is on
            let openCount = 0;
            queries.slice(0, maxTabs).forEach((query, index) => {
                const userQueryUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                setTimeout(() => {
                    const userQueryTab = window.open(userQueryUrl, '_blank', 'noopener,noreferrer');
                    if (userQueryTab) {
                        userQueryTab.opener = null; // Ensure the new tab doesn't have a reference back to the current page
                        openCount++;
                    } else {
                        console.error('Failed to open user query tab.');
                    }
                    if (openCount >= maxTabs) {
                        console.log('Maximum tab limit reached.');
                    }
                }, index * 100);
            });
        }
    } else {
        console.log('No input provided.');
    }
});
