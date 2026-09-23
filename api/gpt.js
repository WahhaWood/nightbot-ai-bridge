import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(200).send('Напиши текст после !ai');
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      systemInstruction:
        'Ты короткий бот для Twitch-чата. Отвечай максимально кратко, до 399 символов, без списков и оформления.'
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.status(200).send(text.trim());
  } catch (error) {
    console.error(error);
    return res.status(200).send('Ошибка ИИ.');
  }
}
