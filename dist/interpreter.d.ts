import * as L from "./lang";
/** The output of our programs: a list of strings that our program printed. */
export type Output = string[];
/** @returns the value that expression `e` evaluates to. */
export declare function evaluate(varEnv: L.VarEnv, pointEnv: L.PointEnv, e: L.Exp): L.Value;
export declare function execute(varEnv: L.VarEnv, pointEnv: L.PointEnv, prog: L.Prog): Output;
//# sourceMappingURL=interpreter.d.ts.map