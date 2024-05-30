import { DecorationSet, Decoration, EditorView } from 'prosemirror-view';
import { PluginKey, Plugin, Selection, EditorState } from 'prosemirror-state';
import { Schema, Fragment, Slice } from 'prosemirror-model';
import { keymap } from 'prosemirror-keymap';
import { undo, redo, history } from 'prosemirror-history';
import ReactDOM from 'react-dom/client';
import React, { useRef, useEffect } from 'react';
import hljs from 'highlight.js';
import { textblockTypeInputRule, wrappingInputRule, inputRules } from 'prosemirror-inputrules';
import { chainCommands, newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock, baseKeymap } from 'prosemirror-commands';
import { canSplit } from 'prosemirror-transform';

function _construct(t, e, r) {
  if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
  var o = [null];
  o.push.apply(o, e);
  var p = new (t.bind.apply(t, o))();
  return p;
}
function _isNativeReflectConstruct() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
  } catch (t) {}
  return (_isNativeReflectConstruct = function () {
    return !!t;
  })();
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike  ) {
      if (it) o = it;
      var i = 0;
      var F = function () {};
      return {
        s: F,
        n: function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function (e) {
          throw e;
        },
        f: F
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var normalCompletion = true,
    didErr = false,
    err;
  return {
    s: function () {
      it = it.call(o);
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

var codeBlock = {
  content: 'text*',
  group: 'block',
  marks: '',
  code: true,
  defining: true,
  draggable: false,
  selectable: true,
  isolating: true,
  attrs: {
    language: {
      "default": 'plaintext'
    },
    theme: {
      "default": 'dark'
    },
    showLineNumber: {
      "default": true
    }
  },
  toDOM: function toDOM(node) {
    return ['pre', {
      'data-lanaguage': node.attrs.language,
      'data-theme': node.attrs.theme,
      'data-show-line-number': node.attrs.showLineNumber,
      'data-node-type': 'code_block'
    }, ['code', 0]];
  },
  parseDOM: [{
    tag: 'pre',
    preserveWhitespace: 'full',
    getAttrs: function getAttrs(domNode) {
      return {
        language: domNode.getAttribute('data-language'),
        theme: domNode.getAttribute('data-theme'),
        showLineNumber: domNode.getAttribute('data-show-line-number')
      };
    }
  }]
};
var createCodeBlockCmd = function createCodeBlockCmd(state, dispatch, view) {
  var lastLanguage = state.schema.cached.lastLanguage || 'plaintext';
  var codeBlock = state.schema.nodes.codeBlock;
  var codeBlockNode = codeBlock.create({
    language: lastLanguage
  });
  var tr = state.tr;
  tr.replaceSelectionWith(codeBlockNode);
  tr.scrollIntoView();
  if (dispatch) {
    dispatch(tr);
    return true;
  }
  return false;
};

function createElement(tag) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var arg = arguments.length > 2 ? arguments[2] : undefined;
  var children = [];
  for (var _len = arguments.length, rest = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    rest[_key - 3] = arguments[_key];
  }
  if (Array.isArray(arg)) children = arg;else children = arg ? [arg].concat(rest) : [];
  var dom = document.createElement(tag);
  for (var _i = 0, _Object$keys = Object.keys(options); _i < _Object$keys.length; _i++) {
    var key = _Object$keys[_i];
    var val = options[key];
    if (val === null || val === undefined) continue;
    if (typeof val === 'function') {
      dom.addEventListener(key.replace('on', ''), val);
    } else {
      dom.setAttribute(key, val + '');
    }
  }
  var fragment = document.createDocumentFragment();
  var _iterator = _createForOfIteratorHelper(children),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var child = _step.value;
      fragment.append(child);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  dom.appendChild(fragment);
  return dom;
}
var updateElement = function updateElement(dom, attrs) {
  for (var _i2 = 0, _Object$keys2 = Object.keys(attrs); _i2 < _Object$keys2.length; _i2++) {
    var key = _Object$keys2[_i2];
    dom.setAttribute(key, attrs[key]);
  }
};

var taskItem = {
  content: 'paragraph block*',
  group: 'block',
  attrs: {
    checked: {
      "default": false
    }
  },
  toDOM: function toDOM(node) {
    return ['li', {
      "class": 'task-item'
    }, ['div', {
      "class": 'task-item-checkbox'
    }, ['input', {
      type: 'checkbox',
      checked: node.attrs.checked ? 'checked' : null,
      contenteditable: 'false',
      tabindex: '-1'
    }]], ['div', {
      "class": 'task-item-content'
    }, 0]];
  },
  parseDOM: [{
    tag: 'li.task-list-item',
    getAttrs: function getAttrs(dom) {
      var _dom$querySelector;
      return {
        checked: (_dom$querySelector = dom.querySelector('input[type=checkbox]')) === null || _dom$querySelector === void 0 ? void 0 : _dom$querySelector.checked
      };
    }
  }]
};
var taskList = {
  content: 'taskItem+',
  group: 'block',
  toDOM: function toDOM() {
    return ['ul', {
      "class": 'task-list'
    }, 0];
  },
  parseDOM: [{
    tag: 'ul.task-list'
  }]
};
var createTaskList = function createTaskList(state, dispatch, view) {
  var _state$schema$nodes = state.schema.nodes,
    taskList = _state$schema$nodes.taskList,
    taskItem = _state$schema$nodes.taskItem;
  if (dispatch) {
    dispatch(state.tr.replaceSelectionWith(taskList.create(null, taskItem.createAndFill())).scrollIntoView());
    return true;
  }
  return false;
};
var TaskItemView = /*#__PURE__*/function () {
  function TaskItemView() {
    _classCallCheck(this, TaskItemView);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var node = args[0],
      view = args[1],
      getPos = args[2];
    this.node = node;
    this.contentDOM = createElement('div', {
      "class": 'task-item-content'
    });
    this.view = view;
    this.dom = createElement('li', {
      "class": 'task-item'
    }, createElement('div', {
      "class": 'task-item-checkbox'
    }, createElement('input', {
      type: 'checkbox',
      checked: node.attrs.checked ? 'true' : void 0,
      onchange: function onchange(e) {
        var _e$target;
        var val = (_e$target = e.target) === null || _e$target === void 0 ? void 0 : _e$target.checked;
        var tr = view.state.tr;
        view.dispatch(tr.setNodeAttribute(getPos(), 'checked', !!val));
      }
    })), this.contentDOM);
  }
  return _createClass(TaskItemView, [{
    key: "update",
    value: function update(node, decorations, innerDecorations) {
      if (node.type !== this.node.type) return false;
      updateElement(this.dom, {
        "class": "task-item".concat(node.attrs.checked ? ' checked' : '')
      });
      return true;
    }
  }]);
}();
var TaskItemViewConstructor = function TaskItemViewConstructor() {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }
  return _construct(TaskItemView, args);
};

var getCellAttrs = function getCellAttrs(dom, extraAttrs) {
  if (typeof dom === 'string') return {};
  var widthAttr = dom.getAttribute('data-colwidth');
  var widths = widthAttr && /^\d+(,\d+)*$/.test(widthAttr) ? widthAttr.split(',').map(Number) : null;
  var colspan = Number(dom.getAttribute('colspan') || 1);
  var rowspan = Number(dom.getAttribute('rowspan') || 1);
  var result = {
    colspan: colspan,
    rowspan: rowspan,
    colwidth: widths && widths.length == colspan ? widths : null
  };
  for (var _i = 0, _Object$keys = Object.keys(extraAttrs); _i < _Object$keys.length; _i++) {
    var prop = _Object$keys[_i];
    var getter = extraAttrs[prop].getFromDOM;
    var value = getter && getter(dom);
    if (value !== null) result[prop] = value;
  }
  return result;
};
var setCellAttrs = function setCellAttrs(node, extraAttrs) {
  var attrs = {};
  if (node.attrs.colspan != 1) attrs.colspan = node.attrs.colspan;
  if (node.attrs.rowspan != 1) attrs.rowspan = node.attrs.rowspan;
  if (node.attrs.colwidth) attrs['data-colwidth'] = node.attrs.colwidth.join(',');
  for (var prop in extraAttrs) {
    var setter = extraAttrs[prop].setDOMAttr;
    if (setter) setter(node.attrs[prop], attrs);
  }
  return attrs;
};
var tableNodes = function tableNodes(options) {
  var extraAttrs = options.cellAttributes || {};
  var cellAttrs = {
    colspan: {
      "default": 1
    },
    rowspan: {
      "default": 1
    },
    colwidth: {
      "default": null
    }
  };
  for (var _i2 = 0, _Object$keys2 = Object.keys(extraAttrs); _i2 < _Object$keys2.length; _i2++) {
    var prop = _Object$keys2[_i2];
    cellAttrs[prop] = {
      "default": extraAttrs[prop]["default"]
    };
  }
  return {
    table: {
      content: 'tableRow+',
      tableRole: 'table',
      isolating: true,
      group: options.tableGroup,
      parseDOM: [{
        tag: 'table'
      }],
      toDOM: function toDOM() {
        return ['table', ['tbody', 0]];
      }
    },
    tableRow: {
      content: '(tableCell | tableHeader)*',
      tableRole: 'row',
      parseDOM: [{
        tag: 'tr'
      }],
      toDOM: function toDOM() {
        return ['tr', 0];
      }
    },
    tableCell: {
      content: options.cellContent,
      attrs: cellAttrs,
      tableRow: 'cell',
      isolating: true,
      parseDOM: [{
        tag: 'td',
        getAttrs: function getAttrs(dom) {
          return getCellAttrs(dom, extraAttrs);
        }
      }],
      toDOM: function toDOM(node) {
        return ['td', setCellAttrs(node, extraAttrs), 0];
      }
    },
    tableHeader: {
      content: options.cellContent,
      attrs: cellAttrs,
      tableRole: 'headerCell',
      isolating: true,
      parseDOM: [{
        tag: 'th',
        getAttrs: function getAttrs(dom) {
          return getCellAttrs(dom, extraAttrs);
        }
      }],
      toDOM: function toDOM(node) {
        return ['th', setCellAttrs(node, extraAttrs), 0];
      }
    }
  };
};

var schema = new Schema({
  nodes: _objectSpread2({
    // 整个文档
    doc: {
      // 文档内容规定必须是 block 类型的节点（block 与 HTML 中的 block 概念差不多） `+` 号代表可以有一个或多个（规则类似正则）
      content: 'block+'
    },
    // 文档段落
    paragraph: {
      // 段落内容规定必须是 inline 类型的节点（inline 与 HTML 中 inline 概念差不多）, `*` 号代表可以有 0 个或多个（规则类似正则）
      content: 'inline*',
      // 分组：当前节点所在的分组为 block，意味着它是个 block 节点
      group: 'block',
      // 渲染为 html 时候，使用 p 标签渲染，第二个参数 0 念做 “洞”，类似 vue 中 slot 插槽的概念，
      // 证明它有子节点，以后子节点就填充在 p 标签中
      toDOM: function toDOM() {
        return ['p', 0];
      },
      // 从别处复制过来的富文本，如果包含 p 标签，将 p 标签序列化为当前的 p 节点后进行展示
      parseDOM: [{
        tag: 'p'
      }]
    },
    codeBlock: codeBlock,
    blockQuote: {
      content: 'paragraph block*',
      group: 'block',
      toDOM: function toDOM(node) {
        return ['blockquote', 0];
      },
      parseDOM: [{
        tag: 'blockquote'
      }]
    },
    // 段落中的文本
    text: {
      // 当前处于 inline 分株，意味着它是个 inline 节点。代表输入的文本
      group: 'inline'
    },
    // 1-6 级标题
    heading: {
      // attrs 与 vue/react 组件中 props 的概念类似，代表定义当前节点有哪些属性，这里定义了 level 属性，默认值 1
      attrs: {
        level: {
          "default": 1
        }
      },
      // 当前节点内容可以是 0 个或多个 inline 节点
      content: 'inline*',
      // 当前节点分组为 block 分组
      group: 'block',
      // defining: 特殊属性，为 true 代表如果在当前标签内（以 h1 为例），全选内容，直接粘贴新的内容后，这些内容还会被 h1 标签包裹
      // 如果为 false, 整个 h1 标签（包括内容与标签本身）将会被替换为其他内容，删除亦如此。
      // 还有其他的特殊属性，后续细说
      defining: true,
      // 转为 html 标签时，根据当前的 level 属性，生成对应的 h1 - h6 标签，节点的内容填充在 h 标签中（“洞”在）。
      toDOM: function toDOM(node) {
        var tag = "h".concat(node.attrs.level);
        return [tag, 0];
      },
      // 从别处复制进来的富文本内容，根据标签序列化为当前 heading 节点，并填充对应的 level 属性
      parseDOM: [{
        tag: 'h1',
        attrs: {
          level: 1
        }
      }, {
        tag: 'h2',
        attrs: {
          level: 2
        }
      }, {
        tag: 'h3',
        attrs: {
          level: 3
        }
      }, {
        tag: 'h4',
        attrs: {
          level: 4
        }
      }, {
        tag: 'h5',
        attrs: {
          level: 5
        }
      }, {
        tag: 'h6',
        attrs: {
          level: 6
        }
      }]
    },
    ordered_list: {
      content: 'list_item+',
      group: 'block',
      attrs: {
        order: {
          "default": 1
        }
      },
      parseDOM: [{
        tag: 'ol',
        getAttrs: function getAttrs(dom) {
          var _dom$getAttribute;
          return {
            order: dom.hasAttribute('start') ? ((_dom$getAttribute = dom.getAttribute) === null || _dom$getAttribute === void 0 ? void 0 : _dom$getAttribute.call(dom, 'start')) || '' : 1
          };
        }
      }],
      toDOM: function toDOM(node) {
        return node.attrs.order == 1 ? ['ol', 0] : ['ol', {
          start: node.attrs.order
        }, 0];
      }
    },
    bullet_list: {
      content: 'list_item+',
      group: 'block',
      parseDOM: [{
        tag: 'ul'
      }],
      toDOM: function toDOM() {
        return ['ul', 0];
      }
    },
    list_item: {
      content: 'paragraph block*',
      parseDOM: [{
        tag: 'li'
      }],
      toDOM: function toDOM() {
        return ['li', 0];
      }
    },
    taskList: taskList,
    taskItem: taskItem
  }, tableNodes({
    tableGroup: 'block',
    cellContent: 'block+',
    cellAttributes: {}
  })),
  // 除了上面定义 node 节点，一些富文本样式，可以通过 marks 定义
  marks: {
    // 文本加粗
    strong: {
      // 对于加粗的部分，使用 strong 标签包裹，加粗的内容位于 strong 标签内(这里定义的 0 与上面一致，也念做 “洞”，也类似 vue 中的 slot)
      toDOM: function toDOM() {
        return ['strong', 0];
      },
      // 从别的地方复制过来的富文本，如果有 strong 标签，则被解析为一个 strong mark
      parseDOM: [{
        tag: 'strong'
      }]
    }
  }
});

var languages = ['plaintext', 'javascript', 'html', 'markdown', 'typescript', 'python', 'java'];
var CodeBlock = function CodeBlock(_ref) {
  var nodeView = _ref.nodeView;
  useRef(null);
  var _nodeView$node$attrs = nodeView.node.attrs,
    language = _nodeView$node$attrs.language;
    _nodeView$node$attrs.showLineNumber;
  useEffect(function () {
    console.log('mount');
    // nodeView.contentDOM = $code.current;
  }, []);
  return React.createElement(React.Fragment, null, React.createElement("div", {
    className: "code-block-menu"
  }, React.createElement("div", {
    className: "code-block-menu-content"
  }, React.createElement("select", {
    className: 'code-type-select',
    onChange: function onChange(e) {
      var _nodeView$view = nodeView.view,
        state = _nodeView$view.state,
        dispatch = _nodeView$view.dispatch;
      var language = e.target.value;
      var pos = nodeView.getPos();
      state.schema.cached.lastLanguage = language;
      if (pos || pos == 0) {
        var tr = state.tr.setNodeAttribute(pos, 'language', language);
        dispatch(tr);
        setTimeout(function () {
          return nodeView.view.focus();
        }, 16);
      }
    }
  }, languages.map(function (lang) {
    return React.createElement("option", {
      value: lang,
      selected: lang === language
    }, lang);
  }))), React.createElement("div", {
    className: "code-block-menu-tile"
  }, React.createElement("div", {
    className: 'btn',
    onClick: function onClick() {
      navigator.clipboard.writeText(nodeView.node.textContent).then(function () {
        alert('copied!');
      });
    }
  }, "\u590D\u5236"))));
};
var setup = function setup(nodeView) {
  nodeView.root.render(React.createElement(CodeBlock, {
    nodeView: nodeView
  }));
};

var CodeBlockView = /*#__PURE__*/function () {
  function CodeBlockView() {
    _classCallCheck(this, CodeBlockView);
    _defineProperty(this, "name", 'blockCode');
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var node = args[0],
      view = args[1],
      getPos = args[2];
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.contentDOM = createElement('code', {
      "class": 'scrollbar',
      'data-language': node.attrs.language,
      'data-theme': node.attrs.theme,
      'data-show-line-number': node.attrs.showLineNumber,
      'data-node-type': 'codeBlock'
    });
    this.menu = createElement('div', {
      "class": 'code-block-menu-container'
    });
    this.dom = createElement('pre', {
      "class": 'docucraft-codeblock hljs',
      'data-language': node.attrs.language,
      'data-theme': node.attrs.theme,
      'data-show-line-number': node.attrs.showLineNumber,
      'data-node-type': 'codeBlock'
    });
    this.root = ReactDOM.createRoot(this.menu);
    this.dom.appendChild(this.menu);
    this.dom.appendChild(this.contentDOM);
    this.renderComponent();
  }
  return _createClass(CodeBlockView, [{
    key: "renderComponent",
    value: function renderComponent() {
      setup(this);
    }
  }, {
    key: "update",
    value: function update(node, decorations, innerDecorations) {
      if (node.type !== this.node.type) return false;
      this.node = node;
      updateElement(this.dom, {
        'data-language': node.attrs.language,
        'data-theme': node.attrs.theme,
        'data-show-line-number': node.attrs.showLineNumber
      });
      updateElement(this.contentDOM, {
        'data-language': node.attrs.language,
        'data-theme': node.attrs.theme,
        'data-show-line-number': node.attrs.showLineNumber
      });
      this.renderComponent();
      return true;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.root.unmount();
    }
  }]);
}();
var CodeBlockViewConstructor = function CodeBlockViewConstructor() {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }
  return _construct(CodeBlockView, args);
};

var HighlightRenderer = /*#__PURE__*/function () {
  // 这里是 hljs-，是从 _emitter.options.classPrefix 获取的

  function HighlightRenderer(tree, blockStartPos) {
    _classCallCheck(this, HighlightRenderer);
    // 当前位置
    // 最终匹配好的所有 renderInfo
    _defineProperty(this, "finishedRenderInfos", []);
    // 正在进行加了 from 没有加 to 的这些，会一次入栈
    _defineProperty(this, "trackingRenderInfoStack", []);
    // 这里实例化的时候直接记录初始位置，这里开始的位置是 code_block 开始位置 + 1,原因是还是之前的 node 坐标系统，
    // 具体的文本是 <code_block>keyword 这样的，在 code_block 标签后面开始的，code_block开始位置是标签之前
    this.currentPos = blockStartPos + 1;
    this.classPrefix = tree.options.classPrefix;
    // 直接开始遍历
    tree.walk(this);
  }
  // add Text 就开始更新位置
  return _createClass(HighlightRenderer, [{
    key: "addText",
    value: function addText(text) {
      console.log(text, 'text');
      if (text) {
        this.currentPos += text.length;
      }
    }
    // open 时候就创建 render Info，并入栈
  }, {
    key: "openNode",
    value: function openNode(node) {
      var _this = this;
      // node.scope is className
      console.log(node, 'node');
      if (!node.scope) return;
      // create new render info, which corresponds to HTML open tag.
      var renderInfo = this.newRenderInfo({
        from: this.currentPos,
        classNames: node.scope.split('.').filter(function (item) {
          return item;
        }).map(function (item) {
          return _this.classPrefix + item;
        }),
        scope: node.scope
      });
      // push tracking stack
      this.trackingRenderInfoStack.push(renderInfo);
    }
    // close 就出栈补充 to 信息，补充完丢带完成的数组中
  }, {
    key: "closeNode",
    value: function closeNode(node) {
      console.log(node, 'node');
      if (!node.scope) return;
      var renderInfo = this.trackingRenderInfoStack.pop();
      if (!renderInfo) throw new Error('[highlight-code-plugin-error]: Cannot close node!');
      if (node.scope !== renderInfo.scope) throw new Error('[highlight-code-plugin-error]: Matching error!');
      renderInfo.to = this.currentPos;
      // finish a render info, which corresponds to html close tag.
      this.finishedRenderInfos.push(renderInfo);
    }
    // 快捷的创建 renderINfo 的辅助方法
  }, {
    key: "newRenderInfo",
    value: function newRenderInfo(info) {
      return _objectSpread2({
        from: this.currentPos,
        to: -1,
        classNames: [],
        scope: ''
      }, info);
    }
    // 获取 value
  }, {
    key: "value",
    get: function get() {
      return this.finishedRenderInfos;
    }
  }]);
}();

var highlightCodePluginKey = new PluginKey('highlight-code');
function findNodesByType(doc, type) {
  var nodes = [];
  var schema = doc.type.schema;
  var tempTypes = Array.isArray(type) ? type : [type];
  var types = tempTypes.map(function (item) {
    return typeof item === 'string' ? schema.nodes[item] : item;
  }).filter(Boolean);
  doc.descendants(function (node, pos) {
    if (types.includes(node.type)) {
      nodes.push({
        node: node,
        pos: pos
      });
    }
  });
  return nodes;
}
function highlightCodePlugin() {
  function getDecs(doc) {
    if (!doc || !doc.nodeSize) {
      return [];
    }
    var blocks = findNodesByType(doc, 'codeBlock');
    var decorations = [];
    blocks.forEach(function (block) {
      var language = block.node.attrs.language;
      if (language && !hljs.getLanguage(language)) language = 'plaintext';
      var highlightResult = language ? hljs.highlight(block.node.textContent, {
        language: language
      }) : hljs.highlightAuto(block.node.textContent);
      var emitter = highlightResult._emitter;
      var renderer = new HighlightRenderer(emitter, block.pos);
      if (renderer.value.length) {
        var blockDecorations = renderer.value.map(function (renderInfo) {
          return Decoration.inline(renderInfo.from, renderInfo.to, {
            "class": renderInfo.classNames.join(' ')
          });
        });
        decorations = decorations.concat(blockDecorations);
      }
      // if (block.node.attrs.showLineNumber) {
      //   const lineNumberDecorations = createLineNumberDecorations(block);
      //   decorations = decorations.concat(lineNumberDecorations);
      // }
    });
    return decorations;
  }
  return new Plugin({
    key: highlightCodePluginKey,
    state: {
      init: function init(config, instance) {
        var decorations = getDecs(instance.doc);
        return {
          decorations: DecorationSet.create(instance.doc, decorations)
        };
      },
      apply: function apply(tr, value, oldState, newState) {
        if (!tr.docChanged) return value;
        var decorations = getDecs(newState.doc);
        return {
          decorations: DecorationSet.create(tr.doc, decorations)
        };
      }
    },
    props: {
      decorations: function decorations(state) {
        var pluginState = highlightCodePluginKey.getState(state);
        return pluginState === null || pluginState === void 0 ? void 0 : pluginState.decorations;
      }
    }
  });
}

// 定义输入规则
var headingRules = [textblockTypeInputRule(/^#\s$/, schema.nodes.heading, {
  level: 1
}), textblockTypeInputRule(/^##\s$/, schema.nodes.heading, {
  level: 2
}), textblockTypeInputRule(/^###\s$/, schema.nodes.heading, {
  level: 3
}), textblockTypeInputRule(/^####\s$/, schema.nodes.heading, {
  level: 4
}), textblockTypeInputRule(/^#####\s$/, schema.nodes.heading, {
  level: 5
}), textblockTypeInputRule(/^######\s$/, schema.nodes.heading, {
  level: 6
})];
var listRules = [wrappingInputRule(/^\s*([-+*])\s$/, schema.nodes.bullet_list), wrappingInputRule(/^(\d+)\.\s$/, schema.nodes.ordered_list, function (match) {
  return {
    order: +match[1]
  };
}), wrappingInputRule(/^\-\[\]\s$/, schema.nodes.taskList)];
var map = {
  javascript: 'javascript',
  typescript: 'typescript',
  rust: 'rust',
  golang: 'golang',
  python: 'python',
  ruby: 'ruby',
  php: 'php',
  html: 'html',
  css: 'css',
  markdown: 'markdown',
  java: 'java',
  'c++': 'c++',
  'c#': 'c#',
  c: 'c',
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  go: 'golang',
  rs: 'rust',
  plaintext: 'plaintext'
};
var mapTolang = function mapTolang(lang) {
  return map[lang] || 'plaintext';
};
var rules = [].concat(headingRules, listRules, [textblockTypeInputRule(/^```([\w+#]*)\s$/, schema.nodes.codeBlock, function (match) {
  return {
    language: mapTolang(match[1])
  };
}), wrappingInputRule(/^>\s$/, schema.nodes.blockQuote)]);
var buildInputRules = function buildInputRules() {
  return inputRules({
    rules: rules
  });
};

var splitListItem = function splitListItem(itemType, itemAttrs) {
  return function (state, dispatch) {
    var _state$selection = state.selection,
      $from = _state$selection.$from,
      $to = _state$selection.$to,
      node = _state$selection.node;
    if (node && node.isBlock || $from.depth < 2 || !$from.sameParent($to)) return false;
    var grandParent = $from.node(-1);
    if (grandParent.type != itemType && grandParent.type != schema.nodes.taskItem) return false;
    var liCount = $from.node(-2).childCount;
    if ($from.parent.content.size == 0 && $from.node(-1).childCount == $from.indexAfter(-1)) {
      // In an empty block. If this is a nested list, the wrapping
      // list item should be split. Otherwise, bail out and let next
      // command handle lifting.
      if ($from.depth == 3 || $from.node(-3).type != itemType || $from.index(-2) != liCount - 1) return false;
      if (dispatch) {
        var wrap = Fragment.empty;
        var depthBefore = $from.index(-1) ? 1 : $from.index(-2) ? 2 : 3;
        // Build a fragment containing empty versions of the structure
        // from the outer list item to the parent node of the cursor
        for (var d = $from.depth - depthBefore; d >= $from.depth - 3; d--) wrap = Fragment.from($from.node(d).copy(wrap));
        // wrap = Fragment.from($from.node($from.depth - depthBefore).copy(wrap));
        var depthAfter = $from.indexAfter(-1) < $from.node(-2).childCount ? 1 : $from.indexAfter(-2) < $from.node(-3).childCount ? 2 : 3;
        // Add a second list item with an empty default start node
        wrap = wrap.append(Fragment.from(itemType.createAndFill()));
        var start = $from.before($from.depth - (depthBefore - 1));
        var s = new Slice(wrap, 4 - depthBefore, 0);
        var _tr = state.tr.replace(start, $from.after(-depthAfter), s);
        var sel = -1;
        _tr.doc.nodesBetween(start, _tr.doc.content.size, function (node, pos) {
          if (sel > -1) return false;
          if (node.isTextblock && node.content.size == 0) sel = pos + 1;
        });
        if (sel > -1) _tr.setSelection(Selection.near(_tr.doc.resolve(sel)));
        dispatch(_tr.scrollIntoView());
      }
      return true;
    }
    var nextType = $to.pos == $from.end() ? grandParent.contentMatchAt(0).defaultType : null;
    var tr = state.tr["delete"]($from.pos, $to.pos);
    var types = nextType ? [null, {
      type: nextType
    }] : undefined;
    if (!canSplit(tr.doc, $from.pos, 2, types)) return false;
    if (dispatch) dispatch(tr.split($from.pos, 2, types).scrollIntoView());
    return true;
  };
};
var myKeymap = _objectSpread2(_objectSpread2({}, baseKeymap), {}, {
  Enter: chainCommands(splitListItem(schema.nodes.list_item), newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock),
  'Mod-z': undo,
  'Mod-y': redo,
  Tab: function Tab(state, dispatch) {
    var _state$selection2 = state.selection,
      $from = _state$selection2.$from,
      $to = _state$selection2.$to;
    if (!$from.sameParent($to) || $from.parent.type !== schema.nodes.codeBlock) return false;
    if (dispatch) {
      dispatch(state.tr.insertText('\t'));
      return true;
    }
    return false;
  },
  'Ctrl-Shift-L': createTaskList
});

var MenuItem = /*#__PURE__*/function () {
  function MenuItem(view, spec) {
    var _this = this;
    _classCallCheck(this, MenuItem);
    this.view = view;
    this.spec = spec;
    var btn = document.createElement('button');
    btn.setAttribute('class', spec["class"] || '');
    btn.addEventListener('click', function (event) {
      spec.handler({
        view: _this.view,
        state: _this.view.state,
        dispatch: view.dispatch,
        tr: view.state.tr
      }, event);
    });
    btn.classList.add('menu-item');
    btn.innerText = spec.label;
    this.dom = btn;
  }
  return _createClass(MenuItem, [{
    key: "update",
    value: function update(view, state) {
      var _this$spec$update, _this$spec;
      this.view = view;
      (_this$spec$update = (_this$spec = this.spec).update) === null || _this$spec$update === void 0 || _this$spec$update.call(_this$spec, view, state, this.dom);
    }
  }]);
}();

var MenuGroup = /*#__PURE__*/function () {
  function MenuGroup(view, spec) {
    var _this = this;
    _classCallCheck(this, MenuGroup);
    this.view = view;
    this.spec = spec;
    var dom = document.createElement('div');
    dom.setAttribute('class', spec["class"] || '');
    dom.classList.add('menu-group');
    this.dom = dom;
    this.menus = spec.menus.map(function (menuSpec) {
      return new MenuItem(_this.view, menuSpec);
    });
    this.menus.forEach(function (menu) {
      return dom.appendChild(menu.dom);
    });
  }
  return _createClass(MenuGroup, [{
    key: "update",
    value: function update(view, state) {
      this.view = view;
      this.menus.forEach(function (menu) {
        return menu.update(view, state);
      });
    }
  }]);
}();

var createTable = function createTable(rows, columns) {
  return function (state, dispatch, view) {
    var _state$schema$nodes = state.schema.nodes,
      table = _state$schema$nodes.table,
      tableRow = _state$schema$nodes.tableRow,
      tableHeader = _state$schema$nodes.tableHeader,
      tableCell = _state$schema$nodes.tableCell,
      paragraph = _state$schema$nodes.paragraph;
    if (dispatch) {
      dispatch(state.tr.replaceSelectionWith(table.create(null, Array(rows + 1).fill(null).map(function (_, row) {
        return tableRow.create(null, Array(columns).fill(null).map(function (_, col) {
          return (row === 0 ? tableHeader : tableCell).create(null, paragraph.create(null, state.schema.text('cell row ' + row + ', col ' + col)));
        }));
      }))).scrollIntoView());
      return true;
    }
    return false;
  };
};

var ToolBar = /*#__PURE__*/function () {
  function ToolBar(view, spec) {
    var _this = this;
    _classCallCheck(this, ToolBar);
    this.view = view;
    this.spec = spec;
    var dom = document.createElement('div');
    dom.setAttribute('class', this.spec["class"] || '');
    dom.classList.add('toolbar');
    this.dom = dom;
    this.groups = this.spec.groups.map(function (menuGroupSpec) {
      return new MenuGroup(_this.view, menuGroupSpec);
    });
    this.groups.forEach(function (menuGroup) {
      return dom.appendChild(menuGroup.dom);
    });
    this.render();
  }
  return _createClass(ToolBar, [{
    key: "render",
    value: function render() {
      if (this.view.dom.parentNode) {
        this.view.dom.parentNode.insertBefore(this.dom, this.view.dom);
      }
    }
  }, {
    key: "update",
    value: function update(view, state) {
      this.view = view;
      this.groups.forEach(function (group) {
        return group.update(view, state);
      });
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this$dom$parentNode;
      (_this$dom$parentNode = this.dom.parentNode) === null || _this$dom$parentNode === void 0 || _this$dom$parentNode.removeChild(this.dom);
    }
  }]);
}();
var buildToolbar = function buildToolbar() {
  var toolbar;
  var toolbarPlugin = new Plugin({
    key: new PluginKey('toolbar'),
    view: function view(_view) {
      toolbar = new ToolBar(_view, {
        groups: [{
          menus: [{
            label: '插入代码块',
            handler: function handler(_ref, event) {
              var state = _ref.state,
                dispatch = _ref.dispatch;
                _ref.view;
              createCodeBlockCmd(state, dispatch);
            }
          }, {
            label: '插入tasklist',
            handler: function handler(_ref2) {
              var state = _ref2.state,
                dispatch = _ref2.dispatch;
                _ref2.view;
              createTaskList(state, dispatch);
            }
          }, {
            label: '插入表格',
            handler: function handler(_ref3) {
              var state = _ref3.state,
                dispatch = _ref3.dispatch,
                view = _ref3.view;
              createTable(3, 4)(state, dispatch, view);
              // insertTable(state, dispatch);
            }
          }]
        }]
      });
      return toolbar;
    }
  });
  return {
    plugin: toolbarPlugin,
    update: function update(view, state) {
      var _toolbar;
      return (_toolbar = toolbar) === null || _toolbar === void 0 ? void 0 : _toolbar.update(view, state);
    },
    destroy: function destroy() {
      var _toolbar2;
      (_toolbar2 = toolbar) === null || _toolbar2 === void 0 || _toolbar2.destroy();
      toolbar = null;
    }
  };
};

// view.ts
var setupEditor = function setupEditor(el) {
  if (!el) return;
  var toolbar = buildToolbar();
  // 根据 schema 定义，创建 editorState 数据实例
  var editorState = EditorState.create({
    schema: schema,
    plugins: [buildInputRules(), keymap(myKeymap), history(), toolbar.plugin, highlightCodePlugin()]
  });
  // 创建编辑器视图实例，并挂在到 el 上
  var editorView = new EditorView(el, {
    state: editorState,
    dispatchTransaction: function dispatchTransaction(tr) {
      var newState = editorView.state.apply(tr);
      editorView.updateState(newState);
      toolbar.update(editorView, editorView.state);
    },
    nodeViews: {
      codeBlock: CodeBlockViewConstructor,
      taskItem: TaskItemViewConstructor
    }
  });
  return function () {
    editorView.destroy();
    toolbar.destroy();
  };
};

var index = (function () {
  return 'welocome';
});

export { index as default, setupEditor };
