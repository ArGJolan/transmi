FROM node:12-alpine

ENV NODE_ENV=prod

RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY ./package.json /opt/app
RUN npm install --production
COPY . /opt/app


RUN npm run build-web

CMD ["sh", "-c", "npm start"]
