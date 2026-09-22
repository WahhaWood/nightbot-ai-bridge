import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  // Получаем текст от Nightbot
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(200).send('Напиши текст запроса после команды !ai');
  }

  try {
    // Отправляем запрос в бесплатный Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        // Строгая инструкция, чтобы уложиться в лимит длины Nightbot
        systemInstruction: 'Ты короткий бот для чата на стриме. Отвечай максимально кратко (не более 200 символов), с юмором и без лишних форматирований.',
        maxOutputTokens: 100, // Ограничение длины для быстрого ответа (укладываемся в 5 секунд)
      },
    });

    const text = response.text || 'Нейросеть молчит...';

    // Возвращаем чистый текст для Найтбота
    return res.status(200).send(text.trim());
  } catch (error) {
    return res.status(200).send('Ошибка при обращении к ИИ.');
  }
}
