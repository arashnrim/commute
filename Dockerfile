FROM node:18

# Copies files
WORKDIR /app
COPY . .

# Sets up pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Installs dependencies
RUN pnpm install

# Runs the app
ENTRYPOINT pnpm start