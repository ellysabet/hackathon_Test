import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 오직 POST 요청만 허용
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { category } = req.body;

  if (!category) {
    return res.status(400).json({ error: "카테고리를 입력해주세요." });
  }

  try {
    // Vercel 환경변수에서 API 키를 읽어옵니다.
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // JSON 형태로 안정적인 응답을 받기 위해 gemini-1.5-flash 모델 사용
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      사용자가 '${category}'라는 카테고리를 입력했습니다. 
      이 카테고리와 관련된 일상적이거나 구체적인 행동 중 하나를 무작위로 선택하세요.
      그리고 그 일이 완료되어야 하는 묘하게 초조한 기한(예: "오늘 밤 11시 59분 전까지", "앞으로 딱 45분 내로")을 정해주세요.
      
      반드시 아래 JSON 스키마에 맞춰서 응답해주세요:
      {
        "task": "할 일 내용",
        "deadline": "기한 내용"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const data = JSON.parse(responseText);

    return res.status(200).json(data);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: "뭔가 잘못되었습니다... 빨리 다시 시도하세요." });
  }
}
