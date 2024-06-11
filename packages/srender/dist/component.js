import { scheduleUpdate } from './reconciler';
/**
 * @name Component
 * @description 组件基类，定义了构造函数和 setState
 */
export class Component {
    props;
    state;
    __fiber;
    constructor(props) {
        this.props = props || {};
    }
    setState(partialState) {
        scheduleUpdate(this, partialState);
    }
    render() {
        throw new Error('subclass must implement render method.');
    }
}
/**
 * 创建组件实例
 * @param {Fiber} fiber 从fiber创建组件实例
 */
export function createInstance(fiber) {
    const instance = new fiber.type(fiber.props);
    instance.__fiber = fiber;
    return instance;
}
