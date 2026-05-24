# @author du

# 进入项目目录
cd /root/ruankao-backend || exit 1

# 停止可能已经运行的后端服务
PID=$(pgrep -f "node server.js")
if [ -n "$PID" ]; then
  echo "正在停止旧的后端进程 PID: $PID"
  kill $PID
  sleep 1
fi

# 设置环境变量并使用 nohup 启动服务
export PORT=3000
export DB_HOST=127.0.0.1
export DB_PORT=54321
export DB_USER=ruankao_user
export DB_PASSWORD=ruankao_user_pwd
export DB_NAME=ruankao_quiz
export OPENAI_PROXY_URL=http://127.0.0.1:8080/v1/chat/completions
export OPENAI_API_KEY=sk-b2b0547b2049ee833cedf442a26ed258f0be3a6ad581561000da1bc635580dc9
export OPENAI_MODEL=gpt-5.4

echo "正在启动后端服务..."
nohup node server.js > server.log 2>&1 &

sleep 2
if pgrep -f "node server.js" > /dev/null; then
  echo "后端服务启动成功！"
else
  echo "后端服务启动失败，请检查 server.log"
fi
