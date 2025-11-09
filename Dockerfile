# Frontend build stage
FROM node:lts-alpine AS frontend
WORKDIR /frontend-build
COPY web/package.json web/package-lock.json ./
RUN npm install
COPY web/ .
RUN npm run build

# Backend build stage
FROM golang:1.25.3-alpine AS backend
WORKDIR /backend-build
RUN apk --no-cache add git build-base
ENV GOPROXY=direct
COPY go.mod go.sum ./
ENV GOCACHE=/go-cache
ENV GOMODCACHE=/gomod-cache
COPY  . . 

## remove the existing dummy ui and replace with react build
COPY --from=frontend /frontend-build/dist /backend-build/server/router/frontend/dist
RUN --mount=type=cache,target=/gomod-cache --mount=type=cache,target=/go-cache \
	CGO_ENABLED=1 go build -o /backend-build/linkshort ./cmd/api/main.go

FROM alpine:latest AS runtime
WORKDIR /app
COPY --from=backend /backend-build/migrations /app/migrations
RUN apk add --no-cache tzdata
ENV TZ="UTC"
COPY --from=backend /backend-build/linkshort /app/linkshort
ENTRYPOINT [ "/app/linkshort" ]
CMD [ "--env", "production" ]
