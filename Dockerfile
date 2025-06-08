FROM python:3

RUN \
  apt-get update && \
  DEBIAN_FRONTEND=noninteractive \
    apt-get install -y \
      ffmpeg \
      libgirepository1.0-dev \
      pulseaudio-utils \
  && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/

RUN pip install --no-cache youtube-dl

WORKDIR /usr/src/mkchromecast/

COPY requirements.txt .
RUN pip install --no-cache -r requirements.txt

COPY . .
RUN pip install --no-cache .

ENTRYPOINT [ "mkchromecast" ]
