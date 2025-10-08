FROM oven/bun:1
WORKDIR /app
# Copy package files
COPY package.json bun.lock ./
COPY waitlist/package.json ./waitlist/
COPY server/package.json ./server/
COPY shared/package.json ./shared/
 
# Copy source code
COPY . .

# Install dependenciesdocker run -d -p 3000:3000
RUN bun install
 
# Build for single origin
RUN bun run build:single

EXPOSE 3000
CMD ["bun", "run", "start:single"]