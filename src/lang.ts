/***** Abstract Syntax Tree ***************************************************/

// Type
export type Typ = TyInt | TyPointer

export type TyInt = { tag: 'int' }
export type TyPointer = { tag: 'pointer'}

export const tyint: Typ = ({ tag: 'int' })
export const typointer: Typ = ({ tag: 'pointer'})

// Expressions
export type Exp = Int | Var | Plus
export type Value = Int | Poison | Pointer

export type Int = { tag: 'int', value: number }
export type Poison = { tag: 'poison' }
export type Plus = { tag: 'plus', e1: Exp, e2: Exp }
export type Var = { tag: 'var', name: string }
export type Pointer = { tag: 'pointer', index: number, name: string }

export const int = (value: number): Int => ({ tag: 'int', value })
export const poison = (): Poison => ({ tag: 'poison' })
export const plus = (e1: Exp, e2: Exp): Exp => ({ tag: 'plus', e1, e2 })
export const vari = (name: string): Exp => ({ tag: 'var', name })
export const pointer = (index: number, name: string): Value => ({ tag: 'pointer', index, name })

// Statements
export type Stmt = SDefine | SPrint | SAssign

export type SDefine = { tag: 'define', type: Typ, id: string, exp: Exp }
export type SPrint = { tag: 'print', exp: Exp }
export type SAssign = { tag: 'assign', loc: Exp, exp: Exp}

export const sdefine = (type: Typ, id: string, exp: Exp): SDefine => ({ tag: 'define', type, id, exp })
export const sprint = (exp: Exp): SPrint => ({ tag: 'print', exp })
export const sassign = (loc: Exp, exp: Exp): SAssign => ({ tag: 'assign', loc, exp })


// Programs

export type Prog = Stmt[]

/***** Equality ***************************************************************/

/** @returns true iff t1 and t2 are equivalent types */
export function typEquals (t1: Typ, t2: Typ): boolean {
  if (t1.tag === 'int' && t2.tag === 'int') {
    return true
  } else if(t1.tag === 'pointer' && t2.tag === 'pointer'){
    return true
  } else {
    return false
  }
}

/***** Runtime Environment ****************************************************/

// Variable Env
export class VarEnv {
  // the outer is the next environment in the chain
  private outer?: VarEnv
  // the current map of variables
  public bindings: Map<string, Value>

  constructor (bindings?: Map<string, Value>) {
    this.bindings = bindings || new Map()
  }

  has (x: string): boolean {
    return this.bindings.has(x) || (this.outer !== undefined && this.outer.has(x))
  }

  get (x: string): Value {
    if (this.bindings.has(x)) {
      return this.bindings.get(x)!
    } else if (this.outer !== undefined) {
      return this.outer.get(x)
    } else {
      throw new Error(`Runtime error: unbound variable '${x}'`)
    }
  }

  set (x: string, v: Value): void {
    if (this.bindings.has(x)) {
      throw new Error(`Runtime error: redefinition of variable '${x}'`)
    } else {
      this.bindings.set(x, v)
    }
  }

  update (x: string, v: Value): void {
    if (this.bindings.has(x)) {
      this.bindings.set(x, v)
    } else if (this.outer !== undefined) {
      return this.outer.update(x, v)
    } else {
      throw new Error(`Runtime error: unbound variable '${x}'`)
    }
  }

  extend1 (x: string, v: Value): VarEnv {
    const ret = new VarEnv()
    ret.outer = this
    ret.bindings = new Map([[x, v]])
    return ret
  }

  extend (xs: string[], vs: Value[]): VarEnv {
    const ret = new VarEnv()
    ret.outer = this
    ret.bindings = new Map(xs.map((x, i) => [x, vs[i]]))
    return ret
  }
}

/** A context maps names of variables to their types. */
export type Ctx = Map<string, Typ>

/** @returns a copy of `ctx` with the additional binding `x:t` */
export function extendCtx(x: string, t: Typ, ctx: Ctx): Ctx {
  const ret = new Map(ctx.entries())
  ret.set(x, t)
  return ret
}


