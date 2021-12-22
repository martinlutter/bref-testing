FROM php:8.1.0-fpm as builder

COPY app.ini /usr/local/etc/php/conf.d/app.ini
COPY app.pool.conf /usr/local/etc/php/pool.d/app.pool.conf

RUN mkdir -p /usr/share/man/man1

RUN apt-get update && apt-get install -y --no-install-recommends \
    libfreetype6-dev \
    libjpeg-dev \
    libmcrypt-dev \
    libpng-dev \
    libxrender1 \
    libxtst6 \
    libicu-dev \
    libcurl4-openssl-dev \
    curl \
    git \
    default-jre \
    libpcre3-dev \
    libxml2-dev \
    wget \
    libonig-dev \
    libzip-dev \
    unzip

RUN docker-php-ext-configure gd --with-jpeg --with-freetype
RUN docker-php-ext-configure pdo_mysql --with-pdo-mysql=mysqlnd
RUN docker-php-ext-configure mysqli --with-mysqli=mysqlnd
RUN docker-php-ext-install pdo_mysql mysqli intl mbstring exif gd opcache soap zip

# Install redis extension
RUN pecl install redis
RUN docker-php-ext-enable redis

# Add wkhtmltopdf
RUN wget --progress=bar:force -O wktmp https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/0.12.5/wkhtmltox_0.12.5-1.stretch_amd64.deb
RUN ar p wktmp data.tar.xz | tar xJ --strip-components=4 -C /usr/local/bin/ ./usr/local/bin/
RUN rm wktmp

CMD ["php-fpm"]


FROM builder as dev

COPY app_dev.ini /usr/local/etc/php/conf.d/app.ini

# Configure xdebug
RUN pecl install --force xdebug
RUN docker-php-ext-enable xdebug
COPY ext-xdebug.ini /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini
