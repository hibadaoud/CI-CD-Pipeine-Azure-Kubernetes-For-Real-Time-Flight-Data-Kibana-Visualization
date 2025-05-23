FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY frontend/*.html /usr/share/nginx/html/
COPY frontend/*.js /usr/share/nginx/html/
COPY frontend/*.css /usr/share/nginx/html/
COPY frontend/*.png /usr/share/nginx/html/
COPY frontend/*.jpg /usr/share/nginx/html/

COPY frontend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx /usr/share/nginx/html /run

USER nginx

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]

