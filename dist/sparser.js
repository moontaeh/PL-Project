import * as L from './lang';
/*
statement      → equality ;
equality       → comparison ( "==" ) comparison )* ;
comparison     → term ( ( "&&" | "||" ) term )* ;
term           → unary ( "+" ) unary )* ;
unary          → ( "!" ) unary | primary ;
primary        → Int | Char | Bool | "(" statement ")" ;
*/
/**
 * @param src the input program in sensible syntax
 * @returns the `Exp` corresponding to the provided input program
 */
export function parseExp(src) {
    const tokenIndex = { index: 0 };
    const ret = equality(tokenIndex, src);
    // N.B., make sure we completely consume the input when we're done!
    if (tokenIndex.index !== src.length) {
        throw new Error(`Unexpected characters at end of input. tokenIndex: ${tokenIndex.index}, src: ${src.length}`);
    }
    else {
        return ret;
    }
}
/**
 * @param tokenIndex the current index of the token
 * @param src the tokens being parsed
 * @returns the expression parsed starting at the current position `src`
 *          denoted by `state`
//  */
export function equality(tokenIndex, src) {
    let expr = comparison(tokenIndex, src);
    while (tokenIndex.index < src.length && src[tokenIndex.index].tag === '==') {
        tokenIndex.index++;
        let rhs = comparison(tokenIndex, src);
        expr = L.eq(expr, rhs);
    }
    return expr;
}
/**
 * @param tokenIndex the current index of the token
 * @param src the tokens being parsed
 * @returns the expression parsed starting at the current position `src`
 *          denoted by `state`
//  */
export function comparison(tokenIndex, src) {
    let expr = term(tokenIndex, src);
    while (tokenIndex.index < src.length && (src[tokenIndex.index].tag === '&&' || src[tokenIndex.index].tag === '||')) {
        let operator = src[tokenIndex.index].tag;
        tokenIndex.index++;
        let rhs = term(tokenIndex, src);
        if (operator === '&&') {
            expr = L.and(expr, rhs);
        }
        else if (operator === '||') {
            expr = L.or(expr, rhs);
        }
    }
    return expr;
}
/**
 * @param tokenIndex the current index of the token
 * @param src the tokens being parsed
 * @returns the expression parsed starting at the current position `src`
 *          denoted by `state`
//  */
export function term(tokenIndex, src) {
    let expr = unary(tokenIndex, src);
    while (tokenIndex.index < src.length && src[tokenIndex.index].tag === '+') {
        tokenIndex.index++;
        let rhs = unary(tokenIndex, src);
        expr = L.plus(expr, rhs);
    }
    return expr;
}
/**
 * @param tokenIndex the current index of the token
 * @param src the tokens being parsed
 * @returns the expression parsed starting at the current position `src`
 *          denoted by `state`
//  */
export function unary(tokenIndex, src) {
    let expr;
    if (tokenIndex.index < src.length && src[tokenIndex.index].tag === '!') {
        tokenIndex.index++;
        let rhs = unary(tokenIndex, src);
        return expr = L.bool(!rhs);
    }
    return primary(tokenIndex, src);
}
/**
 * @param tokenIndex the current index of the token
 * @param src the tokens being parsed
 * @returns the expression parsed starting at the current position `src`
 *          denoted by `state`
//  */
export function primary(tokenIndex, src) {
    let curr = src[tokenIndex.index];
    if (curr.tag === 'true') {
        tokenIndex.index++;
        return L.bool(true);
    }
    if (curr.tag === 'false') {
        tokenIndex.index++;
        return L.bool(false);
    }
    if (curr.tag === 'int') {
        let num = curr.value;
        tokenIndex.index++;
        return L.int(num);
    }
    if (src[tokenIndex.index].tag === '(') {
        tokenIndex.index++;
        let expr = equality(tokenIndex, src);
        if (src[tokenIndex.index].tag !== ')') {
            throw new Error('Invalid token');
        }
        tokenIndex.index++;
        return expr;
    }
    throw new Error(`Invalid token '${src[tokenIndex.index]}'`);
}
//# sourceMappingURL=sparser.js.map