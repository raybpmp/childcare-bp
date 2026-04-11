# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
# Service account needs to be in the root for our path logic
COPY service-account.json .

# Default Environment Variables
ENV PORT=4100
ENV NODE_ENV=production

EXPOSE 4100

CMD ["node", "dist/index.js"]
