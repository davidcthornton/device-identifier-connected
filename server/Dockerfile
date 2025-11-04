FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
# If you transpile TypeScript, add a build stage and copy dist/ instead.
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