/* Pointer Env
The pointer environment works as a map that contains the index of the address
and the value held in that address. Pointer expressions will contain the index
correlated with the pointer environment.
*/
export class PointEnv{
  private bindings: Map<number, Value>
  private maxSize = 100
  private currSize = 0

  // Create a map with 100 empty spaces
  constructor () {
    this.bindings = new Map<number, Value>()
    for(let index = 0; index < 100; index++){
      this.bindings.set(index, poison())
    }
  }

  has(index: number): boolean{
    if(this.currSize === 0){
      return false
    }
    if(index > this.maxSize){
      throw new Error(`Segmentation fault: context out of bounds`)
    }
    if(this.bindings.get(index)!.tag === 'poison'){
      return false
    } else {
      return true
    }
  }

  get (index: number): Value {
    if (this.bindings.has(index)) {
      return this.bindings.get(index)!
    } else {
      throw new Error(`Runtime error: unbound variable '${index}'`)
    }
  }

  /**
   * Checks to see if the currSize is full. If it is not, then there are poison spots to set.
   * This function only sets if there is a space available
   */
  set (v: Value): number {
    if(this.currSize === this.maxSize){
      throw new Error(`Error: memory full`)
    } else {
      let index = 0
      while(index < this.maxSize){
        if(this.bindings.get(index)!.tag === "poison"){
          this.bindings.set(index, v)
          this.currSize++
          return index
        } else {
          index++
        }
      }
      throw new Error(`Memory available, but reached end of heap.`)
    }
  }

  update (index: number, v: Value): void {
    if(index >= this.maxSize){
      throw new Error(`Runtime error: empty pointer at '${index}'`)
    }
    this.bindings.set(index, v)
  }

  /**
   * garbColl should act as a garbage collector for the pointer environment by
   * removing any unnecessary pointers in the env once the program exits a function
   */
  garbColl(varEnv: VarEnv): void{
    /**
     * Make an array with 100 indexes, true or false, search through the variable environment
     * and make anything that is poison false and otherwise true, then remove them frm the 
     * pointer environment
     */
    let garbCheck = new Array<boolean>(100)
    garbCheck.fill(false)

    for(let [name, value] of varEnv.bindings){
      if(value.tag === 'pointer'){
        let index = (varEnv.get(name) as Pointer).index
        garbCheck[index] = true
      }
    }
    
    for(let index = 0; index < 100; index++){
      if(garbCheck[index] === false){
        this.update(index, poison())
      }
    }
  }

}

/***** Pretty-printer *********************************************************/

/** @returns a pretty version of the expression `e`, suitable for debugging. */
export function prettyExp (e: Exp): string {
  switch (e.tag) {
    case 'int'    : return `${e.value}`
    case 'plus'   : return '+'
    case 'var'   : return `${e.name}`
  }
}

/** @returns a pretty version of the value `v`, suitable for debugging. */
export function prettyValue (v: Value): string {
  switch (v.tag) {
    case 'int'     : return `${v.value}`
    case 'poison'  : return `undefined`
    case 'pointer' : return `${v.index}`
  }
}

/** @returns a pretty version of the type `t`. */
export function prettyTyp (t: Typ): string {
  switch (t.tag) {
    case 'int': return 'int'
    case 'pointer': return 'int*'
  }
}

/** @returns a pretty version of the statement `s`. */
export function prettyStmt (s: Stmt): string {
  switch (s.tag) {
    case 'define':{
      if(s.type.tag === 'int'){
        return `int ${s.id} = ${prettyExp(s.exp)}`
      } else if(s.type.tag === 'pointer'){
        return `int* ${s.id} = ${prettyExp(s.exp)}`
      }
    } 
    case 'print': return `print(${prettyExp(s.exp)})`
    case 'assign': return `${s.loc} = ${prettyExp(s.exp)}`
  }
}

/** @returns a pretty version of the program `p`. */
export function prettyProg (p: Prog): string {
  return p.map(prettyStmt).join('\n')
}

