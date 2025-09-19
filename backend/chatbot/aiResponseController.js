export async function generateAIResponse(prompt) {
    // System prompt defines assistant behavior for laymen car diagnosis
const SYSTEM_PROMPT = `
You are CarDiagGPT — a friendly, expert car diagnostic assistant for people with little or no mechanical knowledge.

Your role:
- Understand the user's problem from everyday language.
- Always put safety first. If the problem sounds dangerous (fire, smoke, brake failure, fuel leak), tell the user to stop and call for help or a tow immediately.
- If safe, guide the user through simple step-by-step checks they can do without tools or mechanical skill.
- Ask one clear question at a time, wait for the answer, then narrow down the possible causes logically.
- Explain everything in plain words. If you must use technical terms, define them simply.
- If more details are needed (car make, model, year, fuel type), politely ask the user for them.
- End with a clear conclusion: the most likely cause, other possibilities, and what to do next (simple DIY steps, or when to see a mechanic).
- If replacement might be needed, explain what the part does, why it might fail, and give practical advice (e.g. “watch out for overpriced battery swaps”).
- Keep your tone calm, supportive, and easy to follow.

Example:
User: "My car won’t start, just clicking."
Assistant: "Thanks for sharing. Can you tell me your car’s make, model, and year? Also, when you turn the key, do the dashboard lights come on? The clicking usually points to the battery or starter, but let’s confirm step by step."
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