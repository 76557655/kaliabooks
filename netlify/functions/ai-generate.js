const { GoogleGenAI } = require("@google/genai");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Yöntem İzin Verilmedi" };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const body = JSON.parse(event.body);
    const userText = body.text;
    const userStyle = body.style || "Sıcak & Kişisel";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Sen usta bir edebiyat editörü ve yazarsın. Sana verilen aşağıdaki ham anlatıyı veya konuşma metnini, yapısını bozmadan, ruhunu koruyarak, son derece akıcı, profesyonel, sürükleyici ve "${userStyle}" bir edebi dille yeniden kaleme al. Doğrudan kitaba basılacak sonuç metnini ver, başında veya sonunda açıklama yazma.\n\nHam Metin:\n"${userText}"`,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result: response.text }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
