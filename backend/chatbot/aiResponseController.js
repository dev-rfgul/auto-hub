export async function generateAIResponse(prompt) {
    // System prompt defines assistant behavior for laymen car diagnosis
const SYSTEM_PROMPT = `
You are CarDiagGPT — an expert car diagnostic assistant that helps users identify car issues with minimal input. Your goal is to ask just a few simple questions to quickly pinpoint the problem, then offer spare part recommendations based on your analysis.

Your role:
- Start with 3-4 short, clear questions to narrow down the problem (safety first!).
- Once you have enough information, provide your analysis of the most likely issue.
- Recommend the spare part(s) needed based on your diagnosis, with a simple explanation of what the part does and why it may have failed.
- If the problem sounds dangerous (fire, smoke, brake failure, fuel leak), instruct the user to stop immediately and call for help or a tow.
- Keep the language simple, clear, and friendly—avoid jargon unless absolutely necessary (and explain it if you use it).
- Always provide actionable next steps: what to check, replace, or when to see a mechanic.

Example:
User: "My car won't start, just clicking."
Assistant: "Got it! Can you tell me your car's make, model, and year? Also, do the dashboard lights come on when you try to start it? The clicking sound usually means a battery or starter issue, but let’s narrow it down together."
`;



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

    // helper: fetch with timeout and retries
    const fetchWithRetries = async (input, init = {}, retries = 2, timeoutMs = 10000) => {
        for (let attempt = 0; attempt <= retries; attempt++) {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeoutMs);
            try {
                const resp = await fetch(input, { ...init, signal: controller.signal });
                clearTimeout(id);
                return resp;
            } catch (err) {
                clearTimeout(id);
                // If we've exhausted retries, rethrow
                if (attempt === retries) throw err;
                // otherwise wait a bit (exponential backoff) and retry
                const backoff = 200 * Math.pow(2, attempt);
                console.warn(`Fetch attempt ${attempt + 1} failed, retrying after ${backoff}ms`, err?.message || err);
                await new Promise((r) => setTimeout(r, backoff));
            }
        }
    };

    try {
        const combined = `${SYSTEM_PROMPT}\n\nUser: ${prompt}`;

        const response = await fetchWithRetries(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: combined }]
                }],
                generationConfig: {
                    maxOutputTokens: 1400,
                    temperature: 0.2
                }
            }),
        }, 2, 10000);

        if (!response.ok) {
            const errorText = await response.text().catch(() => '<no body>');
            console.error('API Response Error:', response.status, errorText);
            // Return a helpful fallback instead of throwing so frontend gets a friendly reply
            return (`I'm temporarily unable to reach the AI service (status ${response.status}). ` +
                "Please try again in a moment. Meanwhile, please describe the issue with your car in a few sentences: what you heard/seen, when it started, recent repairs, and any dashboard lights.");
        }

        const data = await response.json();

        // Gemini API response structure: data.candidates[0].content.parts[0].text
        if (data?.candidates && data.candidates[0]?.content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error('Unexpected response structure:', data);
            // graceful fallback
            return ('I could not parse the AI response. Please try again, or describe the issue in more detail so I can help.');
        }
    } catch (error) {
        console.error('Error generating AI response:', error);
        // Network errors (timeout, ENETUNREACH, etc.) are common in dev environments.
        // Provide a useful canned reply so the frontend remains responsive.
        return (
            "I'm currently unable to reach the AI service due to a network or timeout error. " +
            "You can still tell me about the problem: describe the symptoms (noises, smells, warning lights), when it happens, and any recent work on the vehicle. " +
            "I'll guide you through safe checks and possible causes based on what you tell me."
        );
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
