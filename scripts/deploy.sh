#!/bin/bash

cd api
npm ci --omit dev
npm run build
cp -r ./node_modules ./dist/

cd ..
npx cdk deploy