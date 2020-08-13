// dist = [[k1, prob1],[k2, prob2],[k3,prob3],...]

function probSum(dist){
  let sum=0.0;
  for(let i=0,l=dist.length;i<l;++i)
    sum += dist[i][1];
  return sum;
}

function byProb(a,b){
  return b[1]-a[1];
}

function normalize(dist){
  const sum = probSum(dist);
  if (typeof(sum)!=='number')
    throw new Error("normalize: distribution probabilities did not sum to a number, can not be normalized");
  if (sum===0)
    throw new Error("normalize: distribution probabilities sum to zero, can not be normalized");
  if (!isFinite(sum))
    throw new Error("normalize: distribution probabilities non-numeric or infinite, can not be normalized");
  if (sum<0)
    throw new Error("normalize: distribution probabilities sum to a negative, can not be normalized");
  return dist.map(([k,p])=>([k,p/sum]));
}

class SparseBelief {
  constructor({prior,likelihood}){
    if (!Array.isArray(prior))
      throw new Error("SparseBelief constructor: prior must be an Array");
    if (prior.some((x)=>(
      (!Array.isArray(x)) ||
      (x.length!==2) ||
      (typeof(x[1])!=='number') ||
      (!isFinite(x[1])) ||
      (x[1]<0)
    )))
      throw new Error("SparseBelief constructor: prior must be an Array of 2-Element Arrays with positive 2nd elements");
    if (typeof(likelihood)!=='function')
      throw new Error("SparseBelief constructor: likelihood must be a function");
    this.belief = normalize(prior);
    this.likelihood = likelihood;
  }
  observe(x){
    const prior = this.belief;
    const unscaledPosterior = (
      prior
      .map(([k,p])=>([k,p*this.likelihood(x,k)]))
      .filter((kp)=>(kp && (kp[1]>0)))
    );
    this.belief = normalize(unscaledPosterior);
    return this;
  }
  prob(k){
    let result = 0;
    try {
      result = this.belief.find(([key])=>(key===k))[1];
    } catch(e){
      result = 0;
    }
    return result;
  }
  keys(){
    return this.belief.map((a)=>(a[0]));
  }
  sort(how=byProb){
    this.belief.sort(how);
    return this;
  }
}

module.exports = {normalize, SparseBelief};
