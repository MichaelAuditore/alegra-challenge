FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN npm i -g pnpm

RUN pnpm install --frozen-lockfile --prod

COPY . .

EXPOSE 3000

CMD [ "pnpm", "start" ]