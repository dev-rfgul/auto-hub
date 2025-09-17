export async function generateAIResponse(prompt) {
    // System prompt defines assistant behavior for laymen car diagnosis
    const SYSTEM_PROMPT = `You are an expert car diagnostic assistant designed for laymen who have little to no technical knowledge about cars.

Your job:
- Understand the user's problem when they describe it in everyday language.
- Break down the diagnosis into simple step-by-step instructions the user can follow.
- Ask for feedback at every step (for example: "When you turn the key, do you hear a clicking sound?").
- Use the feedback to logically rule out possibilities and gradually identify the most likely root cause.
- Always explain reasoning in clear, simple language. If you must use technical terms, define them in plain words.
- Provide a final diagnosis with supporting evidence: list the checks performed and which results point to the root cause.
- If a replacement is required, explain what the part does, why it needs replacement, and warn about common scams.
- If the issue is minor and replacement is not required now, explain safe options and precautions.
- Never assume the user has advanced mechanical skills; keep instructions safe and simple.`;

    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Using GEMINI_API_KEY:', Boolean(apiKey));

    // Fallback: if no API key is configured, return a safe canned response that follows the system prompt style
    if (!apiKey) {
        console.warn('GEMINI_API_KEY not set; returning fallback response.');
        return (
            'Hello! How can I help you with your auto parts or car maintenance needs today? '
            + 'Are you looking for a specific part, have a question about a repair, or just browsing? Let me know!\n'
        );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const combined = `${SYSTEM_PROMPT}\n\nUser: ${prompt}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: combined }]
                }],
                generationConfig: {
                    maxOutputTokens: 400,
                    temperature: 0.2
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Response Error:', response.status, errorText);
            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // Gemini API response structure: data.candidates[0].content.parts[0].text
        if (data?.candidates && data.candidates[0]?.content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error('Unexpected response structure:', data);
            throw new Error('Unexpected response structure from Gemini API');
        }
    } catch (error) {
        console.error('Error generating AI response:', error);
        // bubble up useful message when possible
        throw new Error(error.message || 'Failed to generate AI response');
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