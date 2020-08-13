# sparse-belief
[![Build Status](https://travis-ci.org/DrPaulBrewer/sparse-belief.svg?branch=master)](https://travis-ci.org/DrPaulBrewer/sparse-belief)
[![Coverage Status](https://coveralls.io/repos/github/DrPaulBrewer/sparse-belief/badge.svg?branch=master)](https://coveralls.io/github/DrPaulBrewer/sparse-belief?branch=master)

```
const { SparseBelief } = require('sparse-belief');

// suppose category k can generate numbers 1,2,...,k uniformly
// then the likehood function for observing x when the category is k is 1/k on k's domain and 0 elsewhere

function likelihood(x,k){
  if ((x>=1) && (x<=k))
    return 1/k;
  return 0;
}

// create a flat prior on categories k=1,2,3,4
const prior = [[1,0.25],[2,0.25],[3,0.25],[4,0.25]];

let sparse = new SparseBelief({prior,likelihood});

// observe an x data value
sparse.observe(1);
// Bayes Law posterior probabilities of categories
sparse.prob(1) // 0.48
sparse.prob(2) // 0.24
sparse.prob(3) // 0.16
sparse.prob(4) // 0.12
```

see tests for more examples

# License: MIT
