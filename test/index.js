/* eslint-env node, mocha */

require('should');
const { normalize, SparseBelief } = require('../index.js');

describe('normalize should throw an Error:', function(){
  it('if sum is negative', function(){
    function bad(){ normalize([[0,-1]]); }
    bad.should.throw();
  });
  it('if sum is infinite', function(){
    function bad(){ normalize([[0,1],[1,Infinity],[2,0.5]]); }
    bad.should.throw();
  });
  it('if sum is non-numeric', function(){
    function bad(){ normalize([[0,'1'],[1,'1']]); }
    bad.should.throw();
  });
  it('if sum is zero', function(){
    function bad(){ normalize([[0,0],[1,0],[2,0]]); }
    bad.should.throw();
  });
});

describe('normalize ', function(){
  it('[[0,1],[1,1],[2,1],[3,1]]=>[[0,.25],[1,.25],[2,.25],[3,.25]]', function(){
    const dist = [[0,1],[1,1],[2,1],[3,1]];
    const normalized = [[0,0.25],[1,0.25],[2,0.25],[3,0.25]];
    normalize(dist).should.deepEqual(normalized);
  });
  it('[[0,0],[1,0.5]]=>[[1,1]]', function(){
    const dist = [[0,0],[1,0.5]];
    const normalized = [[0,0],[1,1]];
    normalize(dist).should.deepEqual(normalized);
  });
});


describe('SparseBelief constructor, normalization, and sorting',function(){
  function likelihood(){
    return 1;
  }
  it('should throw if prior is not an array', function(){
    function bad(){
      const b = new SparseBelief({ // eslint-disable-line no-unused-vars
        prior: {foo:3},
        likelihood
      });
    }
    bad.should.throw();
  });
  it('should throw if prior has a non-array entry', function(){
    function bad(){
      const b = new SparseBelief({ // eslint-disable-line no-unused-vars
        prior: [[1,1],0.5,[3,1]],
        likelihood
      });
    }
    bad.should.throw();
  });
  it('should throw if prior has a non-2-element entry', function(){
    function bad(){
      const b = new SparseBelief({ // eslint-disable-line no-unused-vars
        prior: [[1,1],[2,2,2],[3,1]],
        likelihood
      });
    }
    bad.should.throw();
  });
  it('should throw if prior has a non-numeric probability', function(){
    function bad(){
      const b = new SparseBelief({ // eslint-disable-line no-unused-vars
        prior: [[1,1],[2,'banana'],[3,1]],
        likelihood
      });
    }
    bad.should.throw();
  });
  it('should throw if prior has an infinite probability', function(){
    function bad(){
      const b = new SparseBelief({ // eslint-disable-line no-unused-vars
        prior: [[1,1],[2,+Infinity],[3,1]],
        likelihood
      });
    }
    bad.should.throw();
  });
  it('should throw if prior has a negative probabilitiy', function(){
    function bad(){
      const b = new SparseBelief({ // eslint-disable-line no-unused-vars
        prior: [[1,1],[2,-1],[3,1]],
        likelihood
      });
    }
    bad.should.throw();
  });
  it('should throw if prior is zero everywhere', function(){
    function bad(){
      const b = new SparseBelief({ // eslint-disable-line no-unused-vars
        prior: [[1,0],[2,0],[3,0]],
        likelihood
      });
    }
    bad.should.throw();
  });
  it('should throw if likelihood is not a function', function(){
    function bad(){
      const b = new SparseBelief({ // eslint-disable-line no-unused-vars
        prior: [[1,0.5],[2,0.5]],
        likelihood: 1
      });
    }
    bad.should.throw();
  });
  it('improper prior [1,1],[2,2],[3,1] => [1,1/4],[2,1/2],[3,1/4]', function(){
    const b = new SparseBelief({
      prior: [[1,1],[2,2],[3,1]],
      likelihood
    });
    b.belief.should.deepEqual([[1,0.25],[2,0.5],[3,0.25]]);
  });
  it('sorting [1,0.25],[2,0.5],[3,0.25] => [[2,0.5],...]', function(){
    const b = new SparseBelief({
      prior: [[1,0.25],[2,0.5],[3,0.25]],
      likelihood
    });
    b.sort().belief[0].should.deepEqual([2,0.5]);
  });
});

describe('SparseBelief with uniform likelihood on [1,k] for each k in 1,2,3,4', function(){
  function likelihood(x,k){
    if ((x>=1) && (x<=k))
      return 1/k;
    return 0;
  }
  const prior = [[1,0.25],[2,0.25],[3,0.25],[4,0.25]];
  let sparse = null;
  beforeEach(function(){
    sparse = new SparseBelief({prior,likelihood});
  });
  it('observing 1 => belief 0.48	0.24	0.16	0.12', function(){
    sparse.observe(1);
    sparse.keys().should.deepEqual([1,2,3,4]);
    sparse.prob(0).should.equal(0);
    sparse.prob(1).should.be.approximately(0.48,0.001);
    sparse.prob(2).should.be.approximately(0.24,0.001);
    sparse.prob(3).should.be.approximately(0.16,0.001);
    sparse.prob(4).should.be.approximately(0.12,0.001);
  });
  it('observing 2 => belief 0	0.4615384615	0.3076923077	0.2307692308', function(){
    sparse.observe(2);
    sparse.keys().should.deepEqual([2,3,4]);
    sparse.prob(0).should.equal(0);
    sparse.prob(1).should.equal(0);
    sparse.prob(2).should.be.approximately(0.461538,0.000001);
    sparse.prob(3).should.be.approximately(0.307692,0.000001);
    sparse.prob(4).should.be.approximately(0.230769,0.000001);
  });
  it('observing 3 => belief 0	0	0.5714285714	0.4285714286', function(){
    sparse.observe(3);
    sparse.keys().should.deepEqual([3,4]);
    sparse.prob(0).should.equal(0);
    sparse.prob(1).should.equal(0);
    sparse.prob(2).should.equal(0);
    sparse.prob(3).should.be.approximately(0.571428,0.000001);
    sparse.prob(4).should.be.approximately(0.428571,0.000001);
  });
  it('observing 4 => belief 0 0 0 1', function(){
    sparse.observe(4);
    sparse.keys().should.deepEqual([4]);
    sparse.prob(0).should.equal(0);
    sparse.prob(1).should.equal(0);
    sparse.prob(2).should.equal(0);
    sparse.prob(3).should.equal(0);
    sparse.prob(4).should.equal(1);
  });
});
