import * as L from './lang';
import * as Lex from './lexer';
/**
 * @param src the input program in sensible syntax
 * @returns the `Exp` corresponding to the provided input program
 */
export declare function parseExp(src: Lex.Tok[]): L.Exp;
/**
 * @param tokenIndex the current index of the token
 * @param src the tokens being parsed
 * @returns the expression parsed starting at the current position `src`
 *          denoted by `state`
//  */
export declare function term(tokenIndex: Lex.LexerState, src: Lex.Tok[]): L.Exp;
/**
 * @param tokenIndex the current index of the token
 * @param src the tokens being parsed
 * @returns the expression parsed starting at the current position `src`
 *          denoted by `state`
//  */
export declare function primary(tokenIndex: Lex.LexerState, src: Lex.Tok[]): L.Exp;
/**
 * @param src string of one statement or one line of code in the program
 * @returns the `Stmt` corresponding to the provided string
 *
 * Parse the string into define and print, then parse the expressions in each line by sending
 * them to parseExp
 */
export declare function parseStmt(src: string): L.Stmt;
/**
 * @param src a string that represents the whole program in sensible syntax
 * @returns the `Prog` corresponding to the provided input program
 *
 * Get a whole string that is a program, split that program into arrays of strings split by new line
 * Send that array one index at a time into parseStmt
 */
export declare function parseProg(src: string): L.Prog;
//# sourceMappingURL=parser.d.ts.map