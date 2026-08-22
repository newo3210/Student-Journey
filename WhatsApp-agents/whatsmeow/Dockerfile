# Go 1.26 slim - WhatsMeow Level 1 bot (default binary links live client; pairing is interactive).
FROM golang:1.26-bookworm AS build

WORKDIR /src
COPY go.mod go.sum ./
COPY . .
RUN go test ./...
RUN CGO_ENABLED=0 go build -o /out/whatsmeow-agent ./cmd/whatsmeow-agent

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=build /out/whatsmeow-agent /app/whatsmeow-agent
ENV GO_ENV=production
EXPOSE 3004
CMD ["/app/whatsmeow-agent"]
