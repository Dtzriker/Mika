
'use server';

/**
 * @fileOverview Utility for calling OpenRouter as a fallback AI provider.
 */

export async function openRouterFallback<T>(prompt: string, schema: any): Promise<T | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("OpenRouter API Key not found in environment variables.");
    return null;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://everything-ai-prototype.local",
        "X-Title": "Everything AI Prototype",
      },
      body: JSON.stringify({
        "model": "meta-llama/llama-3.1-8b-instruct:free",
        "messages": [
          { 
            "role": "system", 
            "content": `You are 'Everything', an advanced AI desktop operating layer. 
            Analyze the user's command and generate structured output matching the requested schema.
            If the schema requires coordinates, provide them as percentages (0-100) based on a standard desktop screen.
            If the task involves writing text (like in Notepad), you MUST generate the actual content and include it in a 'type' action step with the full text in the 'value' field.
            Respond ONLY with a valid JSON object matching this schema: ${JSON.stringify(schema)}` 
          },
          { "role": "user", "content": prompt }
        ],
        "response_format": { "type": "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", errorText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) return null;
    
    // Clean up content if it's wrapped in markdown blocks
    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson) as T;
  } catch (e) {
    console.error("OpenRouter Fallback Exception:", e);
    return null;
  }
}
