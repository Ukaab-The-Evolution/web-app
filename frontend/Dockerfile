# Dockerfile for development mode
FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
RUN npm install react-router-dom@^7.6.3


COPY . .

EXPOSE 3000
CMD ["npm", "start"]

