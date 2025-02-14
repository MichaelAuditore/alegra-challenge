FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN npm i -g pnpm

RUN pnpm install --frozen-lockfile --prod

COPY . .

EXPOSE 3001

CMD [ "pnpm", "start" ]