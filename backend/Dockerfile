# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Expose port (match your app’s port)
EXPOSE 3000

# Start compiled app
CMD ["node", "index.js"]