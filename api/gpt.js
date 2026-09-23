export default async function handler(req, res) {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(200).send('Напиши текст после !ai');
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'X-Title': 'Twitch AI Bot'
      },
      body: JSON.stringify({
        model: 'z-ai/glm-5.2:free',
        messages: [
          {
            role: 'system',
            content:
              'Ты короткий бот для Twitch-чата. Отвечай максимально кратко, до 350 символов, без списков и оформления.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter error:', response.status, errText);
      // ВРЕМЕННО для теста — выводим саму ошибку в чат
      return res.status(200).send(`Ошибка ${response.status}: ${errText.slice(0, 300)}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    return res.status(200).send(text || 'Пустой ответ от модели.');
  } catch (error) {
    console.error(error);
    // ВРЕМЕННО для теста
    return res.status(200).send(`Ошибка: ${error.message}`);
  }
}
