interface Identity<T> {
  run() : T;
  bind<S>(f : (v : T) => Identity<S>) : Identity<S>;
}

class IdentityUnit<T> implements Identity<T> {

  constructor(private value : T) { }

  run() : T {
    return this.value;
  }

  bind<S>(f : (v : T) => Identity<S>) : Identity<S> {
    return new IdentityBound(this, f);
  }

}

class IdentityBound<T, S> implements Identity<S> {

  constructor(private previous : Identity<T>, private next : (v : T) => Identity<S>) { }

  run() : S {
    return this.next(this.previous.run()).run();
  }

  bind<U>(f : (v : S) => Identity<U>) : Identity<U> {
    return new IdentityBound(this, f);
  }

}

class Ident {
  static unit<T>(v : T) : Identity<T> {
    return new IdentityUnit(v);
  }
  static lift<S, T>(f : (v : S) => T) : (u : Identity<S>) => Identity<T> {
    return (u : Identity<S>) => u.bind(x => Ident.unit(f(x)));
  }
}

// Example for basic binding
var result = Ident.unit(5).bind(v1 => 
  Ident.unit(6).bind(v2 => 
    Ident.unit(v1 + v2)));
console.log(result.run());

// Example for lifting
var lifted = Ident.lift((x : number) : number => x + 6);
var result = lifted(Ident.unit(5));
console.log(result.run());
