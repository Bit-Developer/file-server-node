#
# Builder stage.
# This state compile our TypeScript to get the JavaScript code
#
FROM node:15.12.0 AS builder

WORKDIR /app

COPY package*.json tsconfig*.json start-config-prod.ts ./
COPY ./src ./src

# environment variables for env.config.ts
ENV PORT=80 \
    ROOT_DIR='/app/root' \
    WEB_ROOT='/app/web' \
    EDIT_MODE='false'

RUN npm ci --quiet && npm run build-prod

#
# Production stage.
# This state compile get back the JavaScript code from builder stage
# It will also install the production package only
#
FROM node:15.12.0-alpine

# volume when creating container for serving the file directory
RUN mkdir -p /app/root && mkdir -p /app/web

WORKDIR /app

# environment variables for env.config.ts
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --quiet --only=production

## We just need the build to execute the command
COPY --from=builder /app ./build

CMD [ "node", "build/dist/src/server.js" ]