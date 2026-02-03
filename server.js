 const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// ⚠️ ضع مفتاحك هنا
const openai = new OpenAI({
  apiKey: "sk-proj-PUT_YOUR_REAL_KEY_HERE",
});

app.post("/api/story", async (req, res) => {
  console.log("Generating story...");
  try {
    const { idea } = req.body;
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "أنت كاتب قصص عربي ماهر." },
        { role: "user", content: `اكتب قصة عن: ${idea}` },
      ],
      model: "gpt-3.5-turbo",
    });
    res.json({ story: completion.choices[0].message.content });
    console.log("Story done.");
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/image", async (req, res) => {
  console.log("Generating image...");
  try {
    const { prompt, style } = req.body;
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${style} style: ${prompt}`,
      n: 1,
      size: "1024x1024",
    });
    res.json({ image: response.data[0].url });
    console.log("Image done.");
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log("🚀 Server running on port 3001");
});