/**
 * @author du
 */

import fs from "fs";
import pg from "pg";

const { Pool } = pg;

// 设置延时辅助函数
const delay = (ms) => {
  return new Promise((resolve) => {
    return setTimeout(resolve, ms);
  });
};

/**
 * 获取数据库连接池
 * 
 * @returns {Pool} pg 数据库连接池实例
 */
function getPool() {
  const pool = new Pool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "ruankao_user",
    password: process.env.DB_PASSWORD || "ruankao_user_pwd",
    database: process.env.DB_NAME || "ruankao_quiz",
    port: parseInt(process.env.DB_PORT || "54321", 10),
    max: 5
  });
  return pool;
}

/**
 * 获取数据库中已存在解析的题目 ID 列表
 * 
 * @param {Pool} pool pg 连接池
 * @returns {Promise<Set<string>>} 已存在 ID 的集合
 */
async function fetchExistingIds(pool) {
  const sql = "SELECT question_id FROM question_explanations";
  const res = await pool.query(sql);
  const ids = res.rows.map((r) => {
    return r.question_id;
  });
  return new Set(ids);
}

/**
 * 将解析结果写入数据库
 * 
 * @param {Pool} pool pg 连接池
 * @param {string} id 题目 ID
 * @param {string} explanation 解析 JSON 字符串
 * @returns {Promise<void>} 无返回值
 */
async function saveExplanation(pool, id, explanation) {
  const sql = `
    INSERT INTO question_explanations (question_id, explanation)
    VALUES ($1, $2)
    ON CONFLICT (question_id)
    DO UPDATE SET explanation = EXCLUDED.explanation
  `;
  await pool.query(sql, [id, explanation]);
}

/**
 * 调用 OpenAI 接口生成解析
 * 
 * @param {object} question 题目对象
 * @returns {Promise<string>} 接口返回的 JSON 字符串
 */
async function generateExplanation(question) {
  const proxyUrl = process.env.OPENAI_PROXY_URL || "http://127.0.0.1:8080/v1/chat/completions";
  const apiKey = process.env.OPENAI_API_KEY || "sk-b2b0547b2049ee833cedf442a26ed258f0be3a6ad581561000da1bc635580dc9";
  const model = process.env.OPENAI_MODEL || "gpt-5.4";
  
  const optionsText = question.options.map((o) => {
    return `${o.key}. ${o.text}`;
  }).join("\n");
  
  const systemPrompt = "你是一个专业的软考中级软件设计师备考助手。请针对给出的题目提供精炼、信息高密度、直击要点的结构化解析。要求必须以 JSON 格式输出，拒绝任何冗余的废话和长篇大论，选项快析要一针见血（一两句话说清该选项在当前题目下的对错逻辑，不要展开讲解该概念自身的全部理论）。请按以下 JSON 结构返回：\n{\n  \"point\": \"核心考点定位（用一句话概括）\",\n  \"principle\": \"最核心的理论原理解释（控制在 2-3 句话内）\",\n  \"options\": {\n    \"A\": \"选项 A 的对错分析说明（一两句话，直奔核心逻辑）\",\n    \"B\": \"选项 B 的对错分析说明（一两句话，直奔核心逻辑）\",\n    \"C\": \"选项 C 的对错分析说明（一两句话，直奔核心逻辑）\",\n    \"D\": \"选项 D 的对错分析说明（一两句话，直奔核心逻辑）\"\n  },\n  \"avoid\": \"本题容易混淆的地方或避坑速记口诀（一句话）\"\n}";
  const userContent = `题目如下：\n【章节】：${question.sources?.[0]?.subject || "未分类"}\n【题干】：${question.stem}\n【选项】：\n${optionsText}\n【正确答案】：${question.answer || "未提供"}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    return controller.abort();
  }, 25000);
  
  try {
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
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const data = await res.json();
    const resultText = data.choices?.[0]?.message?.content || "";
    if (!resultText) {
      throw new Error("API 返回空内容");
    }
    return resultText;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * 循环处理所有需要生成的题目
 * 
 * @param {Pool} pool pg 连接池
 * @param {Array} todoList 需要处理的题目列表
 * @returns {Promise<void>} 无返回值
 */
async function processBatch(pool, todoList) {
  const total = todoList.length;
  console.log(`开始处理待生成的题目列表，共计: ${total} 道题`);
  
  for (let i = 0; i < total; i += 1) {
    const q = todoList[i];
    console.log(`[${i + 1}/${total}] 正在为题目 ID: ${q.id} 生成解析...`);
    try {
      const explanation = await generateExplanation(q);
      await saveExplanation(pool, q.id, explanation);
      console.log(`[${i + 1}/${total}] 题目 ID: ${q.id} 解析已成功存入数据库！`);
    } catch (err) {
      console.error(`[${i + 1}/${total}] 题目 ID: ${q.id} 解析生成失败: ${err.message}`);
    }
    // 控制接口调用频率
    await delay(300);
  }
}

/**
 * 启动批处理任务
 * 
 * @returns {Promise<void>} 无返回值
 */
async function startBatch() {
  const jsonPath = "/root/ruankao/questions.json";
  if (!fs.existsSync(jsonPath)) {
    console.error(`未在路径 ${jsonPath} 找到题库 JSON 文件！`);
    return;
  }
  
  const fileContent = fs.readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(fileContent);
  const questions = data.questions || [];
  
  const pool = getPool();
  const existingIds = await fetchExistingIds(pool);
  
  const todoList = questions.filter((q) => {
    return !existingIds.has(q.id);
  });
  
  if (todoList.length === 0) {
    console.log("题库内所有题目的 AI 解析皆已存在，无需生成！");
    await pool.end();
    return;
  }
  
  await processBatch(pool, todoList);
  await pool.end();
  console.log("批处理任务已顺利全部完成！");
}

// 启动执行脚本
startBatch().catch((err) => {
  console.error("批处理执行中发生严重错误: ", err);
});
