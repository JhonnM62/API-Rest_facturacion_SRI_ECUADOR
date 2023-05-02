FROM node:18-bullseye as bot
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 3000 4000
CMD ["npm", "start"]