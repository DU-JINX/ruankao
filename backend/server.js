/**
 * @author du
 */

import express from "express";
import pg from "pg";

const { Pool } = pg;

// 创建全局连接池变量
let dbPool = null;

/**
 * 获取数据库连接池
 * 
 * @returns {Pool} pg 数据库连接池实例
 */
function getPool() {
  const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "ruankao_quiz",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  });
  return pool;
}

/**
 * 初始化数据库表结构
 * 
 * @param {Pool} pool pg 连接池
 * @returns {Promise<void>} 无返回值
 */
async function initDatabase(pool) {
  const sql = `
    CREATE TABLE IF NOT EXISTS question_explanations (
      question_id VARCHAR(100) PRIMARY KEY,
      explanation TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(sql);
}

/**
 * 从数据库中查询题目解析
 * 
 * @param {Pool} pool pg 连接池
 * @param {string} questionId 题目ID
 * @returns {Promise<string|null>} 解析文本或空值
 */
async function queryExplanation(pool, questionId) {
  const sql = "SELECT explanation FROM question_explanations WHERE question_id = $1 LIMIT 1";
  const res = await pool.query(sql, [questionId]);
  if (res.rows.length > 0) {
    return res.rows[0].explanation;
  }
  return null;
}

/**
 * 将生成的题目解析存入数据库
 * 
 * @param {Pool} pool pg 连接池
 * @param {string} questionId 题目ID
 * @param {string} explanation 解析文本
 * @returns {Promise<void>} 无返回值
 */
async function saveExplanation(pool, questionId, explanation) {
  const sql = `
    INSERT INTO question_explanations (question_id, explanation) 
    VALUES ($1, $2) 
    ON CONFLICT (question_id) 
    DO UPDATE SET explanation = EXCLUDED.explanation
  `;
  await pool.query(sql, [questionId, explanation]);
}

/**
 * 调用 OpenAI 代理接口生成解析
 * 
 * @param {object} question 题目对象
 * @returns {Promise<string>} 生成的解析 Markdown 文本
 */
async function generateExplanation(question) {
  const proxyUrl = process.env.OPENAI_PROXY_URL || "http://host.docker.internal:8080/v1/chat/completions";
  const apiKey = process.env.OPENAI_API_KEY || "";
  const model = process.env.OPENAI_MODEL || "gpt-5.4";
  
  const optionsText = question.options.map((o) => {
    return `${o.key}. ${o.text}`;
  }).join("\n");
  
  const systemPrompt = "你是一个专业的软考中级软件设计师备考助手。请针对给出的题目提供精炼、信息高密度、直击要点的结构化解析。要求必须以 JSON 格式输出，拒绝任何冗余的废话和长篇大论，选项快析要一针见血（一两句话说清该选项在当前题目下的对错逻辑，不要展开讲解该概念自身的全部理论）。请按以下 JSON 结构返回：\n{\n  \"point\": \"核心考点定位（用一句话概括）\",\n  \"principle\": \"最核心的理论原理解释（控制在 2-3 句话内）\",\n  \"options\": {\n    \"A\": \"选项 A 的对错分析说明（一两句话，直奔核心逻辑）\",\n    \"B\": \"选项 B 的对错分析说明（一两句话，直奔核心逻辑）\",\n    \"C\": \"选项 C 的对错分析说明（一两句话，直奔核心逻辑）\",\n    \"D\": \"选项 D 的对错分析说明（一两句话，直奔核心逻辑）\"\n  },\n  \"avoid\": \"本题容易混淆的地方或避坑速记口诀（一句话）\"\n}";
  const userContent = `题目如下：\n【章节】：${question.sources?.[0]?.subject || "未分类"}\n【题干】：${question.stem}\n【选项】：\n${optionsText}\n【正确答案】：${question.answer || "未提供"}`;
  
  const res = await fetch(proxyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ]
    })
  });
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  
  const data = await res.json();
  const resultText = data.choices?.[0]?.message?.content || "";
  if (!resultText) {
    throw new Error("API 返回了空内容");
  }
  return resultText;
}

/**
 * 路由处理函数：处理 AI 解析请求
 * 
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 * @returns {Promise<void>} 无返回值
 */
async function handleAiExplain(req, res) {
  const { question } = req.body;
  if (!question || !question.id) {
    res.status(400).json({ error: "缺少合法的题目参数" });
    return;
  }
  try {
    const cached = await queryExplanation(dbPool, question.id);
    if (cached) {
      res.json({ explanation: cached, cached: true });
      return;
    }
    const explanation = await generateExplanation(question);
    await saveExplanation(dbPool, question.id, explanation);
    res.json({ explanation: explanation, cached: false });
  } catch (err) {
    res.status(500).json({ error: err.message || "内部服务器错误" });
  }
}

/**
 * 调用 OpenAI 代理接口进行对话解答
 * 
 * @param {object} question 当前题目对象
 * @param {string} explanation 当前已生成的AI解读内容
 * @param {Array} history 历史对话记录
 * @param {string} message 用户发送的新消息
 * @returns {Promise<string>} AI 的解答文本
 */
async function generateChatResponse(question, explanation, history, message) {
  const proxyUrl = process.env.OPENAI_PROXY_URL || "http://host.docker.internal:8080/v1/chat/completions";
  const apiKey = process.env.OPENAI_API_KEY || "";
  const model = process.env.OPENAI_MODEL || "gpt-5.4";
  
  const optionsText = question.options.map((o) => {
    return `${o.key}. ${o.text}`;
  }).join("\n");
  
  const systemPrompt = "你是一个专业的软考中级软件设计师备考助手。用户正在查看一道题目及其AI智能解读，但有些地方不懂，向你发起提问。请结合当前题目、正确答案、AI智能解读以及用户的提问，给出极其精炼、直击要点的解答。绝对不要说废话，控制在3句话以内，尽量用列表或精简文本直奔主题。";
  
  const contextUser = `【当前题目背景】\n【章节】：${question.sources?.[0]?.subject || "未分类"}\n【题干】：${question.stem}\n【选项】：\n${optionsText}\n【正确答案】：${question.answer || "未提供"}\n【AI智能解读】：\n${explanation}`;
  
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: contextUser }
  ];
  
  // 载入历史记录
  if (history && history.length > 0) {
    history.forEach((h) => {
      messages.push({ role: h.role, content: h.content });
    });
  }
  
  // 载入新消息
  messages.push({ role: "user", content: message });
  
  const res = await fetch(proxyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages
    })
  });
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  
  const data = await res.json();
  const resultText = data.choices?.[0]?.message?.content || "";
  if (!resultText) {
    throw new Error("API 返回了空内容");
  }
  return resultText;
}

/**
 * 路由处理函数：处理 AI 对话请求
 * 
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 * @returns {Promise<void>} 无返回值
 */
async function handleAiChat(req, res) {
  const { question, explanation, history, message } = req.body;
  if (!question || !message) {
    res.status(400).json({ error: "缺少必要的参数" });
    return;
  }
  try {
    const response = await generateChatResponse(question, explanation || "", history || [], message);
    res.json({ message: response });
  } catch (err) {
    res.status(500).json({ error: err.message || "内部服务器错误" });
  }
}

/**
 * 启动服务器并初始化连接
 * 
 * @returns {Promise<void>} 无返回值
 */
async function startServer() {
  const app = express();
  app.use(express.json());
  
  // 初始化 pg 数据库池并建表
  dbPool = getPool();
  try {
    await initDatabase(dbPool);
  } catch (dbErr) {
    console.error("数据库初始化失败，将在请求时重试: ", dbErr.message);
  }
  
  // 注册核心路由
  app.post("/api/ai-explain", handleAiExplain);
  app.post("/api/ai-chat", handleAiChat);
  
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`后台服务已启动，正在监听端口: ${port}`);
  });
}

// 执行服务器启动
startServer().catch((err) => {
  console.error("后台服务启动异常: ", err);
});

