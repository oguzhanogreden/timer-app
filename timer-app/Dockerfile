FROM node:17.0.1-bullseye

RUN mkdir -p /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY ./ /usr/src/app

WORKDIR /usr/src/app
RUN npm install
# RUN rm -f /usr/src/.npmrc

COPY src/ /usr/src/app

RUN ionic build --prod -- --output-path /usr/src/app/www

CMD http-server -p 8080 -c-1 /usr/src/app/www