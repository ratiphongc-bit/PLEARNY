FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-venv \
  && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/plearny-venv
ENV PATH="/opt/plearny-venv/bin:${PATH}" \
    PYTHONUNBUFFERED=1 \
    NODE_ENV=production

COPY package.json package-lock.json ./
# Tailwind/PostCSS build tooling is declared in devDependencies.
RUN npm ci --include=dev

COPY requirements.txt ./requirements.txt
RUN python3 -m pip install --no-cache-dir --disable-pip-version-check -r requirements.txt

COPY . ./
RUN npm run build

EXPOSE 3000
CMD ["node", "scripts/run-prod.mjs"]
