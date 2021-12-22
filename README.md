# Bref testing
## Install
- docker-compose up -d
- from cli -> `composer install && npm install && ./node_modules/.bin/encore dev`
## Use
`dev.bref`
## Deployment
- npm install -g serverless
- add `bref-testing` aws profile
- from cli -> `bin/console c:w --env=prod && ./node_modules/.bin/encore production`
- from `project/` -> `serverless deploy`
## Running commands on lambda
- from cli -> `AWS_DEFAULT_REGION=eu-central-1 AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=xxx ./vendor/bin/bref cli symfony-dev-console -- `
