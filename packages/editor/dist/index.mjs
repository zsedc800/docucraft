import { DecorationSet, Decoration, EditorView } from 'prosemirror-view';
import { PluginKey, Plugin, Selection, EditorState } from 'prosemirror-state';
import { Schema, Fragment, Slice } from 'prosemirror-model';
import { keymap } from 'prosemirror-keymap';
import { splitBlock, baseKeymap } from 'prosemirror-commands';
import { history, undo, redo } from 'prosemirror-history';
import hljs from 'highlight.js';
import { textblockTypeInputRule, wrappingInputRule, inputRules } from 'prosemirror-inputrules';
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
      'data-lanaguage': node.attrs.lanaguage,
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
  var code_block = state.schema.nodes.code_block;
  var codeBlockNode = code_block.create({
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

// model.ts 文件命名暂时还是以 mvc 模式命名，方便理解，实际中 命名为 schema.ts 更好
var schema = new Schema({
  nodes: {
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
    code_block: codeBlock,
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
    }
  },
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

function createElement(tag, options, arg) {
  var children = [];
  for (var _len = arguments.length, rest = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    rest[_key - 3] = arguments[_key];
  }
  if (Array.isArray(arg)) children = arg;else children = arg ? [arg].concat(rest) : [];
  var dom = document.createElement(tag);
  for (var _i = 0, _Object$keys = Object.keys(options); _i < _Object$keys.length; _i++) {
    var key = _Object$keys[_i];
    var val = options[key];
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

var CodeBlockView = /*#__PURE__*/function () {
  function CodeBlockView() {
    _classCallCheck(this, CodeBlockView);
    _defineProperty(this, "name", 'block_code');
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var node = args[0],
      view = args[1],
      getPos = args[2];
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.renderUI(node);
  }
  return _createClass(CodeBlockView, [{
    key: "update",
    value: function update(node, decorations, innerDecorations) {
      this.node = node;
      if (node.type.name !== 'code_block') return false;
      this.updateUI(node);
      return true;
    }
  }, {
    key: "renderUI",
    value: function renderUI(node) {
      var _this = this;
      // pre-wrapper
      this.dom = createElement('pre', {
        'data-language': node.attrs.language,
        'data-theme': node.attrs.theme,
        'data-show-line-number': node.attrs.showLineNumber,
        'data-node-type': 'code_block'
      });
      // code-meanu
      var menuContainer = createElement('div', {
        "class": 'code-block-menu-container'
      }, createElement('div', {
        "class": 'code-block-menu'
      }, createElement('select', {
        "class": 'code-name-select',
        onchange: function onchange(event) {
          var _this$view = _this.view,
            state = _this$view.state,
            dispatch = _this$view.dispatch;
          var language = event.target.value;
          var pos = _this.getPos();
          _this.view.state.schema.cached.lastLanguage = language;
          if (pos) {
            var tr = state.tr.setNodeAttribute(pos, 'language', language);
            dispatch(tr);
            setTimeout(function () {
              return _this.view.focus();
            }, 16);
          }
        }
      }, ['plaintext', 'javascript', 'html', 'markdown', 'typescript', 'python', 'java'].map(function (item) {
        return createElement('option', {
          value: item,
          selected: item === node.attrs.language
        }, item);
      })), createElement('div', {
        "class": 'code-menu-right'
      }, createElement('select', {
        "class": 'show-line-number-select',
        onchange: function onchange(event) {
          var _this$view2 = _this.view,
            state = _this$view2.state,
            dispatch = _this$view2.dispatch;
          var showLineNumber = event.target.value === 'true';
          var pos = _this.getPos();
          if (pos) {
            var tr = state.tr.setNodeAttribute(pos, 'showLineNumber', showLineNumber);
            dispatch(tr);
            setTimeout(function () {
              return _this.view.focus();
            }, 16);
          }
        }
      }, [{
        value: 'true',
        label: '展示行号'
      }, {
        value: 'false',
        label: '隐藏行号'
      }].map(function (item) {
        return createElement('option', {
          selected: item.value === node.attrs.showLineNumber.toString(),
          value: item.value
        }, item.label);
      })), createElement('button', {
        "class": 'copy-btn',
        onmousedown: function onmousedown() {
          navigator.clipboard.writeText(_this.node.textContent).then(function () {
            alert('copied!');
          });
        }
      }, 'copy'))));
      // content dom
      var code = createElement('code', {
        "class": "code-block language-typescript ".concat(node.attrs.showLineNumber ? 'show-line-number' : ''),
        lang: node.attrs.language
      });
      this.contentDOM = code;
      this.dom.appendChild(menuContainer);
      this.dom.appendChild(code);
    }
  }, {
    key: "updateUI",
    value: function updateUI(node) {
      var _this$contentDOM, _this$contentDOM3;
      var _node$attrs = node.attrs,
        showLineNumber = _node$attrs.showLineNumber,
        language = _node$attrs.language;
      var showLineNumberClass = 'show-line-number';
      if (showLineNumber && !((_this$contentDOM = this.contentDOM) !== null && _this$contentDOM !== void 0 && _this$contentDOM.classList.contains(showLineNumberClass))) {
        var _this$contentDOM2;
        (_this$contentDOM2 = this.contentDOM) === null || _this$contentDOM2 === void 0 || _this$contentDOM2.classList.add(showLineNumberClass);
      }
      if (!showLineNumber && (_this$contentDOM3 = this.contentDOM) !== null && _this$contentDOM3 !== void 0 && _this$contentDOM3.classList.contains(showLineNumberClass)) {
        this.contentDOM.classList.remove(showLineNumberClass);
      }
      this.contentDOM.dataset.lang = language;
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
function createLineNumberDecorations(block) {
  var textContent = block.node.textContent;
  var lineInfos = textContent.split('\n');
  var currentPos = block.pos + 1;
  var decorations = lineInfos.map(function (item, index) {
    var span = createElement('span', {
      "class": 'line-number',
      line: "".concat(index + 1)
    }, "\u200B");
    var decoration = Decoration.widget(currentPos, function (view) {
      return span;
    }, {
      side: -1,
      ignoreSelection: true,
      destroy: function destroy() {
        span.remove();
      }
    });
    currentPos += item.length + 1;
    return decoration;
  });
  return decorations;
}
function highlightCodePlugin() {
  function getDecs(doc) {
    if (!doc || !doc.nodeSize) {
      return [];
    }
    var blocks = findNodesByType(doc, 'code_block');
    var decorations = [];
    blocks.forEach(function (block) {
      var language = block.node.attrs.language;
      if (language && !hljs.getLanguage(language)) language = 'plaintext';
      var highlightResult = language ? hljs.highlight(block.node.textContent, {
        language: language
      }) : hljs.highlightAuto(block.node.textContent);
      var emitter = highlightResult._emitter;
      var renderer = new HighlightRenderer(emitter, block.pos);
      console.log(renderer.value, 'val');
      if (renderer.value.length) {
        var blockDecorations = renderer.value.map(function (renderInfo) {
          return Decoration.inline(renderInfo.from, renderInfo.to, {
            "class": renderInfo.classNames.join(' ')
          });
        });
        decorations = decorations.concat(blockDecorations);
      }
      if (block.node.attrs.showLineNumber) {
        var lineNumberDecorations = createLineNumberDecorations(block);
        decorations = decorations.concat(lineNumberDecorations);
      }
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

var splitListItem = function splitListItem(itemType, itemAttrs) {
  return function (state, dispatch) {
    var _state$selection = state.selection,
      $from = _state$selection.$from,
      $to = _state$selection.$to,
      node = _state$selection.node;
    if (node && node.isBlock || $from.depth < 2 || !$from.sameParent($to)) return false;
    var grandParent = $from.node(-1);
    if (grandParent.type != itemType) return false;
    if ($from.parent.content.size == 0 && $from.node(-1).childCount == $from.indexAfter(-1)) {
      // In an empty block. If this is a nested list, the wrapping
      // list item should be split. Otherwise, bail out and let next
      // command handle lifting.
      if ($from.depth == 3 || $from.node(-3).type != itemType || $from.index(-2) != $from.node(-2).childCount - 1) return false;
      if (dispatch) {
        var wrap = Fragment.empty;
        var depthBefore = $from.index(-1) ? 1 : $from.index(-2) ? 2 : 3;
        // Build a fragment containing empty versions of the structure
        // from the outer list item to the parent node of the cursor
        for (var d = $from.depth - depthBefore; d >= $from.depth - 3; d--) wrap = Fragment.from($from.node(d).copy(wrap));
        var depthAfter = $from.indexAfter(-1) < $from.node(-2).childCount ? 1 : $from.indexAfter(-2) < $from.node(-3).childCount ? 2 : 3;
        // Add a second list item with an empty default start node
        wrap = wrap.append(Fragment.from(itemType.createAndFill()));
        var start = $from.before($from.depth - (depthBefore - 1));
        var s = new Slice(wrap, 4 - depthBefore, 0);
        console.log(s, JSON.stringify(s.toJSON()));
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
var myKeymap = {
  Enter: function Enter(state, dispatch, view) {
    if (splitListItem(schema.nodes.list_item)(state, dispatch)) return true;
    return splitBlock(state, dispatch);
  }
};

// 定义输入规则
var headingRules = [textblockTypeInputRule(/^#\s$/, schema.nodes.heading, {
  level: 1
}), textblockTypeInputRule(/^##\s$/, schema.nodes.heading, {
  level: 2
}), textblockTypeInputRule(/^###\s$/, schema.nodes.heading, {
  level: 3
})];
var listRules = [wrappingInputRule(/^\s*([-+*])\s$/, schema.nodes.bullet_list), wrappingInputRule(/^(\d+)\.\s$/, schema.nodes.ordered_list, function (match) {
  return {
    order: +match[1]
  };
})];
function buildInputRules() {
  var rules = inputRules({
    rules: [].concat(headingRules, listRules)
  });
  return rules;
}
var setupEditor = function setupEditor(el) {
  if (!el) return;
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
          }]
        }]
      });
      return toolbar;
    }
  });
  // 根据 schema 定义，创建 editorState 数据实例
  var editorState = EditorState.create({
    schema: schema,
    plugins: [buildInputRules(), keymap(_objectSpread2(_objectSpread2({}, baseKeymap), myKeymap)), history(), keymap({
      'Mod-z': undo,
      'Mod-y': redo
    }), toolbarPlugin, highlightCodePlugin()]
  });
  // 创建编辑器视图实例，并挂在到 el 上
  var editorView = new EditorView(el, {
    state: editorState,
    dispatchTransaction: function dispatchTransaction(tr) {
      var _toolbar;
      var newState = editorView.state.apply(tr);
      editorView.updateState(newState);
      (_toolbar = toolbar) === null || _toolbar === void 0 || _toolbar.update(editorView, editorView.state);
    },
    nodeViews: {
      code_block: CodeBlockViewConstructor
    }
  });
  console.log('editorView', editorView);
  return function () {
    var _toolbar2;
    editorView.destroy();
    (_toolbar2 = toolbar) === null || _toolbar2 === void 0 || _toolbar2.destroy();
    toolbar = null;
  };
};

var index = (function () {
  return 'welocome';
});

export { index as default, setupEditor };
