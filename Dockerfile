ARG APP_ROOT=/opt/app-root/src
ARG BASE_IMAGE=registry.access.redhat.com/ubi8/nodejs-20:latest

#
# Build the app
#
FROM ${BASE_IMAGE} as app

ARG APP_ROOT
ENV NO_UPDATE_NOTIFIER=true

# NPM Permission Fix
RUN mkdir -p $HOME/.npm
ENV NPM_CONFIG_CACHE=$HOME/.npm
RUN chown -R 1001:0 $HOME/.npm

# Build App
COPY app ${APP_ROOT}
#RUN chown -R 1001:0 ${APP_ROOT}
USER 1001
WORKDIR ${APP_ROOT}
RUN npm ci && npm run build

#
# Build the frontend
#
FROM ${BASE_IMAGE} as frontend

ARG APP_ROOT
ENV NO_UPDATE_NOTIFIER=true


# NPM Permission Fix
RUN mkdir -p $HOME/.npm
ENV NPM_CONFIG_CACHE=$HOME/.npm
#RUN chown -R 1001:0 $HOME/.npm

# Build Frontend
COPY frontend ${APP_ROOT}
#RUN chown -R 1001:0 ${APP_ROOT}
USER 1001
WORKDIR ${APP_ROOT}
RUN npm ci

# Figureing out errors
RUN echo "=== Package.json contents ===" && cat package.json
RUN echo "=== Node modules Vue related ===" && ls node_modules | grep vue || echo "No Vue modules found"
RUN echo "=== Build script contents ===" && npm run build --dry-run || echo "Dry run failed"

RUN npm run build -- --no-lint

#
# Create the final container image
#
FROM ${BASE_IMAGE}

ARG APP_ROOT
ENV APP_PORT=8080 \
    NO_UPDATE_NOTIFIER=true

# NPM Permission Fix
RUN mkdir -p $HOME/.npm
ENV NPM_CONFIG_CACHE=$HOME/.npm
#RUN chown -R 1001:0 $HOME/.npm

# Install File Structure
COPY --from=app ${APP_ROOT}/sbin ${APP_ROOT}/sbin
COPY --from=frontend ${APP_ROOT}/dist ${APP_ROOT}/dist
COPY .git ${APP_ROOT}/.git
COPY app/config ${APP_ROOT}/config
COPY app/config ${APP_ROOT}/sbin/config
COPY app/package.json app/package-lock.json ${APP_ROOT}
WORKDIR ${APP_ROOT}

# Install Application
#RUN chown -R 1001:0 ${APP_ROOT}
USER 1001
RUN npm ci --omit=dev

EXPOSE ${APP_PORT}
CMD ["node", "./sbin/bin/www"]
