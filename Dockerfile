# Build stage
FROM node:22 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy rest of the frontend
COPY . ./

RUN npm run build

# Production stage
FROM node:22-slim

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

RUN npm install --production

EXPOSE 4173

CMD ["npm","run", "preview"]
