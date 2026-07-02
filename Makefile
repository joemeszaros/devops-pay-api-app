install:
	npm install

lint:
	npm run lint

test:
	npm test

build:
	npm run build

run:
	npm run dev

docker-build:
	docker build -t pay-api-app:local .
