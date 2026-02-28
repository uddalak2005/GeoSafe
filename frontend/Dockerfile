FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache bash

FROM base AS dev
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
