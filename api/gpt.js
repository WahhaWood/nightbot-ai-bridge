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
    const completion = await openai.chat.completions.create({
      model: 'poolside/laguna-xs-2.1',
      messages: [
        {
          role: 'system',
          content:
            'Ты короткий бот для Twitch-чата. Отвечай максимально кратко, до 350 символов, без списков и оформления.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 1,
      top_p: 0.95,
      max_tokens: 300,
      stream: false
    });

    const text = completion.choices[0]?.message?.content?.trim();
    const safeText = text ? text.slice(0, 350) : 'Ошибка ИИ.';

    return res.status(200).send(safeText);
  } catch (error) {
    console.error(error);
    return res.status(200).send('Ошибка ИИ.');
  }
}
