export class Indent {
  amount: number;
  parent: ?Indent;

  constructor(amount: number, parent: ?Indent = null) {
    this.amount = amount;
    this.parent = parent;
  }
}
