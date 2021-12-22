FROM nginx:1.16.0

ARG ENV
ARG DOMAIN

# Install nginx-extras
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx-extras

# Remove default nginx site configuration.
RUN rm -rf /etc/nginx/conf.d/default.conf

# Add nginx proxy configuration.
COPY $ENV.conf /etc/nginx/conf.d/proxy.conf

# Add nginx custom config
COPY nginx.conf /etc/nginx/nginx.conf
RUN mkdir /etc/nginx/conf.d/base
COPY base_$ENV.conf /etc/nginx/conf.d/base/base.conf

# Replace domain in virtual host
RUN sed -i "s/{domain}/$DOMAIN/g" /etc/nginx/conf.d/proxy.conf
RUN sed -i "s/{domain}/$DOMAIN/g" /etc/nginx/conf.d/base/base.conf
CMD cat /etc/nginx/conf.d/proxy.conf

# Run nginx in foreground.
CMD ["nginx", "-g", "daemon off;"]
