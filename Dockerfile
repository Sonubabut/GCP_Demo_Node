# Setup Node
FROM node:18-alpine as build

# Dependency and Build
WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Create JS Build
# RUN npm run build

EXPOSE 5000

CMD ["node", "index.ts"]