/***** Abstract Syntax Tree ***************************************************/
export type Typ = TyInt | TyPointer;
export type TyInt = {
    tag: 'int';
};
export type TyPointer = {
    tag: 'pointer';
};
export declare const tyint: Typ;
export declare const typointer: Typ;
export type Exp = Int | Var | Plus;
export type Value = Int | Poison | Pointer;
export type Int = {
    tag: 'int';
    value: number;
};
export type Poison = {
    tag: 'poison';
};
export type Plus = {
    tag: 'plus';
    e1: Exp;
    e2: Exp;
};
export type Var = {
    tag: 'var';
    name: string;
};
export type Pointer = {
    tag: 'pointer';
    index: number;
    name: string;
};
export declare const int: (value: number) => Int;
export declare const poison: () => Poison;
export declare const plus: (e1: Exp, e2: Exp) => Exp;
export declare const vari: (name: string) => Exp;
export declare const pointer: (index: number, name: string) => Value;
export type Stmt = SDefine | SPrint | SAssign;
export type SDefine = {
    tag: 'define';
    type: Typ;
    id: string;
    exp: Exp;
};
export type SPrint = {
    tag: 'print';
    exp: Exp;
};
export type SAssign = {
    tag: 'assign';
    loc: Exp;
    exp: Exp;
};
export declare const sdefine: (type: Typ, id: string, exp: Exp) => SDefine;
export declare const sprint: (exp: Exp) => SPrint;
export declare const sassign: (loc: Exp, exp: Exp) => SAssign;
export type Prog = Stmt[];
/***** Equality ***************************************************************/
/** @returns true iff t1 and t2 are equivalent types */
export declare function typEquals(t1: Typ, t2: Typ): boolean;
/***** Runtime Environment ****************************************************/
export declare class VarEnv {
    private outer?;
    private bindings;
    constructor(bindings?: Map<string, Value>);
    has(x: string): boolean;
    get(x: string): Value;
    set(x: string, v: Value): void;
    update(x: string, v: Value): void;
    extend1(x: string, v: Value): VarEnv;
    extend(xs: string[], vs: Value[]): VarEnv;
}
/** A context maps names of variables to their types. */
export type Ctx = Map<string, Typ>;
/** @returns a copy of `ctx` with the additional binding `x:t` */
export declare function extendCtx(x: string, t: Typ, ctx: Ctx): Ctx;
export declare class PointEnv {
    private bindings;
    private maxSize;
    private currSize;
    constructor();
    has(index: number): boolean;
    get(index: number): Value;
    /**
     * Checks to see if the currSize is full. If it is not, then there are poison spots to set.
     * This function only sets if there is a space available
     */
    set(v: Value): number;
    update(index: number, v: Value): void;
    /**
     * garbColl should act as a garbage collector for the pointer environment by
     * removing any unnecessary pointers in the env once the program exits a function
     */
    garbColl(pointEnv: PointEnv, varEnv: VarEnv, ctx: Ctx): void;
}
/***** Pretty-printer *********************************************************/
/** @returns a pretty version of the expression `e`, suitable for debugging. */
export declare function prettyExp(e: Exp): string;
/** @returns a pretty version of the value `v`, suitable for debugging. */
export declare function prettyValue(v: Value): string;
/** @returns a pretty version of the type `t`. */
export declare function prettyTyp(t: Typ): string;
/** @returns a pretty version of the statement `s`. */
export declare function prettyStmt(s: Stmt): string;
/** @returns a pretty version of the program `p`. */
export declare function prettyProg(p: Prog): string;
//# sourceMappingURL=lang.d.ts.map