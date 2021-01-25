//{"location":"body","param":"email","value":"jojozhuang","msg":"Email address is invalid"}
export class ValidationError {
  constructor(public location: string, public param: string, public value: string, public msg: string) {}
}
