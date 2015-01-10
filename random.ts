// Interface for the randomness monad.
interface Random<T> {
  run(seed : number) : [number, T];
  bind<S>(f : (n : number, v : T) => Random<S>) : Random<S>;
}

// Represents the unit of the monad.
class RandomUnit<T> implements Random<T> {

  constructor(private value : T) { }

  // Copied from http://stackoverflow.com/a/19303725/165198
  private random(seed : number) : number {
    var x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
  }

  run(seed : number) : [number, T] {
    return [this.random(seed), this.value];
  }

  bind<S>(f : (n : number, v : T) => Random<S>) : Random<S> {
    return new RandomBound(this, f);
  }

}

// Represents binding.
class RandomBound<T, S> implements Random<S> {

  constructor(private previous : Random<T>, private next : (n : number, v : T) => Random<S>) { }

  run(seed : number) : [number, S] {
    var tuple = this.previous.run(seed);
    var rand = tuple[0];
    var value = tuple[1];
    // Thread the random number to the next monadic element.
    return this.next(rand, value).run(rand);
  }

  bind<U>(f : (n : number, v : S) => Random<U>) : Random<U> {
    return new RandomBound(this, f);
  }

}

// Convenience wrapper for generating RandomUnit instances. Should be used
// as the entry point for random monadic computations.
class Rand {
  static unit<T>(u : T) : Random<T> {
    return new RandomUnit(u);
  }
  static lift<S, T>(f : (v : S) => T) : (u : Random<S>) => Random<T> {
    return (u : Random<S>) => u.bind((_, v) => Rand.unit(f(v)));
  }
}

// Example
var rand_string = (Rand.unit('')).bind(
  (rand, str) => rand > 0.5 ? Rand.unit(str + 'b') : Rand.unit(str + 'a')).bind(
    (rand, str) => Rand.unit(str + 'c'));
console.log(rand_string.run(1));
console.log(rand_string.run(2));
console.log(rand_string.run(3));
