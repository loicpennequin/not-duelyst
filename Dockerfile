FROM node:20-alpine as build

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

COPY ./configs ./configs
COPY ./packages/api ./packages/api
COPY ./packages/sdk ./packages/sdk
COPY ./packages/shared ./packages/shared
COPY ./apps/game-server ./apps/game-server

RUN yarn install
RUN yarn workspace @hc/game-server run build

FROM node:20-alpine

WORKDIR /app/apps/game-server

# COPY ./configs ./configs
# COPY ./packages/api ./packages/api
# COPY ./packages/sdk ./packages/sdk
# COPY ./packages/shared ./packages/shared
# COPY /apps/game-server ./apps/game-server

# RUN yarn install --production --frozen-lockfile

COPY --from=build /app/apps/game-server/dist dist

EXPOSE 8080
CMD ["node", "dist/index.js"]
