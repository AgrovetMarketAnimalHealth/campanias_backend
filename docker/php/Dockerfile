FROM php:8.4-fpm-alpine

WORKDIR /var/www

# Instalar dependencias necesarias
RUN apk add --no-cache \
    postgresql-client \
    msmtp \
    perl \
    wget \
    procps \
    shadow \
    libzip \
    libpng \
    libjpeg-turbo \
    libwebp \
    freetype \
    icu \
    postgresql-dev \
    git \
    curl \
    zip \
    unzip \
    nodejs \
    npm && \
    apk add --no-cache --virtual build-deps \
    icu-dev \
    icu-libs \
    zlib-dev \
    g++ \
    make \
    automake \
    autoconf \
    libzip-dev \
    libpng-dev \
    libwebp-dev \
    libjpeg-turbo-dev \
    freetype-dev && \
    docker-php-ext-configure gd --enable-gd --with-freetype --with-jpeg --with-webp && \
    docker-php-ext-install \
    gd \
    pdo_pgsql \
    pgsql \
    intl \
    bcmath \
    opcache \
    exif \
    zip \
    pcntl && \
    apk del build-deps && rm -rf /usr/src/php*

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Crear usuario para la aplicación
RUN addgroup -g 1000 -S www && \
    adduser -u 1000 -S www -G www

# Crear directorios necesarios
RUN mkdir -p /var/www/storage/framework/{sessions,views,cache} && \
    mkdir -p /var/www/bootstrap/cache && \
    chown -R www:www /var/www && \
    chmod -R 775 /var/www/storage /var/www/bootstrap/cache

USER www

EXPOSE 9000

CMD ["php-fpm"]