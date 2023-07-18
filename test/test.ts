import { describe, expect, test } from '@jest/globals'
import * as L from '../src/lang'
import * as P from '../src/parser'
import * as T from '../src/typechecker'
import * as I from '../src/interpreter'
import * as Lex from '../src/lexer'

let varEnv : L.VarEnv = new L.VarEnv()
let pointEnv : L.PointEnv = new L.PointEnv()
let ctx : L.Ctx = new Map<string, L.Typ>()


function compile (src: string, typecheck: boolean = false): L.Prog {
  const prog = P.parseProg(src)
  if (typecheck) {
    T.checkWF(ctx, prog)
  }
  return prog
}

function compileAndPrint (src: string, typecheck: boolean = false): string {
  return L.prettyProg(compile(src, typecheck))
}

function compileAndInterpret (src: string, typecheck: boolean = false): I.Output {
  return I.execute(varEnv, pointEnv, compile(src, typecheck))
}


const prog1 = 
`int x = 5
int* y = 4
int z = x
int* ab = 3
print(ab)
print(*ab)
print(y)
print(*y)
print(x)
print(z)
ab = y
print(ab)
print(*ab)
y = 6
print(*ab)`

describe('Typechecker', () => {
  test('int', () => {
    expect(T.typecheck(ctx, P.parseExp(Lex.lex('7')))).toStrictEqual(L.tyint)
  })
  test('plus', () => {
    expect(T.typecheck(ctx, P.parseExp(Lex.lex('2 + 4')))).toStrictEqual(L.tyint)
  })

})

describe('interpretation', () => {
  test('prog1', () => {
    expect(compileAndInterpret(prog1, false)).toStrictEqual(['1','3','0','4','5','5','0','4','6'])
  })
})
