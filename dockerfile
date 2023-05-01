FROM node:18.12.1

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . ./

EXPOSE 3000 4000

CMD ["npm","start"]