#!/usr/bin/env bash

set -e 

rm -f benchmarks/README.md

for BENCH in benchmarks/*.ts
do
    npx ts-node $BENCH | tee benchmarks/README.md
done
