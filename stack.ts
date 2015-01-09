interface StackMonad<T> {
  run(stack : Array<T>) : T;
  bind(f : (v : T) => StackMonad<T>) : StackMonad<T>;
}

class StackMonadPush<T> implements StackMonad<T> {

  constructor(private value : T) { }

  bind(f : (v : T) => StackMonad<T>) : StackMonad<T> {
    return new StackMonadBound(this, f);
  }

  run(stack : Array<T>) : T {
    stack.push(this.value);
    return null;
  }

}

class StackMonadPop<T> implements StackMonad<T> {

  constructor() { }

  bind(f : (v : T) => StackMonad<T>) : StackMonad<T> {
    return new StackMonadBound(this, f);
  }

  run(stack : Array<T>) : T {
    return stack.pop();
  }

}

class StackMonadBound<T> implements StackMonad<T> {

  constructor(private previous : StackMonad<T>, private next : (v : T) => StackMonad<T>) { }

  bind(f : (v : T) => StackMonad<T>) : StackMonad<T> {
    return new StackMonadBound(this, f);
  }

  run(stack : Array<T>) : T {
    return this.next(this.previous.run(stack)).run(stack);
  }

}

// Convenient entry point to be used for generating monadic values.
class Stack {

  static push<T>(v : T) : StackMonad<T> {
    return new StackMonadPush(v);
  }

  static pop<T>() : StackMonad<T> {
    return new StackMonadPop<T>();
  }

}

var stack : Array<number> = [];
var stack_ops = Stack.push<number>(4).bind(_ => Stack.push(5)).bind(
  _ => Stack.pop<number>().bind(
    f => Stack.pop<number>().bind(
      s => Stack.push(f + s))));
stack_ops.run(stack);
console.log(stack);
