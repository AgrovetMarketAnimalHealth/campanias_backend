FROM node:22-alpine

# Instalar PHP 8.4 y extensiones necesarias para Wayfinder
RUN apk add --no-cache \
    php84 \
    php84-ctype \
    php84-curl \
    php84-dom \
    php84-fileinfo \
    php84-mbstring \
    php84-openssl \
    php84-pdo \
    php84-pdo_pgsql \
    php84-pgsql \
    php84-session \
    php84-tokenizer \
    php84-xml \
    php84-xmlwriter \
    php84-simplexml \
    php84-phar \
    php84-iconv \
    php84-bcmath \
    php84-intl \
    php84-zip \
    php84-pcntl \
    php84-posix \
    php84-sodium \
    php84-opcache

# Crear enlace simbólico
RUN ln -sf /usr/bin/php84 /usr/bin/php

# Sin límites de subida para PHP CLI
RUN echo "upload_max_filesize = 0" > /etc/php84/conf.d/uploads.ini \
    && echo "post_max_size = 0"        >> /etc/php84/conf.d/uploads.ini \
    && echo "memory_limit = 512M"      >> /etc/php84/conf.d/uploads.ini \
    && echo "max_execution_time = 300" >> /etc/php84/conf.d/uploads.ini \
    && echo "max_input_time = 300"     >> /etc/php84/conf.d/uploads.ini

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Instalar dependencias adicionales
RUN apk add --no-cache \
    git \
    curl \
    zip \
    unzip \
    bash \
    postgresql-client

# Crear directorios necesarios para Laravel
RUN mkdir -p /var/www/storage/framework/{sessions,views,cache} && \
    mkdir -p /var/www/bootstrap/cache && \
    chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Copiar script de entrada
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /var/www
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]