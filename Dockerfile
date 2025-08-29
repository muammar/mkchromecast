# syntax=docker/dockerfile:1
FROM python:3.13-slim

ARG DEBIAN_FRONTEND=noninteractive
RUN \
  --mount=type=cache,target=/var/cache/apt,sharing=locked \
  --mount=type=cache,target=/var/lib/apt,sharing=locked \
  apt-get update && \
  apt-get install --yes --no-install-recommends \
    ffmpeg \
    libgirepository-2.0 \
    pulseaudio-utils \
  && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/

RUN --mount=type=cache,mode=0755,target=/root/.cache/pip/ \
  pip install --compile yt-dlp

WORKDIR /usr/src/mkchromecast/

COPY requirements.txt .
RUN --mount=type=cache,mode=0755,target=/root/.cache/pip/ \
  pip install --compile -r requirements.txt

COPY . .
RUN --mount=type=cache,mode=0755,target=/root/.cache/pip/ \
  pip install --compile .

ENTRYPOINT [ "mkchromecast" ]
