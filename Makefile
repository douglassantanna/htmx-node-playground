# Makefile to run node.js application with nodemon locally and docker

DOCKER_IMAGE_NAME := htmx-node-app
DOCKER_IMAGE_TAG := 20

DOCKER_BUILD := docker build -t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} .
DOCKER_RUN := docker run --rm -p 3000:3000 ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}

.PHONY: start docker build run

start:
	@npx nodemon server.js

docker: build run

build:
	@$(DOCKER_BUILD)

run:
	@$(DOCKER_RUN)
