FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
ENV CI=true
RUN npm ci


COPY . .

EXPOSE 3000
CMD ["npm", "start"]
