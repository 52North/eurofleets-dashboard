FROM node:12-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:prod

FROM nginx:1.17.8-alpine
COPY nginx/default.conf /etc/nginx/conf.d
COPY --from=builder /app/dist/eurofleets-dashboard /usr/share/nginx/html
CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/config/config.template.json > /usr/share/nginx/html/assets/config/config.prod.json && exec nginx -g 'daemon off;'"]
# the container can be started like this: docker run -p 80:80 -e PORT=80 mviz-demonstrator
# CMD sed -i -e 's/$PORT/'"$PORT"'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'