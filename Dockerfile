FROM node:latest

# Crea e imposta la directory di lavoro
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Installa nodemon
RUN npm install -g nodemon

# Copia i file di dipendenze
COPY ./app/package.json /usr/src/app/
RUN npm install

# Copia il codice sorgente
COPY ./app /usr/src/app

# Espone la porta 3000 per il backend
EXPOSE 3000

