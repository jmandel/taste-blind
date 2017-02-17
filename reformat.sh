for t in src/app/**/*.ts; do echo $t;  ./node_modules/.bin/tsfmt -r $t; done
