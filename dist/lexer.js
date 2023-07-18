/***** Lexer Datatypes ********************************************************/
const tint = (value) => ({ tag: 'int', value });
const tident = (value) => ({ tag: 'ident', value });
const tlparen = ({ tag: '(' });
const tplus = ({ tag: '+' });
const trparen = ({ tag: ')' });
const teq = ({ tag: '=' });
/***** Lexer Function *********************************************************/
/**
 * @returns a pretty version of the input token `tok`.
 */
export function prettyTok(tok) {
    switch (tok.tag) {
        case 'int': return tok.value.toString();
        case 'ident': return tok.value;
        case '+': return '+';
        case '(': return '(';
        case ')': return ')';
        case '=': return '=';
    }
}
function tokenize(state, src) {
    const ret = [];
    while (state.index < src.length) {
        // Skip over whitespace
        while (/\s/.test(src[state.index])) {
            state.index += 1;
        }
        const leader = src[state.index];
        if (leader === '(') {
            state.index += 1;
            ret.push(tlparen);
        }
        else if (leader === ')') {
            state.index += 1;
            ret.push(trparen);
        }
        else if (/\d/.test(leader)) {
            let digits = leader;
            while (/\d/.test(src[++state.index])) {
                digits += src[state.index];
            }
            ret.push(tint(parseInt(digits)));
        }
        else if (leader === '+') {
            state.index += 1;
            ret.push(tplus);
        }
        else if (leader === '=') {
            state.index += 1;
            ret.push(teq);
        }
        else {
            // N.B., identifiers are tokens that do not start with a digit.
            let chk = leader;
            let cur = src[++state.index];
            while (state.index < src.length && /\S/.test(cur) && cur !== '(' && cur !== ')') {
                chk += cur;
                cur = src[++state.index];
            }
            ret.push(tident(chk));
        }
    }
    return ret;
}
/**
 * @returns an array of tokens created by lexing `src`.
 */
export function lex(src) {
    return tokenize({ index: 0 }, src);
}
//# sourceMappingURL=lexer.js.map