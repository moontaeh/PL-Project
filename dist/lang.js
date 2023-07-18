/***** Abstract Syntax Tree ***************************************************/
export const tyint = ({ tag: 'int' });
export const typointer = ({ tag: 'pointer' });
export const int = (value) => ({ tag: 'int', value });
export const poison = () => ({ tag: 'poison' });
export const plus = (e1, e2) => ({ tag: 'plus', e1, e2 });
export const vari = (name) => ({ tag: 'var', name });
export const pointer = (index, name) => ({ tag: 'pointer', index, name });
export const sdefine = (type, id, exp) => ({ tag: 'define', type, id, exp });
export const sprint = (exp) => ({ tag: 'print', exp });
export const sassign = (loc, exp) => ({ tag: 'assign', loc, exp });
/***** Equality ***************************************************************/
/** @returns true iff t1 and t2 are equivalent types */
export function typEquals(t1, t2) {
    if (t1.tag === 'int' && t2.tag === 'int') {
        return true;
    }
    else if (t1.tag === 'pointer' && t2.tag === 'pointer') {
        return true;
    }
    else {
        return false;
    }
}
/***** Runtime Environment ****************************************************/
// Variable Env
export class VarEnv {
    // the outer is the next environment in the chain
    outer;
    // the current map of variables
    bindings;
    constructor(bindings) {
        this.bindings = bindings || new Map();
    }
    has(x) {
        return this.bindings.has(x) || (this.outer !== undefined && this.outer.has(x));
    }
    get(x) {
        if (this.bindings.has(x)) {
            return this.bindings.get(x);
        }
        else if (this.outer !== undefined) {
            return this.outer.get(x);
        }
        else {
            throw new Error(`Runtime error: unbound variable '${x}'`);
        }
    }
    set(x, v) {
        if (this.bindings.has(x)) {
            throw new Error(`Runtime error: redefinition of variable '${x}'`);
        }
        else {
            this.bindings.set(x, v);
        }
    }
    update(x, v) {
        if (this.bindings.has(x)) {
            this.bindings.set(x, v);
        }
        else if (this.outer !== undefined) {
            return this.outer.update(x, v);
        }
        else {
            throw new Error(`Runtime error: unbound variable '${x}'`);
        }
    }
    extend1(x, v) {
        const ret = new VarEnv();
        ret.outer = this;
        ret.bindings = new Map([[x, v]]);
        return ret;
    }
    extend(xs, vs) {
        const ret = new VarEnv();
        ret.outer = this;
        ret.bindings = new Map(xs.map((x, i) => [x, vs[i]]));
        return ret;
    }
}
/** @returns a copy of `ctx` with the additional binding `x:t` */
export function extendCtx(x, t, ctx) {
    const ret = new Map(ctx.entries());
    ret.set(x, t);
    return ret;
}
/* Pointer Env
The pointer environment works as a map that contains the index of the address
and the value held in that address. Pointer expressions will contain the index
correlated with the pointer environment.
*/
export class PointEnv {
    bindings;
    maxSize = 100;
    currSize = 0;
    // Create a map with 100 empty spaces
    constructor() {
        this.bindings = new Map();
        for (let index = 0; index < 100; index++) {
            this.bindings.set(index, poison());
        }
    }
    has(index) {
        if (this.currSize === 0) {
            return false;
        }
        if (index > this.maxSize) {
            throw new Error(`Segmentation fault: context out of bounds`);
        }
        if (this.bindings.get(index).tag === 'poison') {
            return false;
        }
        else {
            return true;
        }
    }
    get(index) {
        if (this.bindings.has(index)) {
            return this.bindings.get(index);
        }
        else {
            throw new Error(`Runtime error: unbound variable '${index}'`);
        }
    }
    /**
     * Checks to see if the currSize is full. If it is not, then there are poison spots to set.
     * This function only sets if there is a space available
     */
    set(v) {
        if (this.currSize === this.maxSize) {
            throw new Error(`Error: memory full`);
        }
        else {
            let index = 0;
            while (index < this.maxSize) {
                if (this.bindings.get(index).tag === "poison") {
                    this.bindings.set(index, v);
                    this.currSize++;
                    return index;
                }
                else {
                    index++;
                }
            }
            throw new Error(`Memory available, but reached end of heap.`);
        }
    }
    update(index, v) {
        if (index >= this.maxSize) {
            throw new Error(`Runtime error: empty pointer at '${index}'`);
        }
        this.bindings.set(index, v);
    }
    /**
     * garbColl should act as a garbage collector for the pointer environment by
     * removing any unnecessary pointers in the env once the program exits a function
     */
    garbColl(pointEnv, varEnv, ctx) {
        /**
         * Make an array with 100 indexes, true or false, search through the variable environment
         * and make anything that is poison false and otherwise true, then remove them frm the
         * pointer environment
         */
        let garbCheck = new Array(100);
        garbCheck.fill(false);
        for (let [name, type] of ctx) {
            if (type.tag === 'pointer') {
                let index = pointEnv.get(varEnv.get(name).index).value;
                garbCheck[index] = true;
            }
        }
        for (let index = 0; index < 100; index++) {
            if (garbCheck[index] === false) {
                pointEnv.update(index, poison());
            }
        }
    }
}
/***** Pretty-printer *********************************************************/
/** @returns a pretty version of the expression `e`, suitable for debugging. */
export function prettyExp(e) {
    switch (e.tag) {
        case 'int': return `${e.value}`;
        case 'plus': return '+';
        case 'var': return `${e.name}`;
    }
}
/** @returns a pretty version of the value `v`, suitable for debugging. */
export function prettyValue(v) {
    switch (v.tag) {
        case 'int': return `${v.value}`;
        case 'poison': return `undefined`;
        case 'pointer': return `${v.index}`;
    }
}
/** @returns a pretty version of the type `t`. */
export function prettyTyp(t) {
    switch (t.tag) {
        case 'int': return 'int';
        case 'pointer': return 'int*';
    }
}
/** @returns a pretty version of the statement `s`. */
export function prettyStmt(s) {
    switch (s.tag) {
        case 'define': {
            if (s.type.tag === 'int') {
                return `int ${s.id} = ${prettyExp(s.exp)}`;
            }
            else if (s.type.tag === 'pointer') {
                return `int* ${s.id} = ${prettyExp(s.exp)}`;
            }
        }
        case 'print': return `print(${prettyExp(s.exp)})`;
        case 'assign': return `${s.loc} = ${prettyExp(s.exp)}`;
    }
}
/** @returns a pretty version of the program `p`. */
export function prettyProg(p) {
    return p.map(prettyStmt).join('\n');
}
//# sourceMappingURL=lang.js.map