const FREE_MODELS = [
  'qwen/qwen3.8-27b:free',
  'liquid/lfm-2.5-embedding-350m:free',
  'dots-studio/dots-3-note-preview:free',
  'openrouter/free'
];

export default async function handler(req, res) {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(200).send('Напиши текст после !ai');
  }

  const messages = [
    {
      role: 'system',
      content:
        'Ты короткий бот для Twitch-чата. Отвечай максимально кратко, до 350 символов, без списков и оформления.'
    },
    { role: 'user', content: prompt }
  ];

  let lastError = '';

  for (const model of FREE_MODELS) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://your-site-or-repo-url.example',
          'X-Title': 'Twitch AI Bot'
        },
        body: JSON.stringify({ model, messages, max_tokens: 200 })
      });

      if (!response.ok) {
        const errText = await response.text();
        lastError = `Ошибка ${response.status} (${model}): ${errText.slice(0, 200)}`;
        console.error(lastError);
        continue; // пробуем следующую модель
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return res.status(200).send(text);

      lastError = `Пустой ответ от ${model}`;
    } catch (error) {
      lastError = `Ошибка сети (${model}): ${error.message}`;
      console.error(lastError);
    }
  }

  // если все модели из списка не сработали
  return res.status(200).send(lastError || 'Ошибка ИИ.');
}
