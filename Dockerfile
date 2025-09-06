# 1단계: 빌드
FROM node:22-alpine AS builder

WORKDIR /deploy

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# 2단계: 런타임
FROM node:22-alpine

WORKDIR /deploy

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /deploy/public ./public
COPY --from=builder /deploy/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
