const { Anthropic } = require("@anthropic-ai/sdk");

exports.handler = async (event, context) => {
  // Sadece POST isteklerine izin veriyoruz
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Yöntem İzin Verilmedi" };
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const body = JSON.parse(event.body);
    const userText = body.text;
    const userStyle = body.style || "Sıcak & Kişisel";

    // Claude modeline gönderilecek kurumsal talimat
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [
        { 
          role: "user", 
          content: `Sen usta bir edebiyat editörü ve yazarsın. Sana verilen aşağıdaki ham anlatıyı veya konuşma metnini, yapısını bozmadan, ruhunu koruyarak, son derece akıcı, profesyonel, sürükleyici ve "${userStyle}" bir edebi dille yeniden kaleme al. Doğrudan kitaba basılacak sonuç metnini ver, başında veya sonunda açıklama yazma.\n\nHam Metin:\n"${userText}"` 
        }
      ],
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result: response.content[0].text }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
