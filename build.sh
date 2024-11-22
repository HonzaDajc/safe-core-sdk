yarn && yarn build
cd packages/protocol-kit
rm -rf node_modules
yarn && yarn build
cd ../api-kit
rm -rf node_modules
yarn && yarn build
cd ../auth-kit
rm -rf node_modules
yarn && yarn build
cd ../onramp-kit
rm -rf node_modules
yarn && yarn build
cd ../relay-kit
rm -rf node_modules
yarn && yarn build
cd ../account-abstraction-kit
rm -rf node_modules
yarn && yarn build
cd ../..