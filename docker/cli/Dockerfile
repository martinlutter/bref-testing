FROM php:8.1.0-cli

COPY app.ini /usr/local/etc/php/conf.d/app.ini

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN apt-get update && apt-get install -y --no-install-recommends \
    libfreetype6-dev \
    libjpeg-dev \
    libmcrypt-dev \
    libpng-dev \
    libxrender1 \
    libxtst6 \
    libicu-dev \
    libcurl4-openssl-dev \
    libzip-dev \
    curl \
    git \
    zlib1g-dev \
    curl \
    libpcre3-dev \
    awscli \
    libxml2-dev \
    wget \
    libfontconfig1 \
    unzip \
    libonig-dev

RUN docker-php-ext-configure pdo_mysql --with-pdo-mysql=mysqlnd
RUN docker-php-ext-configure mysqli --with-mysqli=mysqlnd
RUN docker-php-ext-configure gd --with-jpeg --with-freetype
RUN docker-php-ext-install pdo_mysql mysqli intl mbstring gd exif zip pcntl soap

# Install redis extension
RUN pecl install redis
RUN docker-php-ext-enable redis

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN mkdir /usr/local/nvm
ENV NVM_DIR /usr/local/nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash \
    && source /usr/local/nvm/nvm.sh \
    && nvm install 16

# Add wkhtmltopdf
RUN wget --progress=bar:force -O wktmp https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/0.12.5/wkhtmltox_0.12.5-1.stretch_amd64.deb
RUN ar p wktmp data.tar.xz | tar xJ --strip-components=4 -C /usr/local/bin/ ./usr/local/bin/
RUN rm wktmp

CMD ["php", "-a"]
