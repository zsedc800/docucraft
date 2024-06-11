export declare function isSubclassOf(subClass: Function, superClass: Function): boolean;
export declare const wait: <T extends (...args: any[]) => any>(fn: T, time: number) => (...args: Parameters<T>) => Promise<ReturnType<T>>;
