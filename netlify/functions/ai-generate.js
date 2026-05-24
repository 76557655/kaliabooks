
const { GoogleGenAI } = require('@google/genai');

// Netlify'ın tam olarak aradığı ve "bulamadım" dediği ana kapı (handler) burasıdır:
exports.handler = async function(event, context) {
  // Sadece POST isteklerine izin veriyoruz
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Ön yüzden gelen ham hikaye metnini alıyoruz
    const body = JSON.parse(event.body || '{}');
    const userText = body.text || '';
    const bookStyle = body.style || 'Sıcak & Kişisel';

    // Güvenli kasaya kilitlediğimiz Google Gemini şifresini çağırıyoruz
    const aiKey = process.env.GEMINI_API_KEY;
    if (!aiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API anahtari sistemde bulunamadi.' })
      };
    }

    const ai = new GoogleGenAI({ apiKey: aiKey });

    // Yapay zekaya imla hatalarını düzeltmesi için kurumsal redaktör emrini veriyoruz
    const sistemEmri = `Sen ödüllü bir editör ve redaktörsün. Sana verilen ham metindeki tüm yazım hatalarını, harf yutmalarını ve imla eksikliklerini kusursuzca düzelt. Ardından bu içeriği akıcı, asil, edebi ve "${bookStyle}" tarzında bir kitap bölümüne dönüştür. Doğrudan oluşturulan hikayeyi döndür, ekstra açıklama yazma.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [sistemEmri + "\n\nHam Metin: " + userText],
    });

    const aiResult = response.text || 'Metin olusturulamadi.';

    // Ön yüze tam aradığı formatta tertemiz cevabı fırlatıyoruz
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: aiResult })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
