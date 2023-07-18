import * as L from "./lang"

/** The output of our programs: a list of strings that our program printed. */
export type Output = string[]

/** @returns the value that expression `e` evaluates to. */
export function evaluate (varEnv: L.VarEnv, pointEnv: L.PointEnv, e: L.Exp) : L.Value {
    switch (e.tag) {
        case 'int':
            return e
        case 'plus': {
            const v1 = evaluate(varEnv, pointEnv, e.e1)
            const v2 = evaluate(varEnv, pointEnv, e.e2)
            if (v1.tag === 'int' && v2.tag === 'int') {
                return L.int(v1.value + v2.value)
            } else {
                throw new Error(`Type error: plus expects two numbers but a ${v1.tag} and ${v2.tag} was given.`)
            }
        }
        case 'var': {
            let name = e.name
            if(name.indexOf("*") === 0){
                // Only for print case to print the value of the pointer
                name = name.substring(1)
                if(varEnv.has(name)){
                    return pointEnv.get((varEnv.get(name) as L.Pointer).index)
                } else {
                    throw new Error(`Type error: ${name} not bound`)    
                }
            } else if (varEnv.has(name)){
                return varEnv.get(e.name)
            } else {
                throw new Error(`Type error: ${name} not bound`)
            }
        }
    }
}

export function execute(varEnv: L.VarEnv, pointEnv: L.PointEnv, prog: L.Prog): Output {
    const output: Output = []
    for (const s of prog) {
        switch (s.tag) {
            case 'define': {
                const v = evaluate(varEnv, pointEnv, s.exp)
                if(s.type === L.tyint){
                    varEnv.set(s.id, v)
                } else if(s.type === L.typointer){
                    if(v.tag === "int"){
                        let index = pointEnv.set(v)
                        varEnv.set(s.id, L.pointer(index, s.id))
                    } else if(v.tag === 'pointer'){
                        let ptr = varEnv.get(v.name)
                        varEnv.set(s.id, L.pointer((ptr as L.Pointer).index, s.id))
                    }
                }
                break
            }
            case 'assign':{
                const rhs = evaluate(varEnv, pointEnv, s.exp)
                if (s.loc.tag === 'var') {
                  if (varEnv.has(s.loc.name)) {
                    if(varEnv.get(s.loc.name).tag === 'int'){
                        varEnv.update(s.loc.name, rhs)
                    } else if (varEnv.get(s.loc.name).tag === 'pointer'){
                        if(rhs.tag === 'int'){
                            pointEnv.update((varEnv.get(s.loc.name) as L.Pointer).index, rhs)    
                        } else if (rhs.tag === 'pointer'){
                            varEnv.update(s.loc.name, L.pointer(rhs.index, s.loc.name))
                        }
                    } else {
                        throw new Error(`Runtime error: unbound variable: ${s.loc.name}`)
                    }
                  } else {
                    throw new Error(`Runtime error: unbound variable: ${s.loc.name}`)
                  }
                } else {
                  throw new Error(`Runtime error: cannot assign to non-location '${L.prettyExp(s.loc)}'}`)
                }
                break
            }
            case 'print': {
                const v = evaluate(varEnv, pointEnv, s.exp)
                output.push(L.prettyValue(v))
                break
            }
        }
        pointEnv.garbColl(varEnv)
    }
    return output
}