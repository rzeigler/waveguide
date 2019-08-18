#!/usr/bin/env bash

rm benchmarks/README.md

for BENCH in benchmarks/*.ts
do
    npx ts-node $BENCH >> benchmarks/README.md
done
