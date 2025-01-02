# 构建阶段
FROM node:18-alpine as builder

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 直接在构建时写入环境变量
ENV VITE_APP_PASSWORD=freestargpt
ENV VITE_DEEPSEEK_API_KEY=sk-506f19b1b60e4b068ee4f2b1f288986f

# 构建应用
RUN npm run build

# 运行阶段
FROM nginx:alpine

# 复制构建产物到 Nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 添加启动脚本
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 1006

ENTRYPOINT ["/docker-entrypoint.sh"] 