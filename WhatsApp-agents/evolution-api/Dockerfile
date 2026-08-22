# Node 22 slim - run the Evolution Level 1 bot with tsx.
FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json vitest.config.ts ./
COPY src ./src

ENV NODE_ENV=production
EXPOSE 3001

CMD ["npx", "tsx", "src/index.ts"]
