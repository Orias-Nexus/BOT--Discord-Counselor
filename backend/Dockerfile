FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci && npm prune --omit=dev
COPY src ./src
COPY assets ./assets
ENV NODE_ENV=production
EXPOSE 4000
CMD ["npm", "start"]
