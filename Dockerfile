FROM node:20-alpine
WORKDIR /app

# Copy package files and the project so Prisma schema is available during postinstall
COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY . .

# Install dependencies (full install needed for `next build`), with a fallback
RUN npm ci --unsafe-perm || npm install --unsafe-perm

# Ensure Prisma client is generated (postinstall may also run this)
RUN npx prisma generate

# Build the Next app for production
RUN npm run build

ENV PORT=3001
EXPOSE 3001

CMD ["npm", "run", "start"]
