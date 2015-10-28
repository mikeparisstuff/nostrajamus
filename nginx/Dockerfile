FROM nginx
RUN rm /etc/nginx/nginx.conf
RUN mkdir /logs/
RUN touch /logs/nginx-access.log
RUN touch /logs/nginx-error.log
ADD nginx.conf /etc/nginx/