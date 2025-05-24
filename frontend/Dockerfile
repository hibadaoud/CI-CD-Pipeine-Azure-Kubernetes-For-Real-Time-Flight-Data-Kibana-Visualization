FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY *.html /usr/share/nginx/html/
COPY *.js /usr/share/nginx/html/
COPY *.css /usr/share/nginx/html/
COPY *.png /usr/share/nginx/html/
COPY *.jpg /usr/share/nginx/html/

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx /usr/share/nginx/html /run

USER nginx

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]

