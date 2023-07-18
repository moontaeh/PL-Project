import * as L from './lang'
import * as Lex from './lexer'

/*
statement      → term ;
term           → primary( ( "+" ) primary )* ;
primary        → Int | Var | "(" statement ")" ;
*/

/**
 * @param src the input program in sensible syntax
 * @returns the `Exp` corresponding to the provided input program
 */
export function parseExp(src: Lex.Tok[]): L.Exp {
  const tokenIndex = { index : 0 }
  const ret = term(tokenIndex, src)

  // N.B., make sure we completely consume the input when we're done!
  if (tokenIndex.index !== src.length) {
    throw new Error(`Unexpected characters at end of input. tokenIndex: ${tokenIndex.index}, src: ${src.length}`)
  } else {
    return ret
  }
}

/**
 * @param tokenIndex the current index of the token
 * @param src the tokens being parsed
 * @returns the expression parsed starting at the current position `src`
 *          denoted by `state`
//  */
export function term(tokenIndex: Lex.LexerState, src: Lex.Tok[]): L.Exp{
  let expr = primary(tokenIndex, src)

  while(tokenIndex.index < src.length && src[tokenIndex.index].tag === '+'){
    tokenIndex.index++
    let rhs = primary(tokenIndex, src)
    expr = L.plus(expr, rhs)
  }
  
  return expr
}

/**
 * @param tokenIndex the current index of the token
 * @param src the tokens being parsed
 * @returns the expression parsed starting at the current position `src`
 *          denoted by `state`
//  */
export function primary(tokenIndex: Lex.LexerState, src: Lex.Tok[]): L.Exp{
  let curr = src[tokenIndex.index]

  if(curr.tag === 'int'){
    let num = curr.value
    tokenIndex.index++
    return L.int(num)
  }

  if(curr.tag === 'ident'){
    // Variable case
    tokenIndex.index++
    return L.vari(curr.value)
  }

  if(src[tokenIndex.index].tag === '('){
    tokenIndex.index++
    let expr = term(tokenIndex, src)
    if(src[tokenIndex.index].tag !== ')'){
      throw new Error('Invalid token')
    }
    tokenIndex.index++
    return expr
  }

  throw new Error(`Invalid token '${src[tokenIndex.index]}'`)

}

/**
 * @param src string of one statement or one line of code in the program
 * @returns the `Stmt` corresponding to the provided string
 * 
 * Parse the string into define and print, then parse the expressions in each line by sending
 * them to parseExp
 */
export function parseStmt(src: string): L.Stmt {
  let tokens: Lex.Tok[] = Lex.lex(src)

  let startStmt = tokens[0]
  if(startStmt.tag === 'ident'){
    // Stmts must have 2 or more tokens
    if(tokens.length < 2){
      throw new Error(`Invalid statement. Expected 2 or more tokens, received ${tokens.length}`)
    }
    let restStmt = tokens.slice(1)

    if(startStmt.value === 'int' || startStmt.value === 'int*'){
      // define case

      // define must have at least 4 tokens eg. int x = 6
      if(tokens.length !== 4){
        throw new Error(`Invalid statement. Expected at least 4 tokens, received ${tokens.length}`)
      }

      let name = restStmt[0]
      if(name.tag === 'ident'){
        if(restStmt[1].tag === '='){
          restStmt = tokens.slice(3)
          if(restStmt[0].tag === 'int' || 'ident'){
            if(startStmt.value === 'int'){
              return L.sdefine(L.tyint, name.value, parseExp(restStmt))
            } else if(startStmt.value === 'int*'){
              return L.sdefine(L.typointer, name.value, parseExp(restStmt))
            }
          }
        }
      }
      throw new Error(`Invalid statement '${src}'`)
    } else if(startStmt.value === 'print'){
      // print case
      return L.sprint(parseExp(restStmt))
    } else if(startStmt.tag === 'ident' && tokens[1].tag === '='){
      // assign case
      if(tokens.length < 3){
        throw new Error(`Invalid statement. Expected at least 3 tokens, received ${tokens.length}`)
      }
      restStmt = tokens.slice(2)
      let loc = tokens.slice(0,1)
      let lhs = parseExp(loc)
      let rhs = parseExp(restStmt)

      return L.sassign(lhs, rhs)
    }
  }
  throw new Error(`Invalid statement '${src}'`)
}

/**
 * @param src a string that represents the whole program in sensible syntax
 * @returns the `Prog` corresponding to the provided input program
 * 
 * Get a whole string that is a program, split that program into arrays of strings split by new line
 * Send that array one index at a time into parseStmt
 */
export function parseProg(src: string): L.Prog {
  // Splits the array by newline
  let srcArr: string[] = src.split(/\r?\n/)
  return srcArr.map(parseStmt)
}