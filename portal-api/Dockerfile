# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
# Service account needs to be in the root for our path logic
COPY service-account.json .

# Default Environment Variables (Overridden by .env or compose)
ENV PORT=4000
ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "dist/index.js"]
