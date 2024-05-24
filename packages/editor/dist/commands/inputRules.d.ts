export declare const buildInputRules: () => import("prosemirror-state").Plugin<{
    transform: import("prosemirror-state").Transaction;
    from: number;
    to: number;
    text: string;
} | null>;
