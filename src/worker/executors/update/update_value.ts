import { getDataType, variableFromPath, promiseReject, LogHelper } from "@worker/utils";
import { DATA_TYPE, ERROR_TYPE, IUpdateQuery } from "@/common";

export const updateValue = (query: IUpdateQuery, storedValue) => {
    let setValue = query.set;
    const mapSet = query.mapSet;
    if (mapSet) {
        const method = variableFromPath(mapSet);
        if (method) {
            const result = method(setValue, storedValue);
            if (result != null) {
                setValue = result;
            }
        }
        else {
            throw new LogHelper(ERROR_TYPE.MethodNotExist, mapSet);
        }
    }
    for (const key in setValue) {
        const columnSetValue = setValue[key];
        if (getDataType(columnSetValue) !== DATA_TYPE.Object) {
            storedValue[key] = columnSetValue;
        }
        else {
            for (const op in columnSetValue) {
                let value = columnSetValue[op];
                switch (op as any) {
                    case '+': storedValue[key] += value; break;
                    case '-': storedValue[key] -= value; break;
                    case '*': storedValue[key] *= value; break;
                    case '/': storedValue[key] /= value; break;
                    case '{push}': storedValue[key].push(value); break;
                    default: storedValue[key] = columnSetValue;
                }
                break;
            }
        }
    }
    return storedValue;
};