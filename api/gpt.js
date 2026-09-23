export default async function handler(req, res) {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(200).send('Напиши текст после !ai');
  }

  try {
    const response = await Promise.race([
      fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'X-Title': 'Twitch AI Bot'
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages: [
            {
              role: 'system',
              content:
                'Ты короткий бот для Twitch-чата. Отвечай максимально кратко, до 350 символов, без списков и оформления.'
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 150
        })
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout after 4.5s')), 4500)
      )
    ]);

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter error:', response.status, errText);
      return res.status(200).send('Ошибка ИИ.');
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    const safeText = text ? text.slice(0, 350) : 'Ошибка ИИ.';

    return res.status(200).send(safeText);
  } catch (error) {
    console.error('Handler error:', error.message);
    return res.status(200).send('Ошибка ИИ.');
  }
}
