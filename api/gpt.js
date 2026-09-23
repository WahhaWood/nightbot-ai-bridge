import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1'
});

export default async function handler(req, res) {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(200).send('Напиши текст после !ai');
  }

  try {
    const completion = await Promise.race([
      openai.chat.completions.create({
        model: 'nvidia/nvidia-nemotron-nano-9b-v2',
        messages: [
          {
            role: 'system',
            content:
              'detailed thinking off\nТы короткий бот для Twitch-чата. Отвечай максимально кратко, до 350 символов, без списков и оформления.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 150,
        stream: false
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout after 4.5s')), 4500)
      )
    ]);

    const text = completion.choices[0]?.message?.content?.trim();
    const safeText = text ? text.slice(0, 350) : 'Пустой ответ от модели.';

    return res.status(200).send(safeText);
  } catch (error) {
    console.error('Handler error:', error.message);
    return res.status(200).send('Ошибка ИИ.');
  }
}
