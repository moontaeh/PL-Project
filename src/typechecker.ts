import * as L from './lang'

function expectedTypeMsg(expected: string, pos: number, fn: string, found: string) {
  return `Type error: Expected ${expected} in position ${pos} of ${fn} but found ${found}`
}

/** @return the type of expression `e` */
export function typecheck (ctx: L.Ctx, e: L.Exp): L.Typ {
  switch (e.tag) {
    case 'int':
      return L.tyint
    case 'var': {
        if (ctx.has(e.name)){
          return ctx.get(e.name)!
        } else {
          throw new Error(`Type error: unbound variable: ${e.name}`)
        }
    }
    case 'plus': {
      const t1 = typecheck(ctx, e.e1)
      const t2 = typecheck(ctx, e.e2)

      // int can be added with int and pointer. Pointer cannot be added with pointer.
      if(t1.tag === 'int'){
        if(t2.tag === 'int'){
          return L.tyint
        } else if (t2.tag === 'pointer'){
          return L.typointer
        } else {
          throw new Error(`Type error: invalid addition`)
        }
      } else if(t1.tag === 'pointer'){
        if(t2.tag === 'int'){
          return L.typointer
        } else if(t2.tag === 'pointer'){
          throw new Error(`Type error: cannot add pointers`)
        } else {
          throw new Error(`Type error: invalid addition`)
        }
      } else {
        throw new Error(`Type error: invalid addition`)
      }
    }
  }
}

export function checkWF (ctx: L.Ctx, prog: L.Prog): void {
  prog.forEach((s) => {
    switch (s.tag) {
      case 'define': {
        const t = typecheck(ctx, s.exp)

        if(s.type.tag === 'int'){
          // Int case: can only asign ints
          if(L.typEquals(t, s.type)){
            L.extendCtx(s.id, s.type, ctx)
          } else {
            throw new Error(`Type Error: expected int, got ${t.tag}`)
          }
        } else if(s.type.tag === 'pointer'){
          if(t.tag === 'int' || t.tag === 'pointer'){
            L.extendCtx(s.id, s.type, ctx)
          }
        }
        break
      }

      /**
       * @check why does define extend the ctx but assign does not change it?
       */
      case 'assign': {    
        const t = typecheck(ctx, s.exp)
        if (s.loc.tag !== 'var') {
          throw new Error(`Type Error: assignment to non-location '${L.prettyExp(s.loc)}'`)
        } else if (!ctx.has(s.loc.name)) {
          throw new Error(`Type Error: unbound variable '${s.loc.name}'`)
        } else if (ctx.get(s.loc.name) === L.tyint && !L.typEquals(t, ctx.get(s.loc.name)!)) {
          throw new Error(`Type Error: expected ${L.prettyTyp(ctx.get(s.loc.name)!)} but found ${L.prettyTyp(t)}`)
        }
        break
      }
      
      case 'print': {
        typecheck(ctx, s.exp)
        break
      }
    }
  })
}