# Backend Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
# We use tsc to compile TypeScript to Javascript in the dist/ folder
RUN npm i typescript -g && tsc

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 5005
ENV NODE_ENV=production
ENV PORT=5005

CMD ["node", "dist/index.js"]
