interface RenderInfo {
    from: number;
    to: number;
    classNames: string[];
    scope: string;
}
export declare class HighlightRenderer {
    private currentPos;
    private finishedRenderInfos;
    private trackingRenderInfoStack;
    private classPrefix;
    constructor(tree: any, blockStartPos: number);
    addText(text: string): void;
    openNode(node: any): void;
    closeNode(node: {
        scope: string;
    }): void;
    newRenderInfo(info: Partial<RenderInfo>): RenderInfo;
    get value(): RenderInfo[];
}
export {};
