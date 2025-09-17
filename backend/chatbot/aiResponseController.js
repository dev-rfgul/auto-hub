export async function generateAIResponse(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Using GEMINI_API_KEY:', apiKey);
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
      const response = await fetch(url, {
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

export async function getAIResponseHandler(req, res) {
  try {
    const prompt = req.body?.prompt || req.query?.prompt || 'Hello';
    const text = await generateAIResponse(prompt);
    return res.status(200).json({ response: text });
  } catch (err) {
    console.error('chatbot handler error', err);
    return res.status(500).json({ error: err.message || 'AI error' });
  }
}