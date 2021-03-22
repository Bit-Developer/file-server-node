# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
# https://medium.com/@VincentSchoener/development-of-nodejs-application-with-docker-and-typescript-part-2-4dd51c1e7766
#
# Builder stage.
# This state compile our TypeScript to get the JavaScript code
#
FROM node:15.12.0 AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY start-config-prod.ts ./
COPY ./src ./src

# environment variables for env.config.ts
ENV PORT=80
ENV ROOT_DIR='/app/root'
ENV WEB_ROOT='/app/web'
ENV EDIT_MODE='false'
RUN npm ci --quiet && npm run build-prod

#
# Production stage.
# This state compile get back the JavaScript code from builder stage
# It will also install the production package only
#
FROM node:15.12.0-alpine

# volume when creating container for serving the file directory
RUN mkdir -p /app/root
RUN mkdir -p /app/web

WORKDIR /app

# environment variables for env.config.ts
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --quiet --only=production

## We just need the build to execute the command
COPY --from=builder /usr/src/app ./build

EXPOSE 9000
CMD [ "node", "build/dist/src/server.js" ]