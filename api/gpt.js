import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req, res) {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(200).send('Напиши текст запроса после команды !ai');
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: 'Ты короткий бот для чата на стриме. Отвечай максимально кратко (до 200 символов), с юмором, без списков и без оформления.',
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    const text = result.response.text();
    return res.status(200).send(text.trim());
  } catch (error) {
    return res.status(200).send('Ошибка при обращении к ИИ.');
  }
}
