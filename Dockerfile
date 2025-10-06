FROM oven/bun:1
WORKDIR /app
# Copy package files
COPY package.json bun.lock ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/
 
# Copy source code
COPY . .
 
# Install dependenciesdocker run -d -p 3000:3000
RUN bun install
 
# Build for single origin
RUN bun run build:single

# Install LiteFS dependencies:
RUN apt-get update -y && apt-get install -y ca-certificates fuse3 sqlite3
COPY --from=flyio/litefs:0.5 /usr/local/bin/litefs /usr/local/bin/litefs
ENTRYPOINT litefs mount
 
EXPOSE 3000
CMD ["bun", "run", "start:single"]