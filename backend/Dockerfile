FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci && npm prune --omit=dev
COPY src ./src
ENV NODE_ENV=production
EXPOSE 4000
CMD ["npm", "start"]
