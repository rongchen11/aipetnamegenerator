// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Get all important elements
    const nameRequirements = document.getElementById('nameRequirements');
    const generateBtn = document.getElementById('generateBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const nameCards = document.getElementById('nameCards');
    const errorMessage = document.getElementById('errorMessage');
    const buttonSpinner = generateBtn.querySelector('.button-spinner');
    const buttonText = generateBtn.querySelector('span');
    const thinkingIndicator = document.getElementById('thinkingIndicator');

    // API configuration
    const API_KEY = 'sk-tbghcdleqffciqmeeebqsqxqfyrlsbdlispmpruitszifnkq';
    const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

    // System prompt for guiding the AI
    const SYSTEM_PROMPT = `You are a professional pet name expert. Generate exactly 3 unique and meaningful pet names based on the given characteristics. Each name should be beautiful, memorable, and suitable for the pet.

For each name, provide:
1. A beautiful name that matches the pet's characteristics
2. A detailed explanation of the name's meaning and why it suits the pet

Format your response exactly like this:

1. [Name1]
[Detailed meaning and explanation for Name1]

2. [Name2]
[Detailed meaning and explanation for Name2]

3. [Name3]
[Detailed meaning and explanation for Name3]`;

    // Add event listeners
    generateBtn.addEventListener('click', generateNames);
    
    // Add Enter key listener
    nameRequirements.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            generateNames();
        }
    });

    // Function to show error messages
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    // Function to toggle loading state
    function toggleLoading(show) {
        buttonSpinner.style.display = show ? 'block' : 'none';
        buttonText.style.opacity = show ? '0' : '1';
        generateBtn.disabled = show;
        buttonText.textContent = show ? 'Please wait...' : 'Generate Names';
        thinkingIndicator.style.display = show ? 'block' : 'none';
    }

    // Function to show thinking process
    function showThinkingProcess() {
        const thinkingSteps = [
            "Analyzing pet characteristics...",
            "Brainstorming unique names...",
            "Finding perfect meanings...",
            "Creating special combinations...",
            "AI is thinking of cute names for your pet..."
        ];

        let currentStep = 0;
        const thinkingText = thinkingIndicator.querySelector('p');

        return setInterval(() => {
            thinkingText.textContent = thinkingSteps[currentStep];
            currentStep = (currentStep + 1) % thinkingSteps.length;
        }, 2000);
    }

    // Main function to generate names
    async function generateNames() {
        // Get user input
        const requirements = nameRequirements.value.trim();
        if (!requirements) {
            showError('Please describe your pet\'s characteristics!');
            return;
        }

        // Show loading state
        toggleLoading(true);
        resultsContainer.style.display = 'none';
        const thinkingInterval = showThinkingProcess();

        try {
            console.log('Preparing API request...');
            
            // Prepare API request data
            const requestData = {
                model: 'Pro/deepseek-ai/DeepSeek-R1',
                messages: [
                    {
                        role: 'system',
                        content: SYSTEM_PROMPT
                    },
                    {
                        role: 'user',
                        content: `Generate pet names based on these characteristics: ${requirements}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            };

            console.log('Sending API request...');
            console.log('Request data:', JSON.stringify(requestData, null, 2));

            // Send API request
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify(requestData)
            });

            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Raw response:', responseText);

            // Check response status
            if (!response.ok) {
                console.error('API Error:', responseText);
                throw new Error('Failed to generate names. Please try again.');
            }

            // Parse response data
            const data = JSON.parse(responseText);
            console.log('API response:', data);
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid response from server');
            }

            // Parse generated content
            const content = data.choices[0].message.content;
            console.log('Generated content:', content);
            
            // Extract names and meanings from text
            const namesList = extractNamesFromText(content);
            console.log('Extracted names:', namesList);

            // Display results
            displayResults(namesList);
        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'An error occurred while generating names');
        } finally {
            clearInterval(thinkingInterval);
            toggleLoading(false);
        }
    }

    // Function to extract names and meanings from text
    function extractNamesFromText(text) {
        const names = [];
        const lines = text.split('\n');
        let currentName = null;
        let currentMeaning = [];

        for (const line of lines) {
            if (line.trim() === '') continue;
            
            // Check if this line starts a new name (starts with a number)
            const nameMatch = line.match(/^\d+\.\s*([^:]+)/);
            if (nameMatch) {
                // If we already have a name, save it
                if (currentName) {
                    names.push({
                        name: currentName,
                        meaning: currentMeaning.join(' ').trim()
                    });
                }
                // Start new name
                currentName = nameMatch[1].trim();
                currentMeaning = [];
            } else if (currentName) {
                // Add this line to current meaning
                currentMeaning.push(line.trim());
            }
        }

        // Add the last name
        if (currentName) {
            names.push({
                name: currentName,
                meaning: currentMeaning.join(' ').trim()
            });
        }

        return names;
    }

    // Function to display the generated names
    function displayResults(names) {
        // Create name cards with icons
        nameCards.innerHTML = names.map(nameData => `
            <div class="name-card">
                <h3><i class="fas fa-paw"></i> ${nameData.name}</h3>
                <p>${nameData.meaning}</p>
            </div>
        `).join('');

        // Show results container and scroll to it
        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Initialize
    console.log('Script initialized. Ready to generate names!');
});
