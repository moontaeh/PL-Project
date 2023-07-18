/***** Lexer Datatypes ********************************************************/
export type LexerState = {
    index: number;
};
export type TInt = {
    tag: 'int';
    value: number;
};
export type TIdent = {
    tag: 'ident';
    value: string;
};
export type TLParen = {
    tag: '(';
};
export type TPlus = {
    tag: '+';
};
export type TRParen = {
    tag: ')';
};
export type TEq = {
    tag: '=';
};
/** The type of tokens generated by the lexer. */
export type Tok = TInt | TIdent | TPlus | TLParen | TRParen | TEq;
/***** Lexer Function *********************************************************/
/**
 * @returns a pretty version of the input token `tok`.
 */
export declare function prettyTok(tok: Tok): string;
/**
 * @returns an array of tokens created by lexing `src`.
 */
export declare function lex(src: string): Tok[];
//# sourceMappingURL=lexer.d.ts.map