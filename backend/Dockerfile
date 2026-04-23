FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY backend/package*.json ./
COPY backend/prisma ./prisma
RUN npm ci && npm prune --omit=dev
COPY backend/src ./src
COPY assets ./assets
ENV NODE_ENV=production
EXPOSE 4000
CMD ["npm", "start"]
