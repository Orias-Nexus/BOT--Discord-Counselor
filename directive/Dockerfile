FROM node:20-alpine
WORKDIR /app
COPY directive/package*.json ./
RUN npm install --production
COPY directive/src ./src
COPY assets ./assets
ENV NODE_ENV=production
CMD ["npm", "start"]
