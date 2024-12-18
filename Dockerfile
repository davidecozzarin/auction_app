FROM node:latest

# Crea e imposta la directory di lavoro
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Installa nodemon 
RUN npm install -g nodemon

# Copia solo il package.json per installare le dipendenze
COPY ./app/package.json /usr/src/app/
RUN npm install

# Copia il codice sorgente dopo aver installato le dipendenze
COPY ./app /usr/src/app

# Espone la porta 3000 per il backend
EXPOSE 3000

# Comando di avvio
CMD ["nodemon", "app.js"]
