export async function getAIResponse(prompt) {
    const apiKey = process.env.GEMINI_API_KEY; 
    console.log("API Key:", apiKey); // Debugging line to check if the API key is loaded correctly
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a helpful auto parts assistant. Help users find auto parts, answer questions about car maintenance, and provide technical support.\n\nUser: ${prompt}`
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: 150,
                    temperature: 0.7
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Response Error:', response.status, errorText);
            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        
        // Gemini API response structure is different from OpenAI
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error('Unexpected response structure:', data);
            throw new Error('Unexpected response structure from Gemini API');
        }
    } catch (error) {
        console.error('Error generating AI response:', error);
        throw new Error('Failed to generate AI response');
    }
}

getAIResponse("hello how are you?")