import * as L from './lang';
import { LexerState, Tok } from './lexer';
/**
 * @param src the input program in sensible syntax
 * @returns the `Exp` corresponding to the provided input program
 */
export declare function parseExp(src: Tok[]): L.Exp;
/**
 * @param tokenIndex the current index of the token
 * @param src the tokens being parsed
 * @returns the expression parsed starting at the current position `src`
 *          denoted by `state`
//  */
export declare function equality(tokenIndex: LexerState, src: Tok[]): L.Exp;
/**
 * @param tokenIndex the current index of the token
 * @param src the tokens being parsed
 * @returns the expression parsed starting at the current position `src`
 *          denoted by `state`
//  */
export declare function comparison(tokenIndex: LexerState, src: Tok[]): L.Exp;
/**
 * @param tokenIndex the current index of the token
 * @param src the tokens being parsed
 * @returns the expression parsed starting at the current position `src`
 *          denoted by `state`
//  */
export declare function term(tokenIndex: LexerState, src: Tok[]): L.Exp;
/**
 * @param tokenIndex the current index of the token
 * @param src the tokens being parsed
 * @returns the expression parsed starting at the current position `src`
 *          denoted by `state`
//  */
export declare function unary(tokenIndex: LexerState, src: Tok[]): L.Exp;
/**
 * @param tokenIndex the current index of the token
 * @param src the tokens being parsed
 * @returns the expression parsed starting at the current position `src`
 *          denoted by `state`
//  */
export declare function primary(tokenIndex: LexerState, src: Tok[]): L.Exp;
//# sourceMappingURL=sparser.d.ts.map