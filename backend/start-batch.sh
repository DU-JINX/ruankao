# @author du

# 进入项目目录
cd /root/ruankao-backend || exit 1

# 停止正在运行的批处理任务进程（如果有）
PID=$(pgrep -f "node batch-generate.js")
if [ -n "$PID" ]; then
  echo "正在停止旧的批处理进程 PID: $PID"
  kill $PID
  sleep 1
fi

# 设置环境变量并使用 nohup 启动服务
export DB_HOST=127.0.0.1
export DB_PORT=54321
export DB_USER=ruankao_user
export DB_PASSWORD=ruankao_user_pwd
export DB_NAME=ruankao_quiz
export OPENAI_PROXY_URL=http://127.0.0.1:8080/v1/chat/completions
export OPENAI_API_KEY=sk-b2b0547b2049ee833cedf442a26ed258f0be3a6ad581561000da1bc635580dc9
export OPENAI_MODEL=gpt-5.4

echo "正在后台启动 AI 批量解析任务..."
nohup node batch-generate.js > batch.log 2>&1 &

sleep 2
if pgrep -f "node batch-generate.js" > /dev/null; then
  echo "AI 批量解析任务已成功在后台运行！"
  echo "您可以使用 'tail -f /root/ruankao-backend/batch.log' 命令监控生成进度。"
else
  echo "AI 批量解析任务启动失败，请检查 /root/ruankao-backend/batch.log"
fi
