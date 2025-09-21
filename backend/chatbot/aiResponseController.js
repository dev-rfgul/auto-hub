const products= [
  {
    "name": "Break Pad Set",
    "partNumber": "BP-4521-F",
    "category": "Breaking System",
    "subcategory": "Break Pads",
    "brand": "Bosch",
    "price": 65
  },
  {
    "name": "Engine Oil Filter",
    "partNumber": "EOF-3382",
    "category": "Oil Filter",
    "subcategory": "Oil Filter",
    "brand": "Mann Filter",
    "price": 1200
  },
  {
    "name": "Car Battery 12V 60Ah",
    "partNumber": "CB-60-12V",
    "category": "Electrical System",
    "subcategory": "Battery",
    "brand": "Exide",
    "price": 12000
  },
  {
    "name": "Radiator Cooling Fan",
    "partNumber": "RCF-7890",
    "category": "Cooling System",
    "subcategory": "Radiator Fan",
    "brand": "Denso",
    "price": 12000
  },
  {
    "name": "Spark Plug Set (4 pcs)",
    "partNumber": "SP-IR-2244",
    "category": "Ignition System",
    "subcategory": "Spark Plugs",
    "brand": "NGK",
    "price": 2800
  },
  {
    "name": "Spark Plug Set (4 pcs)",
    "partNumber": "SP-IR-22445",
    "category": "Ignition System",
    "subcategory": "Spark Plugs",
    "brand": "NGK",
    "price": 2890
  },
  {
    "name": "Engine Oil Filter",
    "partNumber": "EOF-33822",
    "category": "Engine Components",
    "subcategory": "Oil Filter",
    "brand": "Mann Filter",
    "price": 1299
  },
  {
    "name": "Car Cover",
    "partNumber": "11234",
    "category": "Car Care",
    "subcategory": "Car Cover",
    "brand": "Elora",
    "price": 1200
  }
]


export async function generateAIResponse(prompt) {
    // System prompt defines assistant behavior for laymen car diagnosis
  const SYSTEM_PROMPT = `
You are CarDiagGPT — a smart, expert car diagnostic assistant that helps users identify common vehicle problems quickly and recommends the right spare parts from a given product list.

Your role:
- Begin by asking up to 3–4 simple, focused questions to understand the user's problem (e.g., symptoms, behavior, when it happens).
- Prioritize safety. If you detect a dangerous issue (e.g. smoke, burning smell, brake failure, fuel leak), tell the user to stop using the vehicle and contact emergency help or a tow service immediately.
- Once enough information is gathered, analyze the symptoms and determine the most likely issue using your automotive knowledge.
- Then, select and recommend 1–2 relevant spare parts from the provided product list. Choose only parts that are clearly relevant to the problem.
- For each recommended part, include:
  - The part name
  - A brief reason why it might solve the issue
  - The brand and price
- Explain everything in plain, beginner-friendly language. Define any technical terms briefly if you use them.
- Conclude with what the user should do next: whether they can try something themselves, or if it's time to visit a mechanic.
- Never recommend unnecessary parts. Only suggest what’s needed based on the diagnosis.

You will be provided with a list of available products in a simplified format. Use only these products when making recommendations.

Example Interaction:

User: "My engine cranks but won’t start."
Assistant: "Thanks! Let’s figure this out. 
1. What’s your car’s make, model, and year? 
2. Does the engine try to start or is it completely silent?
3. Are there any warning lights on the dashboard?"

[After answers are received:]

Diagnosis: "This sounds like a possible ignition issue. Based on your description, faulty spark plugs could be the cause."

Recommended Part:
- **Spark Plug Set (4 pcs)** – NGK – Rs. 2800  
  These help ignite fuel in your engine. Worn plugs often cause hard starting or misfiring.

Next Steps: If you're comfortable, you can try replacing the spark plugs yourself. Otherwise, a mechanic can swap them in under an hour.

Keep your tone clear, supportive, and professional at all times.
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
