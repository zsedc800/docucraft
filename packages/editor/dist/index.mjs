import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { PluginKey, Selection, TextSelection, SelectionRange, NodeSelection, Plugin, EditorState } from 'prosemirror-state';
import { Fragment, Slice, Schema } from 'prosemirror-model';
import { keydownHandler, keymap } from 'prosemirror-keymap';
import { Transform, canSplit } from 'prosemirror-transform';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { undo, redo, history } from 'prosemirror-history';
import ReactDOM from 'react-dom/client';
import React, { useRef, useEffect } from 'react';
import hljs from 'highlight.js';
import { textblockTypeInputRule, wrappingInputRule, inputRules } from 'prosemirror-inputrules';
import { chainCommands, newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock, baseKeymap } from 'prosemirror-commands';

function _callSuper(t, o, e) {
  return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
}
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
  if (staticProps) _defineProperties(Constructor, staticProps);
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
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized(self);
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

var readFromCache;
var addToCache;
if (typeof WeakMap !== 'undefined') {
  var cache = new WeakMap();
  readFromCache = function readFromCache(key) {
    return cache.get(key);
  };
  addToCache = function addToCache(key, value) {
    cache.set(key, value);
    return value;
  };
} else {
  var _cache = [];
  var cacheSize = 10;
  var cachePos = 0;
  readFromCache = function readFromCache(key) {
    for (var i = 0; i < _cache.length; i += 2) {
      if (_cache[i] == key) return _cache[i + 1];
    }
  };
  addToCache = function addToCache(key, value) {
    if (cachePos == cacheSize) cachePos = 0;
    _cache[cachePos++] = key;
    return _cache[cachePos++] = value;
  };
}
var TableMap = /*#__PURE__*/function () {
  function TableMap(width, height, map) {
    var problems = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
    _classCallCheck(this, TableMap);
    this.width = width;
    this.height = height;
    this.map = map;
    this.problems = problems;
  }
  return _createClass(TableMap, [{
    key: "rectBetween",
    value: function rectBetween(a, b) {
      var _this$findCell = this.findCell(a),
        leftA = _this$findCell.left,
        topA = _this$findCell.top,
        rightA = _this$findCell.right,
        bottomA = _this$findCell.bottom;
      var _this$findCell2 = this.findCell(b),
        leftB = _this$findCell2.left,
        topB = _this$findCell2.top,
        rightB = _this$findCell2.right,
        bottomB = _this$findCell2.bottom;
      return {
        left: Math.min(leftA, leftB),
        top: Math.min(topA, topB),
        right: Math.max(rightA, rightB),
        bottom: Math.max(bottomA, bottomB)
      };
    }
  }, {
    key: "findCell",
    value: function findCell(pos) {
      for (var i = 0; i < this.map.length; i++) {
        var curPos = this.map[i];
        if (curPos != pos) continue;
        var left = i % this.width;
        var top = Math.floor(i / this.width);
        var right = left + 1;
        var bottom = top + 1;
        for (var j = 1; right < this.width && this.map[i + j] == curPos; j++) right++;
        for (var _j = 1; bottom < this.height && this.map[i + this.width * _j] == curPos; _j++) bottom++;
        return {
          left: left,
          top: top,
          right: right,
          bottom: bottom
        };
      }
      throw new RangeError("No cell with offset ".concat(pos, " found"));
    }
  }, {
    key: "nextCell",
    value: function nextCell(pos, axis, dir) {
      var _this$findCell3 = this.findCell(pos),
        left = _this$findCell3.left,
        top = _this$findCell3.top,
        right = _this$findCell3.right,
        bottom = _this$findCell3.bottom;
      if (axis === 'horiz') {
        if (dir < 0 ? left === 0 : right == this.width) return null;
        return this.map[top * this.width + (dir < 0 ? left - 1 : right)];
      } else {
        if (dir < 0 ? top == 0 : bottom == this.height) return null;
        return this.map[left + this.width * (dir < 0 ? top - 1 : bottom)];
      }
    }
  }, {
    key: "colCount",
    value: function colCount(pos) {
      for (var i = 0; i < this.map.length; i++) {
        if (this.map[i] == pos) {
          return i % this.width;
        }
      }
      throw new RangeError("No cell width offset ".concat(pos, " found"));
    }
  }, {
    key: "cellsInRect",
    value: function cellsInRect(rect) {
      var result = [];
      var seen = {};
      for (var row = rect.top; row < rect.bottom; row++) {
        for (var col = rect.left; col < rect.right; col++) {
          var index = row * this.width + col;
          var pos = this.map[index];
          if (seen[pos]) continue;
          seen[pos] = true;
          if (col == rect.left && col && this.map[index - 1] == pos || row == rect.top && row && this.map[index - this.width] == pos) continue;
          result.push(pos);
        }
      }
      return result;
    }
  }, {
    key: "positionAt",
    value: function positionAt(row, col, table) {
      for (var i = 0, rowStart = 0;; i++) {
        var rowEnd = rowStart + table.child(i).nodeSize;
        if (i == row) {
          var index = col + row * this.width;
          var rowEndIndex = (row + 1) * this.width;
          while (index < rowEndIndex && this.map[index] < rowStart) index++;
          return index == rowEndIndex ? rowEnd - 1 : this.map[index];
        }
        rowStart = rowEnd;
      }
    }
  }], [{
    key: "get",
    value: function get(table) {
      return readFromCache(table) || addToCache(table, computeMap(table));
    }
  }]);
}();
function computeMap(table) {
  if (table.type.spec.tableRole != 'table') throw new RangeError('Not a table node: ' + table.type.name);
  var width = findWidth(table),
    height = table.childCount;
  var map = Array(width * height).fill(0);
  var mapPos = 0;
  var problems;
  var colWidths = [];
  for (var row = 0, pos = 0; row < height; row++) {
    var rowNode = table.child(row);
    pos++;
    for (var i = 0;; i++) {
      while (mapPos < map.length && map[mapPos] != 0) mapPos++;
      if (i == rowNode.childCount) break;
      var cellNode = rowNode.child(i);
      var _cellNode$attrs = cellNode.attrs,
        colspan = _cellNode$attrs.colspan,
        rowspan = _cellNode$attrs.rowspan,
        colwidth = _cellNode$attrs.colwidth;
      for (var h = 0; h < rowspan; h++) {
        if (h + row >= height) {
          (problems || (problems = [])).push({
            type: 'overlong_rowspan',
            pos: pos,
            n: rowspan - h
          });
          break;
        }
        var start = mapPos + h * width;
        for (var w = 0; w < colspan; w++) {
          if (map[start + w] == 0) map[start + w] = pos;else {
            (problems || (problems = [])).push({
              type: 'collision',
              row: row,
              pos: pos,
              n: colspan - w
            });
          }
          var colW = colwidth && colwidth[w];
          if (colW) {
            var widthIndex = (start + w) % width * 2,
              prev = colWidths[widthIndex];
            if (prev == null || prev != colW && colWidths[widthIndex + 1] == 1) {
              colWidths[widthIndex] = colW;
              colWidths[widthIndex + 1] = 1;
            } else if (prev == colW) {
              colWidths[widthIndex + 1]++;
            }
          }
        }
      }
      mapPos += colspan;
      pos += cellNode.nodeSize;
    }
    var expectedPos = (row + 1) * width;
    var missing = 0;
    while (mapPos < expectedPos) if (map[mapPos++] == 0) missing++;
    if (missing) {
      (problems || (problems = [])).push({
        type: 'missing',
        row: row,
        n: missing
      });
    }
    pos++;
  }
  var tableMap = new TableMap(width, height, map);
  var badWidths = false;
  for (var _i = 0; !badWidths && _i < colWidths.length; _i += 2) if (colWidths[_i] != null && colWidths[_i + 1] < height) badWidths = true;
  if (badWidths) findBadColWidths(tableMap, colWidths, table);
  return tableMap;
}
function findWidth(table) {
  var width = -1;
  var hasRowSpan = false;
  for (var row = 0; row < table.childCount; row++) {
    var rowNode = table.child(row);
    var rowWidth = 0;
    if (hasRowSpan) for (var j = 0; j < row; j++) {
      var prevRow = table.child(j);
      for (var i = 0; i < prevRow.childCount; i++) {
        var cell = prevRow.child(i);
        if (j + cell.attrs.rowspan > row) rowWidth += cell.attrs.colspan;
      }
    }
    for (var _i2 = 0; _i2 < rowNode.childCount; _i2++) {
      var _cell = rowNode.child(_i2);
      rowWidth += _cell.attrs.colspan;
      if (_cell.attrs.rowspan > 1) hasRowSpan = true;
    }
    if (width == -1) width = rowWidth;
    width = Math.max(width, rowWidth);
  }
  return width;
}
function findBadColWidths(map, colWidths, table) {
  if (!map.problems) map.problems = [];
  var seen = {};
  for (var i = 0; i < map.map.length; i++) {
    var pos = map.map[i];
    if (seen[pos]) continue;
    seen[pos] = true;
    var node = table.nodeAt(pos);
    if (!node) {
      throw new RangeError("No cell with offset ".concat(pos, " found"));
    }
    var updated = null;
    var attrs = node.attrs;
    for (var j = 0; j < attrs.colspan; j++) {
      var col = (i + j) % map.width;
      var colWidth = colWidths[col * 2];
      if (colWidth != null && (!attrs.colwidth || attrs.colwidth[j] != colWidth)) (updated || (updated = freshColWidth(attrs)))[j] = colWidth;
    }
    if (updated) map.problems.unshift({
      type: 'colwidth mismatch',
      pos: pos,
      colwidth: updated
    });
  }
}
function freshColWidth(attrs) {
  if (attrs.colwidth) return attrs.colwidth.slice();
  var result = [];
  for (var i = 0; i < attrs.colspan; i++) result.push(0);
  return result;
}

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
      attrs: {
        "class": {
          "default": ''
        }
      },
      content: 'tableRow+',
      tableRole: 'table',
      isolating: true,
      group: options.tableGroup,
      parseDOM: [{
        tag: 'table',
        getAttrs: function getAttrs(dom) {
          return {
            "class": dom.getAttribute('class')
          };
        }
      }],
      toDOM: function toDOM(node) {
        return ['table', {
          "class": node.attrs["class"]
        }, ['tbody', 0]];
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
      tableRole: 'cell',
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
function tableNodeTypes(schema) {
  var result = schema.cached.tableNodeTypes;
  if (!result) {
    result = schema.cached.tableNodeTypes = {};
    for (var name in schema.nodes) {
      var type = schema.nodes[name];
      var role = type.spec.tableRole;
      if (role) result[role] = type;
    }
  }
  return result;
}

var tableEditingKey = new PluginKey('selectingCells');
var addColspan = function addColspan(attrs, pos) {
  var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var result = _objectSpread2(_objectSpread2({}, attrs), {}, {
    colspan: attrs.colspan + n
  });
  if (result.colwidth) {
    result.colwidth = result.colwidth.slice();
    for (var i = 0; i < n; i++) result.colwidth.splice(pos, 0, 0);
  }
  return result;
};
function columnIsHeader(map, table, col) {
  var headerCell = tableNodeTypes(table.type.schema).headerCell;
  for (var row = 0; row < map.height; row++) {
    if (table.nodeAt(map.map[col + row * map.width]).type != headerCell) return false;
  }
  return true;
}
function isInTable(state) {
  var $head = state.selection.$head;
  for (var d = $head.depth; d > 0; d--) if ($head.node(d).type.spec.tableRole == 'row') return true;
  return false;
}
function pointsAtCell($pos) {
  return $pos.parent.type.spec.tableRole == 'row' && !!$pos.nodeAfter;
}
function inSameTable($cellA, $cellB) {
  return $cellA.depth == $cellB.depth && $cellA.pos >= $cellB.start(-1) && $cellA.pos <= $cellB.end(-1);
}
function nextCell($pos, axis, dir) {
  var table = $pos.node(-1);
  var map = TableMap.get(table);
  var tableStart = $pos.start(-1);
  var moved = map.nextCell($pos.pos - tableStart, axis, dir);
  return moved == null ? null : $pos.node(0).resolve(tableStart + moved);
}
function removeColSpan(attrs, pos) {
  var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var result = _objectSpread2(_objectSpread2({}, attrs), {}, {
    colspan: attrs.colspan - n
  });
  if (result.colwidth) {
    result.colwidth = result.colwidth.slice();
    result.colwidth.splice(pos, n);
    if (!result.colwidth.some(function (w) {
      return w > 0;
    })) result.colwidth = null;
  }
  return result;
}
function cellAround($pos) {
  for (var d = $pos.depth - 1; d > 0; d--) if ($pos.node(d).type.spec.tableRole == 'row') return $pos.node(0).resolve($pos.before(d + 1));
  return null;
}
function cellNear($pos) {
  for (var after = $pos.nodeAfter, pos = $pos.pos; after; after = after.firstChild, pos++) {
    var role = after.type.spec.tableRole;
    if (role == 'cell' || role == 'headerCell') return $pos.doc.resolve(pos);
  }
  for (var before = $pos.nodeBefore, _pos = $pos.pos; before; before = before.lastChild, _pos--) {
    var _role = before.type.spec.tableRole;
    if (_role == 'cell' || _role == 'headerCell') {
      return $pos.doc.resolve(_pos - before.nodeSize);
    }
  }
}
function selectionCell(state) {
  var sel = state.selection;
  if ('$anchorCell' in sel && sel.$anchorCell) {
    return sel.$anchorCell.pos > sel.$headCell.pos ? sel.$anchorCell : sel.$headCell;
  } else if ('node' in sel && sel.node && sel.node.type.spec.tableRole == 'cell') {
    return sel.$anchor;
  }
  var $cell = cellAround(sel.$head) || cellNear(sel.$head);
  if ($cell) return $cell;
  throw new RangeError("No cell found around position ".concat(sel.head));
}
var isEmpty$1 = function isEmpty(val) {
  return val === null || val === undefined || Number.isNaN(val);
};

var CellSelection = /*#__PURE__*/function (_Selection) {
  function CellSelection($anchorCell) {
    var _this;
    var $headCell = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : $anchorCell;
    _classCallCheck(this, CellSelection);
    var table = $anchorCell.node(-1);
    var map = TableMap.get(table);
    var tableStart = $anchorCell.start(-1);
    var rect = map.rectBetween($anchorCell.pos - tableStart, $headCell.pos - tableStart);
    var doc = $anchorCell.node(0);
    var cells = map.cellsInRect(rect).filter(function (p) {
      return p != $headCell.pos - tableStart;
    });
    cells.unshift($headCell.pos - tableStart);
    var ranges = cells.map(function (pos) {
      var cell = table.nodeAt(pos);
      if (!cell) {
        throw new RangeError("No cell with offset ".concat(pos, " found"));
      }
      var from = tableStart + pos + 1;
      return new SelectionRange(doc.resolve(from), doc.resolve(from + cell.content.size));
    });
    _this = _callSuper(this, CellSelection, [ranges[0].$from, ranges[0].$to, ranges]);
    _this.$anchorCell = $anchorCell;
    _this.$headCell = $headCell;
    return _this;
  }
  _inherits(CellSelection, _Selection);
  return _createClass(CellSelection, [{
    key: "eq",
    value: function eq(selection) {
      return selection instanceof CellSelection && selection.$anchorCell.pos == this.$anchorCell.pos && selection.$headCell.pos == this.$headCell.pos;
    }
  }, {
    key: "map",
    value: function map(doc, mapping) {
      var $anchorCell = doc.resolve(mapping.map(this.$anchorCell.pos));
      var $headCell = doc.resolve(mapping.map(this.$headCell.pos));
      if (pointsAtCell($anchorCell) && pointsAtCell($headCell) && inSameTable($anchorCell, $headCell)) {
        var tableChanged = this.$anchorCell.node(-1) != $anchorCell.node(-1);
        if (tableChanged && this.isRowSelection()) return CellSelection.rowSelection($anchorCell, $headCell);else if (tableChanged && this.isColSelection()) return CellSelection.colSelection($anchorCell, $headCell);else return new CellSelection($anchorCell, $headCell);
      }
      return TextSelection.between($anchorCell, $headCell);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: 'cell',
        anchor: this.$anchorCell.pos,
        head: this.$headCell.pos
      };
    }
  }, {
    key: "isRowSelection",
    value: function isRowSelection() {
      var table = this.$anchorCell.node(-1);
      var map = TableMap.get(table);
      var tableStart = this.$anchorCell.start(-1);
      var anchorLeft = map.colCount(this.$anchorCell.pos - tableStart);
      var headLeft = map.colCount(this.$headCell.pos - tableStart);
      if (Math.min(anchorLeft, headLeft) > 0) return false;
      var anchorRight = anchorLeft + this.$anchorCell.nodeAfter.attrs.colspan;
      var headRight = headLeft + this.$headCell.nodeAfter.attrs.colspan;
      return Math.max(anchorRight, headRight) == map.width;
    }
  }, {
    key: "isColSelection",
    value: function isColSelection() {
      var anchorTop = this.$anchorCell.index(-1);
      var headTop = this.$headCell.index(-1);
      if (Math.min(anchorTop, headTop) > 0) return false;
      var anchorBottom = anchorTop + this.$anchorCell.nodeAfter.attrs.rowspan;
      var headBottom = headTop + this.$headCell.nodeAfter.attrs.rowspan;
      return Math.max(anchorBottom, headBottom) == this.$headCell.node(-1).childCount;
    }
  }, {
    key: "forEachCell",
    value: function forEachCell(f) {
      var table = this.$anchorCell.node(-1);
      var map = TableMap.get(table);
      var tableStart = this.$anchorCell.start(-1);
      var cells = map.cellsInRect(map.rectBetween(this.$anchorCell.pos - tableStart, this.$headCell.pos - tableStart));
      for (var i = 0; i < cells.length; i++) {
        f(table.nodeAt(cells[i]), tableStart + cells[i]);
      }
    }
  }, {
    key: "content",
    value: function content() {
      var table = this.$anchorCell.node(-1);
      var map = TableMap.get(table);
      var tableStart = this.$anchorCell.start(-1);
      var rect = map.rectBetween(this.$anchorCell.pos - tableStart, this.$headCell.pos - tableStart);
      var seen = {};
      var rows = [];
      for (var row = rect.top; row < rect.bottom; row++) {
        var rowContent = [];
        for (var index = row * map.width + rect.left, col = rect.left; col < rect.right; col++, index++) {
          var pos = map.map[index];
          if (seen[pos]) continue;
          seen[pos] = true;
          var cellRect = map.findCell(pos);
          var cell = table.nodeAt(pos);
          if (!cell) {
            throw RangeError("No cell with offset ".concat(pos, " found"));
          }
          var extraLeft = rect.left - cellRect.left;
          var extraRight = cellRect.right - rect.right;
          if (extraLeft > 0 || extraRight > 0) {
            var attrs = cell.attrs;
            if (extraLeft > 0) {
              attrs = removeColSpan(attrs, 0, extraLeft);
            }
            if (extraRight > 0) {
              attrs = removeColSpan(attrs, attrs.colspan - extraRight, extraRight);
            }
            if (cellRect.left < rect.left) {
              cell = cell.type.createAndFill(attrs);
              if (!cell) {
                throw RangeError("Could not create cell with attrs ".concat(JSON.stringify(attrs)));
              }
            } else {
              cell = cell.type.create(attrs, cell.content);
            }
          }
          if (cellRect.top < rect.top || cellRect.bottom > rect.bottom) {
            var _attrs = _objectSpread2(_objectSpread2({}, cell.attrs), {}, {
              rowspan: Math.min(cellRect.bottom, rect.bottom) - Math.max(cellRect.top, rect.top)
            });
            if (cellRect.top < rect.top) {
              cell = cell.type.createAndFill(_attrs);
            } else {
              cell = cell.type.create(_attrs, cell.content);
            }
          }
          rowContent.push(cell);
        }
        rows.push(table.child(row).copy(Fragment.from(rowContent)));
      }
      var fragment = this.isColSelection() && this.isRowSelection() ? table : rows;
      return new Slice(Fragment.from(fragment), 1, 1);
    }
  }, {
    key: "getBookmark",
    value: function getBookmark() {
      return new CellBookmark(this.$anchorCell.pos, this.$headCell.pos);
    }
  }], [{
    key: "colSelection",
    value: function colSelection($anchorCell) {
      var $headCell = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : $anchorCell;
      var table = $anchorCell.node(-1);
      var map = TableMap.get(table);
      var tableStart = $anchorCell.start(-1);
      var anchorRect = map.findCell($anchorCell.pos - tableStart);
      var headRect = map.findCell($headCell.pos - tableStart);
      var doc = $anchorCell.node(0);
      if (anchorRect.top <= headRect.top) {
        if (anchorRect.top > 0) $anchorCell = doc.resolve(tableStart + map.map[anchorRect.left]);
        if (headRect.bottom < map.height) $headCell = doc.resolve(tableStart + map.map[map.width * (map.height - 1) + headRect.right - 1]);
      } else {
        if (headRect.top > 0) $headCell = doc.resolve(tableStart + map.map[headRect.left]);
        if (anchorRect.bottom < map.height) $anchorCell = doc.resolve(tableStart + map.map[map.width * (map.height - 1) + anchorRect.right - 1]);
      }
      return new CellSelection($anchorCell, $headCell);
    }
  }, {
    key: "rowSelection",
    value: function rowSelection($anchorCell) {
      var $headCell = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : $anchorCell;
      var table = $anchorCell.node(-1);
      var map = TableMap.get(table);
      var tableStart = $anchorCell.start(-1);
      var anchorRect = map.findCell($anchorCell.pos - tableStart);
      var headRect = map.findCell($headCell.pos - tableStart);
      var doc = $anchorCell.node(0);
      if (anchorRect.left <= headRect.left) {
        if (anchorRect.left > 0) $anchorCell = doc.resolve(tableStart + map.map[anchorRect.top * map.width]);
        if (headRect.right < map.width) $headCell = doc.resolve(tableStart + map.map[map.width * (headRect.top + 1) - 1]);
      } else {
        if (headRect.left > 0) $headCell = doc.resolve(tableStart + map.map[headRect.top * map.width]);
        if (anchorRect.right < map.width) $anchorCell = doc.resolve(tableStart + map.map[map.width * (anchorRect.top + 1) - 1]);
      }
      return new CellSelection($anchorCell, $headCell);
    }
  }, {
    key: "fromJSON",
    value: function fromJSON(doc, json) {
      return new CellSelection(doc.resolve(json.anchor), doc.resolve(json.head));
    }
  }, {
    key: "create",
    value: function create(doc, anchorCell) {
      var headCell = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : anchorCell;
      return new CellSelection(doc.resolve(anchorCell), doc.resolve(headCell));
    }
  }]);
}(Selection);
CellSelection.prototype.visible = false;
Selection.jsonID('cell', CellSelection);
var CellBookmark = /*#__PURE__*/function () {
  function CellBookmark(anchor, head) {
    _classCallCheck(this, CellBookmark);
    this.anchor = anchor;
    this.head = head;
  }
  return _createClass(CellBookmark, [{
    key: "map",
    value: function map(mapping) {
      return new CellBookmark(mapping.map(this.anchor), mapping.map(this.head));
    }
  }, {
    key: "resolve",
    value: function resolve(doc) {
      var $anchorCell = doc.resolve(this.anchor),
        $headCell = doc.resolve(this.head);
      if ($anchorCell.parent.type.spec.tableRole == 'row' && $headCell.parent.type.spec.tableRole == 'row' && $anchorCell.index() < $anchorCell.parent.childCount && $headCell.index() < $headCell.parent.childCount && inSameTable($anchorCell, $headCell)) return new CellSelection($anchorCell, $headCell);else return Selection.near($headCell, 1);
    }
  }]);
}();
function drawCellSelection(state) {
  var cells = [];
  if (!(state.selection instanceof CellSelection)) return cells;
  state.selection.forEachCell(function (node, pos) {
    cells.push(Decoration.node(pos, pos + node.nodeSize, {
      "class": 'selectedCell'
    }));
  });
  return cells;
}
function isCellBoundarySelection(_ref) {
  var $from = _ref.$from,
    $to = _ref.$to;
  if ($from.pos == $to.pos || $from.pos < $from.pos - 6) return false; // Cheap elimination
  var afterFrom = $from.pos;
  var beforeTo = $to.pos;
  var depth = $from.depth;
  for (; depth >= 0; depth--, afterFrom++) if ($from.after(depth + 1) < $from.end(depth)) break;
  for (var d = $to.depth; d >= 0; d--, beforeTo--) if ($to.before(d + 1) > $to.start(d)) break;
  return afterFrom == beforeTo && /row|table/.test($from.node(depth).type.spec.tableRole);
}
function isTextSelectionAcrossCells(_ref2) {
  var $from = _ref2.$from,
    $to = _ref2.$to;
  var fromCellBoundaryNode;
  var toCellBoundaryNode;
  for (var i = $from.depth; i > 0; i--) {
    var node = $from.node(i);
    if (node.type.spec.tableRole === 'cell' || node.type.spec.tableRole === 'headerCell') {
      fromCellBoundaryNode = node;
      break;
    }
  }
  for (var _i = $to.depth; _i > 0; _i--) {
    var _node = $to.node(_i);
    if (_node.type.spec.tableRole === 'cell' || _node.type.spec.tableRole === 'headerCell') {
      toCellBoundaryNode = _node;
      break;
    }
  }
  return fromCellBoundaryNode !== toCellBoundaryNode && $to.parentOffset === 0;
}
function normalizeSelection(state, tr, allowTableNodeSelection) {
  var sel = (tr || state).selection;
  var doc = (tr || state).doc;
  var normalize;
  var role;
  if (sel instanceof NodeSelection && (role = sel.node.type.spec.tableRole)) {
    if (role == 'cell' || role == 'headerCell') {
      normalize = CellSelection.create(doc, sel.from);
    } else if (role == 'row') {
      var $cell = doc.resolve(sel.from + 1);
      normalize = CellSelection.rowSelection($cell);
    } else if (!allowTableNodeSelection) {
      var map = TableMap.get(sel.node);
      var start = sel.from + 1;
      var lastCell = start + map.map[map.width * map.height - 1];
      normalize = CellSelection.create(doc, start + 1, lastCell);
    }
  } else if (sel instanceof TextSelection && isCellBoundarySelection(sel)) {
    normalize = TextSelection.create(doc, sel.from);
  } else if (sel instanceof TextSelection && isTextSelectionAcrossCells(sel)) {
    normalize = TextSelection.create(doc, sel.$from.start(), sel.$from.end());
  }
  if (normalize) (tr || (tr = state.tr)).setSelection(normalize);
  return tr;
}

var fixTablesKey = new PluginKey('fix-tables');
function changedDescendants(old, cur, offset, f) {
  var oldSize = old.childCount,
    curSize = cur.childCount;
  outer: for (var i = 0, j = 0; i < curSize; i++) {
    var child = cur.child(i);
    for (var scan = j, e = Math.min(oldSize, i + 3); scan < e; scan++) {
      if (old.child(scan) == child) {
        j = scan + 1;
        offset += child.nodeSize;
        continue outer;
      }
    }
    f(child, offset);
    if (j < oldSize && old.child(j).sameMarkup(child)) changedDescendants(old.child(j), child, offset + 1, f);else child.nodesBetween(0, child.content.size, f, offset + 1);
    offset += child.nodeSize;
  }
}
function fixTables(state, oldState) {
  var tr;
  var check = function check(node, pos) {
    if (node.type.spec.tableRole == 'table') tr = fixTable(state, node, pos, tr);
  };
  if (!oldState) state.doc.descendants(check);else if (oldState.doc != state.doc) changedDescendants(oldState.doc, state.doc, 0, check);
  return tr;
}
function fixTable(state, table, tablePos, tr) {
  var map = TableMap.get(table);
  if (!map.problems) return tr;
  if (!tr) tr = state.tr;
  // Track which rows we must add cells to, so that we can adjust that
  // when fixing collisions.
  var mustAdd = [];
  for (var i = 0; i < map.height; i++) mustAdd.push(0);
  for (var _i = 0; _i < map.problems.length; _i++) {
    var prob = map.problems[_i];
    if (prob.type == 'collision') {
      var cell = table.nodeAt(prob.pos);
      if (!cell) continue;
      var attrs = cell.attrs;
      for (var j = 0; j < attrs.rowspan; j++) mustAdd[prob.row + j] += prob.n;
      tr.setNodeMarkup(tr.mapping.map(tablePos + 1 + prob.pos), null, removeColSpan(attrs, attrs.colspan - prob.n, prob.n));
    } else if (prob.type == 'missing') {
      mustAdd[prob.row] += prob.n;
    } else if (prob.type == 'overlong_rowspan') {
      var _cell = table.nodeAt(prob.pos);
      if (!_cell) continue;
      tr.setNodeMarkup(tr.mapping.map(tablePos + 1 + prob.pos), null, _objectSpread2(_objectSpread2({}, _cell.attrs), {}, {
        rowspan: _cell.attrs.rowspan - prob.n
      }));
    } else if (prob.type == 'colwidth mismatch') {
      var _cell2 = table.nodeAt(prob.pos);
      if (!_cell2) continue;
      tr.setNodeMarkup(tr.mapping.map(tablePos + 1 + prob.pos), null, _objectSpread2(_objectSpread2({}, _cell2.attrs), {}, {
        colwidth: prob.colwidth
      }));
    }
  }
  var first, last;
  for (var _i2 = 0; _i2 < mustAdd.length; _i2++) if (mustAdd[_i2]) {
    if (first == null) first = _i2;
    last = _i2;
  }
  for (var _i3 = 0, pos = tablePos + 1; _i3 < map.height; _i3++) {
    var row = table.child(_i3);
    var end = pos + row.nodeSize;
    var add = mustAdd[_i3];
    if (add > 0) {
      var role = 'cell';
      if (row.firstChild) {
        role = row.firstChild.type.spec.tableRole;
      }
      var nodes = [];
      for (var _j = 0; _j < add; _j++) {
        var node = tableNodeTypes(state.schema)[role].createAndFill();
        if (node) nodes.push(node);
      }
      var side = (_i3 == 0 || first == _i3 - 1) && last == _i3 ? pos + 1 : end - 1;
      tr.insert(tr.mapping.map(side), nodes);
    }
    pos = end;
  }
  return tr.setMeta(fixTablesKey, {
    fixTables: true
  });
}

var createTable = function createTable(rows, columns) {
  return function (state, dispatch, view) {
    var _state$schema$nodes = state.schema.nodes,
      table = _state$schema$nodes.table,
      tableRow = _state$schema$nodes.tableRow,
      tableHeader = _state$schema$nodes.tableHeader,
      tableCell = _state$schema$nodes.tableCell,
      paragraph = _state$schema$nodes.paragraph;
    var tableNode = table.create(null, Array(rows + 1).fill(null).map(function (_, row) {
      return tableRow.create(null, Array(columns).fill(null).map(function (_, col) {
        return (row === 0 ? tableHeader : tableCell).create(null, paragraph.create(null
        // state.schema.text('cell row ' + row + ', col ' + col)
        ));
      }));
    }));
    TableMap.get(tableNode);
    if (dispatch) {
      dispatch(state.tr.replaceSelectionWith(tableNode).scrollIntoView());
      return true;
    }
    return false;
  };
};
function selectedRect(state) {
  var sel = state.selection;
  var $pos = selectionCell(state);
  var table = $pos.node(-1);
  var tableStart = $pos.start(-1);
  var map = TableMap.get(table);
  var rect = sel instanceof CellSelection ? map.rectBetween(sel.$anchorCell.pos - tableStart, sel.$headCell.pos - tableStart) : map.findCell($pos.pos - tableStart);
  return _objectSpread2(_objectSpread2({}, rect), {}, {
    tableStart: tableStart,
    map: map,
    table: table
  });
}
function addColumn(tr, _ref, col) {
  var map = _ref.map,
    table = _ref.table,
    tableStart = _ref.tableStart;
  var refColumn = col > 0 ? -1 : 0;
  if (columnIsHeader(map, table, col + refColumn)) {
    refColumn = col == 0 || col == map.width ? null : 0;
  }
  for (var row = 0; row < map.height; row++) {
    var index = row * map.width + col;
    if (col > 0 && col < map.width && map.map[index - 1] == map.map[index]) {
      var pos = map.map[index];
      var cell = table.nodeAt(pos);
      tr.setNodeMarkup(tr.mapping.map(tableStart + pos), null, addColspan(cell.attrs, col - map.colCount(pos)));
      row += cell.attrs.rowspan - 1;
    } else {
      var type = refColumn == null ? tableNodeTypes(table.type.schema).cell : table.nodeAt(map.map[index + refColumn]).type;
      var _pos = map.positionAt(row, col, table);
      tr.insert(tr.mapping.map(tableStart + _pos), type.createAndFill());
    }
  }
  return tr;
}
var addColumnAtEnd = function addColumnAtEnd(pos, view) {
  var state = view.state,
    dispatch = view.dispatch;
  var tr = state.tr;
  var tableStart = tr.mapping.map(pos);
  var $start = state.doc.resolve(tableStart);
  var table = $start.nodeAfter;
  // console.log($start);
  // console.log($start.node($start.depth), 'nn');
  var map = TableMap.get(table);
  dispatch(addColumn(tr, {
    map: map,
    table: table,
    tableStart: pos + 1
  }, map.width));
};
var removeColumn = function removeColumn(tr, _ref2, col) {
  var map = _ref2.map,
    table = _ref2.table,
    tableStart = _ref2.tableStart;
  var mapStart = tr.mapping.maps.length;
  for (var row = 0; row < map.height;) {
    var index = row * map.width + col;
    var pos = map.map[index];
    var cell = table.nodeAt(pos);
    var attrs = cell.attrs;
    if (col > 0 && map.map[index - 1] == pos || col < map.width - 1 && map.map[index + 1] == pos) {
      tr.setNodeMarkup(tr.mapping.slice(mapStart).map(tableStart + pos), null, removeColSpan(attrs, col - map.colCount(pos)));
    } else {
      var start = tr.mapping.slice(mapStart).map(tableStart + pos);
      tr["delete"](start, start + cell.nodeSize);
    }
    row += attrs.rowspan;
  }
  return tr;
};
var rowIsHeader = function rowIsHeader(map, table, row) {
  var headerCell = tableNodeTypes(table.type.schema).headerCell;
  for (var col = 0; col < map.width; col++) {
    var _table$nodeAt;
    if (((_table$nodeAt = table.nodeAt(map.map[col + row * map.width])) === null || _table$nodeAt === void 0 ? void 0 : _table$nodeAt.type) != headerCell) return false;
  }
  return true;
};
var addRow = function addRow(tr, _ref3, row) {
  var map = _ref3.map,
    table = _ref3.table,
    tableStart = _ref3.tableStart;
  var rowPos = tableStart;
  for (var i = 0; i < row; i++) rowPos += table.child(i).nodeSize;
  var cells = [];
  var refRow = row > 0 ? -1 : 0;
  if (rowIsHeader(map, table, row + refRow)) refRow = row == 0 || row == map.height ? null : 0;
  for (var col = 0, index = map.width * row; col < map.width; col++, index++) {
    if (row > 0 && row < map.height && map.map[index] == map.map[index - map.width]) {
      var pos = map.map[index];
      var attrs = table.nodeAt(pos).attrs;
      tr.setNodeMarkup(tableStart + pos, null, _objectSpread2(_objectSpread2({}, attrs), {}, {
        rowspan: attrs.rowspan + 1
      }));
      col += attrs.colspan - 1;
    } else {
      var _table$nodeAt2;
      var type = refRow === null ? tableNodeTypes(table.type.schema).cell : (_table$nodeAt2 = table.nodeAt(map.map[index + refRow * map.width])) === null || _table$nodeAt2 === void 0 ? void 0 : _table$nodeAt2.type;
      var node = type === null || type === void 0 ? void 0 : type.createAndFill();
      if (node) cells.push(node);
    }
  }
  tr.insert(rowPos, tableNodeTypes(table.type.schema).row.create(null, cells));
  return tr;
};
var addRowAtEnd = function addRowAtEnd(pos, view) {
  var $pos = view.state.doc.resolve(pos);
  var table = $pos.nodeAfter;
  var map = TableMap.get(table);
  view.dispatch(addRow(view.state.tr, {
    map: map,
    table: table,
    tableStart: pos + 1
  }, map.height));
};
var removeRow = function removeRow(tr, _ref4, row) {
  var map = _ref4.map,
    table = _ref4.table,
    tableStart = _ref4.tableStart;
  var rowPos = 0;
  for (var i = 0; i < row; i++) rowPos += table.child(i).nodeSize;
  var nextRow = rowPos + table.child(row).nodeSize;
  var mapFrom = tr.mapping.maps.length;
  tr["delete"](rowPos + tableStart, nextRow + tableStart);
  var seen = new Set();
  for (var col = 0, index = row * map.width; col < map.width; col++, index++) {
    var pos = map.map[index];
    if (seen.has(pos)) continue;
    seen.add(pos);
    if (row > 0 && pos == map.map[index - map.width]) {
      var _table$nodeAt3;
      var attrs = (_table$nodeAt3 = table.nodeAt(pos)) === null || _table$nodeAt3 === void 0 ? void 0 : _table$nodeAt3.attrs;
      tr.setNodeMarkup(tr.mapping.slice(mapFrom).map(pos + tableStart), null, _objectSpread2(_objectSpread2({}, attrs), {}, {
        rowspan: attrs.rowspan - 1
      }));
      col += attrs.colspan - 1;
    } else if (row < map.height && pos == map.map[index + map.width]) {
      var cell = table.nodeAt(pos);
      var _attrs = cell === null || cell === void 0 ? void 0 : cell.attrs;
      var copy = cell.type.create(_objectSpread2(_objectSpread2({}, _attrs), {}, {
        rowspan: cell.attrs.rowspan - 1
      }), cell.content);
      var newPos = map.positionAt(row + 1, col, table);
      tr.insert(tr.mapping.slice(mapFrom).map(tableStart + newPos), copy);
      col += _attrs.colspan - 1;
    }
  }
  return tr;
};
var cellsOverlapRectangle = function cellsOverlapRectangle(_ref5, rect) {
  var width = _ref5.width,
    height = _ref5.height,
    map = _ref5.map;
  var indexTop = rect.top * width + rect.left,
    indexLeft = indexTop;
  var indexBottom = (rect.bottom - 1) * width + rect.left,
    indexRight = indexTop + (rect.right - rect.left - 1);
  for (var i = rect.top; i < rect.bottom; i++) {
    if (rect.left > 0 && map[indexLeft] == map[indexLeft - 1] || rect.right < width && map[indexRight] == map[indexRight + 1]) return true;
    indexLeft += width;
    indexRight += width;
  }
  for (var _i = rect.left; _i < rect.right; _i++) {
    if (rect.top > 0 && map[indexTop] == map[indexTop - width] || rect.bottom < height && map[indexBottom] == map[indexBottom + width]) return true;
    indexTop++;
    indexBottom++;
  }
  return false;
};
var isEmpty = function isEmpty(cell) {
  var c = cell.content;
  return c.childCount == 1 && c.child(0).isTextblock && c.child(0).childCount == 0;
};
var mergeCells = function mergeCells(state, dispatch) {
  var sel = state.selection;
  if (!(sel instanceof CellSelection) || sel.$anchorCell.pos == sel.$headCell.pos) return false;
  var rect = selectedRect(state),
    map = rect.map;
  if (cellsOverlapRectangle(map, rect)) return false;
  if (dispatch) {
    var tr = state.tr;
    var seen = {};
    var content = Fragment.empty;
    var mergedPos;
    var mergedCell;
    for (var row = rect.top; row < rect.bottom; row++) {
      for (var col = rect.left; col < rect.right; col++) {
        var cellPos = map.map[row * map.width + col];
        var cell = rect.table.nodeAt(cellPos);
        if (seen[cellPos] || !cell) continue;
        seen[cellPos] = true;
        if (mergedPos == null) {
          mergedPos = cellPos;
          mergedCell = cell;
        } else {
          if (!isEmpty(cell)) content = content.append(cell.content);
          var mapped = tr.mapping.map(cellPos + rect.tableStart);
          tr["delete"](mapped, mapped + cell.nodeSize);
        }
      }
    }
    if (mergedPos == null || mergedCell == null) return true;
    tr.setNodeMarkup(mergedPos + rect.tableStart, null, _objectSpread2(_objectSpread2({}, addColspan(mergedCell.attrs, mergedCell.attrs.colspan, rect.right - rect.left - mergedCell.attrs.colspan)), {}, {
      rowspan: rect.bottom - rect.top
    }));
    if (content.size) {
      var end = mergedPos + 1 + mergedCell.content.size;
      var start = isEmpty(mergedCell) ? mergedPos + 1 : end;
      tr.replaceWith(start + rect.tableStart, end + rect.tableStart, content);
    }
    tr.setSelection(new CellSelection(tr.doc.resolve(mergedPos + rect.tableStart)));
    dispatch(tr);
  }
  return true;
};

var tableClassName = 'tableWrapper dc-block scrollbar';
var TableView = /*#__PURE__*/function () {
  function TableView(node, view, getPos, cellMinWidth) {
    var _this = this;
    _classCallCheck(this, TableView);
    _defineProperty(this, "handleMouseOver", function (event) {
      var clientX = event.clientX,
        clientY = event.clientY;
      var mousePos = _this.view.posAtCoords({
        left: clientX,
        top: clientY
      });
      if (!mousePos) return;
      var $cell = cellAround(_this.view.state.doc.resolve(mousePos.pos));
      if (!$cell) return;
      // this.$cell = $cell;
      var tableStart = $cell.start(-1);
      var map = TableMap.get(_this.node);
      var _map$findCell = map.findCell($cell.pos - tableStart),
        left = _map$findCell.left,
        top = _map$findCell.top,
        right = _map$findCell.right,
        bottom = _map$findCell.bottom;
      // console.log(left, top, right, bottom, 'o');
      var decs = [];
      for (var i = top; i < bottom; i++) {
        var _pos = map.map[i * map.width] + tableStart;
        var $pos = _this.view.state.doc.resolve(_pos);
        decs.push(Decoration.node(_pos, _pos + $pos.nodeAfter.nodeSize, {
          "class": 'row-active'
        }));
      }
      for (var _i = left; _i < right; _i++) {
        var _pos2 = map.map[_i] + tableStart;
        var _$pos = _this.view.state.doc.resolve(_pos2);
        decs.push(Decoration.node(_pos2, _pos2 + _$pos.nodeAfter.nodeSize, {
          "class": 'col-active'
        }));
      }
      var tr = _this.view.state.tr;
      var classList = [];
      if (bottom == map.height) classList.push('row-active');
      if (right == map.width) classList.push('col-active');
      var pos = _this.getPos();
      // decs.push(
      //   Decoration.node(pos, pos + this.node.nodeSize, {
      //     class: classList.join(' '),
      //   })
      // );
      // console.log(pos, 'pos');
      tr.setNodeMarkup(pos, null, _objectSpread2(_objectSpread2({}, _this.node.attrs), {}, {
        "class": tableClassName + ' ' + classList.join(' ')
      }));
      if (decs.length) {
        tr.setMeta(tableEditingKey, {
          hoverDecos: decs
        });
      }
      _this.view.dispatch(tr);
    });
    _defineProperty(this, "handleMouseLeave", function () {
      var tr = _this.view.state.tr;
      tr.setMeta(tableEditingKey, {
        hoverDecos: []
      });
      tr.setNodeMarkup(_this.getPos(), null, {
        "class": tableClassName
      });
      _this.view.dispatch(tr);
    });
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.cellMinWidth = cellMinWidth;
    this.dom = createElement('div', {
      "class": tableClassName
    });
    this.dom.appendChild(createElement('div', {
      tabindex: '0',
      "class": 'hiddenfocus'
    }));
    this.table = this.dom.appendChild(createElement('table'
    // {},
    // createElement('div', { class: 'rowBar' }),
    // createElement('div', { class: 'colBar' })
    ));
    this.colgroup = this.table.appendChild(createElement('colgroup'));
    updateColumnsOnResize(this.node, this.colgroup, this.table, this.cellMinWidth);
    this.contentDOM = this.table.appendChild(createElement('tbody'));
    this.dom.addEventListener('mouseover', this.handleMouseOver);
    this.dom.addEventListener('mouseleave', this.handleMouseLeave);
  }
  return _createClass(TableView, [{
    key: "destroy",
    value: function destroy() {
      this.dom.removeEventListener('mouseover', this.handleMouseOver);
      this.dom.removeEventListener('mouseleave', this.handleMouseLeave);
    }
  }, {
    key: "update",
    value: function update(node, decorations) {
      if (node.type !== this.node.type) return false;
      this.node = node;
      this.dom.className = node.attrs["class"] || tableClassName;
      updateColumnsOnResize(this.node, this.colgroup, this.table, this.cellMinWidth);
      return true;
    }
  }, {
    key: "ignoreMutation",
    value: function ignoreMutation(record) {
      return record.type == 'attributes' && (record.target == this.table || this.colgroup.contains(record.target));
    }
  }, {
    key: "selectNode",
    value: function selectNode() {
      console.log('select', this);
    }
  }]);
}();
function updateColumnsOnResize(node, colgroup, table, cellMinWidth, overrideCol, overrideValue) {
  var totalWidth = 0,
    fixedWidth = true,
    nextDOM = colgroup.firstChild;
  var row = node.firstChild;
  if (!row) return;
  for (var i = 0, col = 0; i < row.childCount; i++) {
    var _row$child$attrs = row.child(i).attrs,
      colspan = _row$child$attrs.colspan,
      colwidth = _row$child$attrs.colwidth;
    for (var j = 0; j < colspan; j++, col++) {
      var hasWidth = overrideCol == col ? overrideValue : colwidth && colwidth[j];
      var cssWidth = hasWidth ? hasWidth + 'px' : '';
      totalWidth += hasWidth || cellMinWidth;
      if (!hasWidth) fixedWidth = false;
      if (!nextDOM) {
        colgroup.appendChild(createElement('col')).style.width = cssWidth;
      } else {
        if (nextDOM.style.width != cssWidth) nextDOM.style.width = cssWidth;
        nextDOM = nextDOM.nextSibling;
      }
    }
  }
  while (nextDOM) {
    var _nextDOM$parentNode;
    var after = nextDOM.nextSibling;
    (_nextDOM$parentNode = nextDOM.parentNode) === null || _nextDOM$parentNode === void 0 || _nextDOM$parentNode.removeChild(nextDOM);
    nextDOM = after;
    if (fixedWidth) {
      table.style.width = totalWidth + 'px';
      table.style.minWidth = '';
    } else {
      table.style.width = '';
      table.style.minWidth = totalWidth + 'px';
    }
  }
}
var TableViewConstructor = function TableViewConstructor(node, view, getPos) {
  return new TableView(node, view, getPos, 80);
};
var addToolkit = function addToolkit(table, start) {
  var map = TableMap.get(table);
  var seen = {};
  var width = map.width,
    height = map.height;
  var result = [];
  var _loop = function _loop(i) {
    if (seen[i]) return 1; // continue
    seen[i] = true;
    result.push(Decoration.widget(start + map.map[i] + 2, function (view) {
      return createElement('div', {
        "class": 'rowBtn',
        onclick: function onclick() {
          var dispatch = view.dispatch,
            state = view.state;
          var row = i / width;
          var table = state.doc.nodeAt(start);
          var map = TableMap.get(table);
          dispatch(removeRow(state.tr, {
            map: map,
            table: table,
            tableStart: start + 1
          }, row));
        }
      });
    }));
  };
  for (var i = 0; i < width * height; i += width) {
    if (_loop(i)) continue;
  }
  seen = {};
  var _loop2 = function _loop2(_i2) {
    if (seen[_i2]) return 1; // continue
    seen[_i2] = true;
    result.push(Decoration.widget(start + map.map[_i2] + 2, function (view) {
      return createElement('div', {
        "class": 'colBtn',
        onclick: function onclick() {
          var state = view.state,
            dispatch = view.dispatch;
          var table = state.doc.nodeAt(start);
          var map = TableMap.get(table);
          dispatch(removeColumn(state.tr, {
            map: map,
            table: table,
            tableStart: start + 1
          }, _i2));
        }
      });
    }));
  };
  for (var _i2 = 0; _i2 < width; _i2++) {
    if (_loop2(_i2)) continue;
  }
  result.push(Decoration.widget(start + 1, function (view) {
    return createElement('div', {
      "class": 'tools'
    }, createElement('div', {
      "class": 'rowBar',
      onclick: function onclick() {
        return addRowAtEnd(start, view);
      }
    }, '+'), createElement('div', {
      "class": 'colBar',
      onclick: function onclick() {
        return addColumnAtEnd(start, view);
      }
    }, '+'));
  }));
  return result;
};

/**
 * @public
 */
var columnResizingPluginKey = new PluginKey('tableColumnResizing');
/**
 * @public
 */
function columnResizing() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    _ref$handleWidth = _ref.handleWidth,
    handleWidth = _ref$handleWidth === void 0 ? 5 : _ref$handleWidth,
    _ref$cellMinWidth = _ref.cellMinWidth,
    cellMinWidth = _ref$cellMinWidth === void 0 ? 25 : _ref$cellMinWidth,
    _ref$View = _ref.View,
    View = _ref$View === void 0 ? TableView : _ref$View,
    _ref$lastColumnResiza = _ref.lastColumnResizable,
    lastColumnResizable = _ref$lastColumnResiza === void 0 ? true : _ref$lastColumnResiza;
  var plugin = new Plugin({
    key: columnResizingPluginKey,
    state: {
      init: function init(_, state) {
        plugin.spec.props.nodeViews[tableNodeTypes(state.schema).table.name] = function (node, view, getPos) {
          return new View(node, view, getPos, cellMinWidth);
        };
        return new ResizeState(-1, false);
      },
      apply: function apply(tr, prev) {
        return prev.apply(tr);
      }
    },
    props: {
      attributes: function attributes(state) {
        var pluginState = columnResizingPluginKey.getState(state);
        return pluginState && pluginState.activeHandle > -1 ? {
          "class": 'resize-cursor'
        } : {};
      },
      handleDOMEvents: {
        mousemove: function mousemove(view, event) {
          handleMouseMove(view, event, handleWidth, cellMinWidth, lastColumnResizable);
        },
        mouseleave: function mouseleave(view) {
          handleMouseLeave(view);
        },
        mousedown: function mousedown(view, event) {
          handleMouseDown$1(view, event, cellMinWidth);
        }
      },
      decorations: function decorations(state) {
        var pluginState = columnResizingPluginKey.getState(state);
        if (pluginState && pluginState.activeHandle > -1) {
          return handleDecorations(state, pluginState.activeHandle);
        }
      },
      nodeViews: {}
    }
  });
  return plugin;
}
/**
 * @public
 */
var ResizeState = /*#__PURE__*/function () {
  function ResizeState(activeHandle, dragging) {
    _classCallCheck(this, ResizeState);
    this.activeHandle = activeHandle;
    this.dragging = dragging;
  }
  return _createClass(ResizeState, [{
    key: "apply",
    value: function apply(tr) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var state = this;
      var action = tr.getMeta(columnResizingPluginKey);
      if (action && action.setHandle != null) return new ResizeState(action.setHandle, false);
      if (action && action.setDragging !== undefined) return new ResizeState(state.activeHandle, action.setDragging);
      if (state.activeHandle > -1 && tr.docChanged) {
        var handle = tr.mapping.map(state.activeHandle, -1);
        if (!pointsAtCell(tr.doc.resolve(handle))) {
          handle = -1;
        }
        return new ResizeState(handle, state.dragging);
      }
      return state;
    }
  }]);
}();
function handleMouseMove(view, event, handleWidth, cellMinWidth, lastColumnResizable) {
  var pluginState = columnResizingPluginKey.getState(view.state);
  if (!pluginState) return;
  if (!pluginState.dragging) {
    var target = domCellAround(event.target);
    var cell = -1;
    if (target) {
      var _target$getBoundingCl = target.getBoundingClientRect(),
        left = _target$getBoundingCl.left,
        right = _target$getBoundingCl.right;
      if (event.clientX - left <= handleWidth) cell = edgeCell(view, event, 'left', handleWidth);else if (right - event.clientX <= handleWidth) cell = edgeCell(view, event, 'right', handleWidth);
    }
    if (cell != pluginState.activeHandle) {
      if (!lastColumnResizable && cell !== -1) {
        var $cell = view.state.doc.resolve(cell);
        var table = $cell.node(-1);
        var map = TableMap.get(table);
        var tableStart = $cell.start(-1);
        var col = map.colCount($cell.pos - tableStart) + $cell.nodeAfter.attrs.colspan - 1;
        if (col == map.width - 1) {
          return;
        }
      }
      updateHandle(view, cell);
    }
  }
}
function handleMouseLeave(view) {
  var pluginState = columnResizingPluginKey.getState(view.state);
  if (pluginState && pluginState.activeHandle > -1 && !pluginState.dragging) updateHandle(view, -1);
}
function handleMouseDown$1(view, event, cellMinWidth) {
  var _view$dom$ownerDocume;
  var win = (_view$dom$ownerDocume = view.dom.ownerDocument.defaultView) !== null && _view$dom$ownerDocume !== void 0 ? _view$dom$ownerDocume : window;
  var pluginState = columnResizingPluginKey.getState(view.state);
  if (!pluginState || pluginState.activeHandle == -1 || pluginState.dragging) return false;
  var cell = view.state.doc.nodeAt(pluginState.activeHandle);
  var width = currentColWidth(view, pluginState.activeHandle, cell.attrs);
  view.dispatch(view.state.tr.setMeta(columnResizingPluginKey, {
    setDragging: {
      startX: event.clientX,
      startWidth: width
    }
  }));
  function finish(event) {
    win.removeEventListener('mouseup', finish);
    win.removeEventListener('mousemove', move);
    var pluginState = columnResizingPluginKey.getState(view.state);
    if (pluginState !== null && pluginState !== void 0 && pluginState.dragging) {
      updateColumnWidth(view, pluginState.activeHandle, draggedWidth(pluginState.dragging, event, cellMinWidth));
      view.dispatch(view.state.tr.setMeta(columnResizingPluginKey, {
        setDragging: null
      }));
    }
  }
  function move(event) {
    if (!event.which) return finish(event);
    var pluginState = columnResizingPluginKey.getState(view.state);
    if (!pluginState) return;
    if (pluginState.dragging) {
      var dragged = draggedWidth(pluginState.dragging, event, cellMinWidth);
      displayColumnWidth(view, pluginState.activeHandle, dragged, cellMinWidth);
    }
  }
  win.addEventListener('mouseup', finish);
  win.addEventListener('mousemove', move);
  event.preventDefault();
  return true;
}
function currentColWidth(view, cellPos, _ref2) {
  var colspan = _ref2.colspan,
    colwidth = _ref2.colwidth;
  var width = colwidth && colwidth[colwidth.length - 1];
  if (width) return width;
  var dom = view.domAtPos(cellPos);
  var node = dom.node.childNodes[dom.offset];
  var domWidth = node.offsetWidth,
    parts = colspan;
  if (colwidth) for (var i = 0; i < colspan; i++) if (colwidth[i]) {
    domWidth -= colwidth[i];
    parts--;
  }
  return domWidth / parts;
}
function domCellAround(target) {
  while (target && target.nodeName != 'TD' && target.nodeName != 'TH') target = target.classList && target.classList.contains('ProseMirror') ? null : target.parentNode;
  return target;
}
function edgeCell(view, event, side, handleWidth) {
  // posAtCoords returns inconsistent positions when cursor is moving
  // across a collapsed table border. Use an offset to adjust the
  // target viewport coordinates away from the table border.
  var offset = side == 'right' ? -handleWidth : handleWidth;
  var found = view.posAtCoords({
    left: event.clientX + offset,
    top: event.clientY
  });
  if (!found) return -1;
  var pos = found.pos;
  var $cell = cellAround(view.state.doc.resolve(pos));
  if (!$cell) return -1;
  if (side == 'right') return $cell.pos;
  var map = TableMap.get($cell.node(-1)),
    start = $cell.start(-1);
  var index = map.map.indexOf($cell.pos - start);
  return index % map.width == 0 ? -1 : start + map.map[index - 1];
}
function draggedWidth(dragging, event, cellMinWidth) {
  var offset = event.clientX - dragging.startX;
  return Math.max(cellMinWidth, dragging.startWidth + offset);
}
function updateHandle(view, value) {
  view.dispatch(view.state.tr.setMeta(columnResizingPluginKey, {
    setHandle: value
  }));
}
function updateColumnWidth(view, cell, width) {
  var $cell = view.state.doc.resolve(cell);
  var table = $cell.node(-1),
    map = TableMap.get(table),
    start = $cell.start(-1);
  var col = map.colCount($cell.pos - start) + $cell.nodeAfter.attrs.colspan - 1;
  var tr = view.state.tr;
  for (var row = 0; row < map.height; row++) {
    var mapIndex = row * map.width + col;
    // Rowspanning cell that has already been handled
    if (row && map.map[mapIndex] == map.map[mapIndex - map.width]) continue;
    var pos = map.map[mapIndex];
    var attrs = table.nodeAt(pos).attrs;
    var index = attrs.colspan == 1 ? 0 : col - map.colCount(pos);
    if (attrs.colwidth && attrs.colwidth[index] == width) continue;
    var colwidth = attrs.colwidth ? attrs.colwidth.slice() : zeroes(attrs.colspan);
    colwidth[index] = width;
    tr.setNodeMarkup(start + pos, null, _objectSpread2(_objectSpread2({}, attrs), {}, {
      colwidth: colwidth
    }));
  }
  if (tr.docChanged) view.dispatch(tr);
}
function displayColumnWidth(view, cell, width, cellMinWidth) {
  var $cell = view.state.doc.resolve(cell);
  var table = $cell.node(-1),
    start = $cell.start(-1);
  var col = TableMap.get(table).colCount($cell.pos - start) + $cell.nodeAfter.attrs.colspan - 1;
  var dom = view.domAtPos($cell.start(-1)).node;
  while (dom && dom.nodeName != 'TABLE') {
    dom = dom.parentNode;
  }
  if (!dom) return;
  updateColumnsOnResize(table, dom.firstChild, dom, cellMinWidth, col, width);
}
function zeroes(n) {
  return Array(n).fill(0);
}
function handleDecorations(state, cell) {
  var decorations = [];
  var $cell = state.doc.resolve(cell);
  var table = $cell.node(-1);
  if (!table) {
    return DecorationSet.empty;
  }
  var map = TableMap.get(table);
  var start = $cell.start(-1);
  var col = map.colCount($cell.pos - start) + $cell.nodeAfter.attrs.colspan;
  for (var row = 0; row < map.height; row++) {
    var index = col + row * map.width - 1;
    // For positions that have either a different cell or the end
    // of the table to their right, and either the top of the table or
    // a different cell above them, add a decoration
    if ((col == map.width || map.map[index] != map.map[index + 1]) && (row == 0 || map.map[index] != map.map[index - map.width])) {
      var cellPos = map.map[index];
      var pos = start + cellPos + table.nodeAt(cellPos).nodeSize - 1;
      var dom = document.createElement('div');
      dom.className = 'column-resize-handle';
      decorations.push(Decoration.widget(pos, dom));
    }
  }
  return DecorationSet.create(state.doc, decorations);
}

var pastedCells = function pastedCells(slice) {
  if (!slice.size) return null;
  var content = slice.content,
    openStart = slice.openStart,
    openEnd = slice.openEnd;
  while (content.childCount == 1 && (openStart > 0 && openEnd > 0 || content.child(0).type.spec.tableRole == 'table')) {
    openStart--;
    openEnd--;
    content = content.child(0).content;
  }
  var first = content.child(0);
  var role = first.type.spec.tableRole;
  var schema = first.type.schema,
    rows = [];
  if (role == 'row') {
    for (var i = 0; i < content.childCount; i++) {
      var cells = content.child(i).content;
      var left = i ? 0 : Math.max(0, openStart - 1);
      var right = i < content.childCount - 1 ? 0 : Math.max(0, openEnd - 1);
      if (left || right) cells = fitSlice(tableNodeTypes(schema).row, new Slice(cells, left, right)).content;
      rows.push(cells);
    }
  } else if (role == 'cell' || role == 'headerCell') {
    rows.push(openStart || openEnd ? fitSlice(tableNodeTypes(schema).row, new Slice(content, openStart, openEnd)).content : content);
  } else {
    return null;
  }
  return ensureRectangular(schema, rows);
};
function ensureRectangular(schema, rows) {
  var widths = [];
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    for (var j = row.childCount - 1; j >= 0; j--) {
      var _row$child$attrs = row.child(j).attrs,
        rowspan = _row$child$attrs.rowspan,
        colspan = _row$child$attrs.colspan;
      for (var r = i; r < i + rowspan; r++) widths[r] = (widths[r] || 0) + colspan;
    }
  }
  var width = 0;
  for (var _r = 0; _r < widths.length; _r++) width = Math.max(width, widths[_r]);
  for (var _r2 = 0; _r2 < widths.length; _r2++) {
    if (_r2 > rows.length) rows.push(Fragment.empty);
    if (widths[_r2] < width) {
      var empty = tableNodeTypes(schema).cell.createAndFill();
      var cells = [];
      for (var _i = widths[_r2]; _i < width; _i++) {
        cells.push(empty);
      }
      rows[_r2] = rows[_r2].append(Fragment.from(cells));
    }
  }
  return {
    height: rows.length,
    width: width,
    rows: rows
  };
}
var fitSlice = function fitSlice(nodeType, slice) {
  var node = nodeType.createAndFill();
  var tr = new Transform(node).replace(0, node.content.size, slice);
  return tr.doc;
};
var clipCells = function clipCells(_ref, newWidth, newHeight) {
  var width = _ref.width,
    height = _ref.height,
    rows = _ref.rows;
  if (width != newWidth) {
    var added = [];
    var newRows = [];
    for (var row = 0; row < rows.length; row++) {
      var frag = rows[row],
        cells = [];
      for (var col = added[row] || 0, i = 0; col < newWidth; i++) {
        var cell = frag.child(i % frag.childCount);
        if (col + cell.attrs.colspan > newWidth) cell = cell.type.createChecked(removeColSpan(cell.attrs, cell.attrs.colspan, col + cell.attrs.colspan - newWidth), cell.content);
        cells.push(cell);
        col += cell.attrs.colspan;
        for (var j = 1; j < cell.attrs.rowspan; j++) added[row + j] = (added[row + j] || 0) + cell.attrs.colspan;
      }
      newRows.push(Fragment.from(cells));
    }
    rows = newRows;
    width = newWidth;
  }
  if (height != newHeight) {
    var _newRows = [];
    for (var _row = 0, _i2 = 0; _row < newHeight; _row++, _i2++) {
      var _cells = [],
        source = rows[_i2 % height];
      for (var _j = 0; _j < source.childCount; _j++) {
        var _cell = source.child(_j);
        if (_row + _cell.attrs.rowspan > newHeight) _cell = _cell.type.create(_objectSpread2(_objectSpread2({}, _cell.attrs), {}, {
          rowspan: Math.max(1, newHeight - _cell.attrs.rowspan)
        }), _cell.content);
        _cells.push(_cell);
      }
      _newRows.push(Fragment.from(_cells));
    }
    rows = _newRows;
    height = newHeight;
  }
  return {
    width: width,
    height: height,
    rows: rows
  };
};
function growTable(tr, map, table, start, width, height, mapFrom) {
  var schema = tr.doc.type.schema;
  var types = tableNodeTypes(schema);
  var empty;
  var emptyHead;
  if (width > map.width) {
    for (var row = 0, rowEnd = 0; row < map.height; row++) {
      var rowNode = table.child(row);
      rowEnd += rowNode.nodeSize;
      var cells = [];
      var add = void 0;
      if (rowNode.lastChild == null || rowNode.lastChild.type == types.cell) add = empty || (empty = types.cell.createAndFill());else add = emptyHead || (emptyHead = types.headerCell.createAndFill());
      for (var i = map.width; i < width; i++) cells.push(add);
      tr.insert(tr.mapping.slice(mapFrom).map(rowEnd - 1 + start), cells);
    }
  }
  if (height > map.height) {
    var _cells2 = [];
    for (var _i3 = 0, _start = (map.height - 1) * map.width; _i3 < Math.max(map.width, width); _i3++) {
      var header = _i3 >= map.width ? false : table.nodeAt(map.map[_start + _i3]).type == types.headerCell;
      _cells2.push(header ? emptyHead || (emptyHead = types.headerCell.createAndFill()) : empty || (empty = types.cell.createAndFill()));
    }
    var emptyRow = types.row.create(null, Fragment.from(_cells2)),
      rows = [];
    for (var _i4 = map.height; _i4 < height; _i4++) rows.push(emptyRow);
    tr.insert(tr.mapping.slice(mapFrom).map(start + table.nodeSize - 2), rows);
  }
  return !!(empty || emptyHead);
}
function isolateHorizontal(tr, map, table, start, left, right, top, mapFrom) {
  if (top == 0 || top == map.height) return false;
  var found = false;
  for (var col = left; col < right; col++) {
    var index = top * map.width + col,
      pos = map.map[index];
    if (map.map[index - map.width] == pos) {
      found = true;
      var cell = table.nodeAt(pos);
      var _map$findCell = map.findCell(pos),
        cellTop = _map$findCell.top,
        cellLeft = _map$findCell.left;
      tr.setNodeMarkup(tr.mapping.slice(mapFrom).map(pos + start), null, _objectSpread2(_objectSpread2({}, cell.attrs), {}, {
        rowspan: top - cellTop
      }));
      tr.insert(tr.mapping.slice(mapFrom).map(map.positionAt(top, cellLeft, table)), cell.type.createAndFill(_objectSpread2(_objectSpread2({}, cell.attrs), {}, {
        rowspan: cellTop + cell.attrs.rowspan - top
      })));
      col += cell.attrs.colspan - 1;
    }
  }
  return found;
}
function isolateVertical(tr, map, table, start, top, bottom, left, mapFrom) {
  if (left == 0 || left == map.width) return false;
  var found = false;
  for (var row = top; row < bottom; row++) {
    var index = row * map.width + left,
      pos = map.map[index];
    if (map.map[index - 1] == pos) {
      found = true;
      var cell = table.nodeAt(pos);
      var cellLeft = map.colCount(pos);
      var updatePos = tr.mapping.slice(mapFrom).map(pos + start);
      tr.setNodeMarkup(updatePos, null, removeColSpan(cell.attrs, left - cellLeft, cell.attrs.colspan - (left - cellLeft)));
      tr.insert(updatePos + cell.nodeSize, cell.type.createAndFill(removeColSpan(cell.attrs, 0, left - cellLeft)));
      row += cell.attrs.rowspan - 1;
    }
  }
  return found;
}
var insertCells = function insertCells(state, dispatch, tableStart, rect, cells) {
  var table = tableStart ? state.doc.nodeAt(tableStart - 1) : state.doc;
  if (!table) throw new Error('No table found');
  var map = TableMap.get(table);
  var top = rect.top,
    left = rect.left;
  var right = left + cells.width,
    bottom = top + cells.height;
  var tr = state.tr;
  var mapFrom = 0;
  function recomp() {
    table = tableStart ? tr.doc.nodeAt(tableStart - 1) : tr.doc;
    if (!table) throw new Error('No table found');
    map = TableMap.get(table);
    mapFrom = tr.mapping.maps.length;
  }
  if (growTable(tr, map, table, tableStart, right, bottom, mapFrom)) recomp();
  if (isolateHorizontal(tr, map, table, tableStart, left, right, top, mapFrom)) recomp();
  if (isolateHorizontal(tr, map, table, tableStart, left, right, bottom, mapFrom)) recomp();
  if (isolateVertical(tr, map, table, tableStart, top, bottom, left, mapFrom)) recomp();
  if (isolateVertical(tr, map, table, tableStart, top, bottom, right, mapFrom)) recomp();
  for (var row = top; row < bottom; row++) {
    var from = map.positionAt(row, left, table),
      to = map.positionAt(row, right, table);
    tr.replace(tr.mapping.slice(mapFrom).map(from + tableStart), tr.mapping.slice(mapFrom).map(to + tableStart), new Slice(cells.rows[row - top], 0, 0));
  }
  recomp();
  tr.setSelection(new CellSelection(tr.doc.resolve(tableStart + map.positionAt(top, left, table)), tr.doc.resolve(tableStart + map.positionAt(bottom - 1, right - 1, table))));
  dispatch(tr);
};

var deleteCellSelection = function deleteCellSelection(state, dispatch) {
  var sel = state.selection;
  if (!(sel instanceof CellSelection)) return false;
  if (dispatch) {
    var tr = state.tr;
    var baseContent = tableNodeTypes(state.schema).cell.createAndFill().content;
    sel.forEachCell(function (cell, pos) {
      if (!cell.content.eq(baseContent)) tr.replace(tr.mapping.map(pos + 1), tr.mapping.map(pos + cell.nodeSize - 1), new Slice(baseContent, 0, 0));
    });
    if (tr.docChanged) dispatch(tr);
  }
  return true;
};
var handleKeyDown = keydownHandler({
  ArrowLeft: arrow('horiz', -1),
  ArrowRight: arrow('horiz', 1),
  ArrowUp: arrow('vert', -1),
  ArrowDown: arrow('vert', 1),
  'Shift-ArrowLeft': shiftArrow('horiz', -1),
  'Shift-ArrowRight': shiftArrow('horiz', 1),
  'Shift-ArrowUp': shiftArrow('vert', -1),
  'Shift-ArrowDown': shiftArrow('vert', 1),
  Backspace: deleteCellSelection,
  'Mod-Backspace': deleteCellSelection,
  Delete: deleteCellSelection,
  'Mod-Delete': deleteCellSelection
});
function maybeSetSelection(state, dispatch, selection) {
  if (selection.eq(state.selection)) return false;
  if (dispatch) dispatch(state.tr.setSelection(selection).scrollIntoView());
  return true;
}
function arrow(axis, dir) {
  return function (state, dispatch, view) {
    if (!view) return false;
    var sel = state.selection;
    if (sel instanceof CellSelection) {
      return maybeSetSelection(state, dispatch, Selection.near(sel.$headCell, dir));
    }
    if (axis != 'horiz' && !sel.empty) return false;
    var end = atEndOfCell(view, axis, dir);
    if (end == null) return false;
    if (axis == 'horiz') {
      return maybeSetSelection(state, dispatch, Selection.near(state.doc.resolve(sel.head + dir), dir));
    } else {
      var $cell = state.doc.resolve(end);
      var $next = nextCell($cell, axis, dir);
      var newSel;
      if ($next) newSel = Selection.near($next, 1);else if (dir < 0) newSel = Selection.near(state.doc.resolve($cell.before(-1)), -1);else newSel = Selection.near(state.doc.resolve($cell.after(-1)), 1);
      return maybeSetSelection(state, dispatch, newSel);
    }
  };
}
function shiftArrow(axis, dir) {
  return function (state, dispatch, view) {
    if (!view) return false;
    var cellSel;
    var sel = state.selection;
    if (sel instanceof CellSelection) {
      cellSel = sel;
    } else {
      var end = atEndOfCell(view, axis, dir);
      if (end == null) return false;
      cellSel = new CellSelection(state.doc.resolve(end));
    }
    var $head = nextCell(cellSel.$headCell, axis, dir);
    if (!$head) return false;
    return maybeSetSelection(state, dispatch, new CellSelection(cellSel.$anchorCell, $head));
  };
}
var handlePaste = function handlePaste(view, e, slice) {
  if (!isInTable(view.state)) return false;
  var cells = pastedCells(slice);
  var sel = view.state.selection;
  if (sel instanceof CellSelection) {
    if (!cells) cells = {
      width: 1,
      height: 1,
      rows: [Fragment.from(fitSlice(tableNodeTypes(view.state.schema).cell, slice))]
    };
    var table = sel.$anchorCell.node(-1);
    var start = sel.$anchorCell.start(-1);
    var rect = TableMap.get(table).rectBetween(sel.$anchorCell.pos - start, sel.$headCell.pos - start);
    cells = clipCells(cells, rect.right - rect.left, rect.bottom - rect.top);
    insertCells(view.state, view.dispatch, start, rect, cells);
    return true;
  } else if (cells) {
    var $cell = selectionCell(view.state);
    var _start = $cell.start(-1);
    insertCells(view.state, view.dispatch, _start, TableMap.get($cell.node(-1)).findCell($cell.pos - _start), cells);
    return true;
  } else {
    return false;
  }
};
function handleMouseDown(view, startEvent) {
  var _cellUnderMouse;
  if (startEvent.ctrlKey || startEvent.metaKey) return;
  var startDOMCell = domInCell(view, startEvent.target);
  var $cell = cellUnderMouse(view, startEvent);
  if (startDOMCell) {
    startEvent.preventDefault();
  }
  var $anchor;
  if (startEvent.shiftKey && view.state.selection instanceof CellSelection) {
    // Adding to an existing cell selection
    setCellSelection(view.state.selection.$anchorCell, startEvent);
    startEvent.preventDefault();
  } else if (startEvent.shiftKey && startDOMCell && ($anchor = cellAround(view.state.selection.$anchor)) != null && ((_cellUnderMouse = cellUnderMouse(view, startEvent)) === null || _cellUnderMouse === void 0 ? void 0 : _cellUnderMouse.pos) != $anchor.pos) {
    setCellSelection($anchor, startEvent);
    startEvent.preventDefault();
  } else if (!startDOMCell) {
    return;
  }
  function setCellSelection($anchor, event) {
    var _tableEditingKey$getS;
    var $head = cellUnderMouse(view, event);
    var starting = ((_tableEditingKey$getS = tableEditingKey.getState(view.state)) === null || _tableEditingKey$getS === void 0 ? void 0 : _tableEditingKey$getS.set) == null;
    if (!$head || !inSameTable($anchor, $head)) {
      if (starting) $head = $anchor;else return;
    }
    var selection = new CellSelection($anchor, $head);
    if (starting || !view.state.selection.eq(selection)) {
      var tr = view.state.tr.setSelection(selection);
      if (starting) tr.setMeta(tableEditingKey, {
        set: $anchor.pos
      });
      view.dispatch(tr);
    }
  }
  var x1 = startEvent.clientX,
    y1 = startEvent.clientY;
  function stop(e) {
    var _tableEditingKey$getS2;
    if ((e === null || e === void 0 ? void 0 : e.type) == 'mouseup') {
      var _event = e;
      var x2 = _event.clientX,
        y2 = _event.clientY;
      if (Math.abs(x1 - x2) < 4 && Math.abs(y1 - y2) < 4) {
        var pos = view.posAtCoords({
          left: x2,
          top: y2
        });
        if (pos) {
          var newSelection = TextSelection.create(view.state.doc, pos.pos, pos.pos);
          var tr = view.state.tr.setSelection(newSelection);
          view.dispatch(tr);
          view.focus();
        }
      } else {
        var _tableDOM$firstChild;
        var tableDOM = view.nodeDOM($cell.start(-2));
        tableDOM === null || tableDOM === void 0 || (_tableDOM$firstChild = tableDOM.firstChild) === null || _tableDOM$firstChild === void 0 || _tableDOM$firstChild.focus();
        // document.querySelector<HTMLElement>('.hiddenfocus')?.focus();
      }
    }
    view.root.removeEventListener('mouseup', stop);
    view.root.removeEventListener('dragstart', stop);
    view.root.removeEventListener('mousemove', move);
    if (!isEmpty$1((_tableEditingKey$getS2 = tableEditingKey.getState(view.state)) === null || _tableEditingKey$getS2 === void 0 ? void 0 : _tableEditingKey$getS2.set)) view.dispatch(view.state.tr.setMeta(tableEditingKey, {
      set: -1
    }));
  }
  var startPos = view.posAtCoords({
    left: x1,
    top: y1
  });
  function move(_event) {
    var _tableEditingKey$getS3;
    var event = _event;
    var anchor = (_tableEditingKey$getS3 = tableEditingKey.getState(view.state)) === null || _tableEditingKey$getS3 === void 0 ? void 0 : _tableEditingKey$getS3.set;
    var $anchor;
    if (anchor || anchor == 0) {
      $anchor = view.state.doc.resolve(anchor);
    } else if (domInCell(view, event.target) != startDOMCell) {
      $anchor = cellUnderMouse(view, startEvent);
      if (!$anchor) return stop();
      view.dom.blur();
    } else {
      var head = view.posAtCoords({
        left: event.clientX,
        top: event.clientY
      });
      view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, startPos.pos, head.pos)));
    }
    if ($anchor) setCellSelection($anchor, event);
  }
  view.root.addEventListener('mouseup', stop);
  view.root.addEventListener('dragstart', stop);
  view.root.addEventListener('mousemove', move);
}
function domInCell(view, dom) {
  for (; dom && dom != view.dom; dom = dom.parentNode) {
    if (dom.nodeName == 'TD' || dom.nodeName == 'TH') {
      return dom;
    }
  }
  return null;
}
function cellUnderMouse(view, event) {
  var mousePos = view.posAtCoords({
    left: event.clientX,
    top: event.clientY
  });
  if (!mousePos) return null;
  return mousePos ? cellAround(view.state.doc.resolve(mousePos.pos)) : null;
}
function atEndOfCell(view, axis, dir) {
  if (!(view.state.selection instanceof TextSelection)) return null;
  var $head = view.state.selection.$head;
  for (var d = $head.depth - 1; d >= 0; d--) {
    var parent = $head.node(d),
      index = dir < 0 ? $head.index(d) : $head.indexAfter(d);
    if (index != (dir < 0 ? 0 : parent.childCount)) return null;
    if (parent.type.spec.tableRole == 'cell' || parent.type.spec.tableRole == 'headerCell') {
      var cellPos = $head.before(d);
      var dirStr = axis == 'vert' ? dir > 0 ? 'down' : 'up' : dir > 0 ? 'right' : 'left';
      return view.endOfTextblock(dirStr) ? cellPos : null;
    }
  }
  return null;
}
var handleTripleClick = function handleTripleClick(view, pos) {
  var doc = view.state.doc,
    $cell = cellAround(doc.resolve(pos));
  if (!$cell) return false;
  view.dispatch(view.state.tr.setSelection(new CellSelection($cell)).setMeta(tableEditingKey, {
    set: $cell.pos
  }));
  return true;
};

function tableEditing(_ref) {
  var _ref$allowTableNodeSe = _ref.allowTableNodeSelection,
    allowTableNodeSelection = _ref$allowTableNodeSe === void 0 ? false : _ref$allowTableNodeSe;
  var getDecorations = function getDecorations(state) {
    var decs = [];
    decs = decs.concat(drawCellSelection(state));
    state.doc.descendants(function (node, pos) {
      if (node.type.name !== 'table') return;
      decs = decs.concat(addToolkit(node, pos));
    });
    return decs;
  };
  return new Plugin({
    key: tableEditingKey,
    state: {
      init: function init(_, state) {
        return {
          decorations: DecorationSet.create(state.doc, getDecorations(state)),
          set: null
        };
      },
      apply: function apply(tr, value, _, state) {
        var st = tr.getMeta(tableEditingKey);
        var _ref2 = st || {},
          _ref2$set = _ref2.set,
          set = _ref2$set === void 0 ? null : _ref2$set,
          hoverDecos = _ref2.hoverDecos;
        var decorations = DecorationSet.create(state.doc, getDecorations(state).concat(hoverDecos ? hoverDecos : value.hoverDecos || []));
        if (!isEmpty$1(value.set) && isEmpty$1(set)) {
          var _tr$mapping$mapResult = tr.mapping.mapResult(value.set),
            deleted = _tr$mapping$mapResult.deleted,
            pos = _tr$mapping$mapResult.pos;
          set = deleted ? null : pos;
        }
        return {
          set: isEmpty$1(set) || set == -1 ? null : set,
          decorations: decorations,
          hoverDecos: hoverDecos
        };
      }
    },
    props: {
      nodeViews: {
        table: TableViewConstructor
      },
      decorations: function decorations(state) {
        var _this$getState;
        return (_this$getState = this.getState(state)) === null || _this$getState === void 0 ? void 0 : _this$getState.decorations;
      },
      handleDOMEvents: {
        mousedown: handleMouseDown
      },
      handlePaste: handlePaste,
      handleTripleClick: handleTripleClick,
      handleKeyDown: handleKeyDown
      // createSelectionBetween(view) {
      // 	console.log('cre');
      // 	const set = tableEditingKey.getState(view.state)?.set;
      // 	console.log(set, 'selection');
      // 	return !isEmpty(set) ? view.state.selection : null;
      // }
    },
    appendTransaction: function appendTransaction(_, oldState, newState) {
      return normalizeSelection(newState,
      // newState.tr,
      fixTables(newState, oldState), allowTableNodeSelection);
    }
  });
}

var mathNodeSpec = {
  group: 'inline',
  inline: true,
  atom: true,
  toDOM: function toDOM(node) {
    return ['span', {
      "class": 'math-node'
    }, node.attrs.formula];
  },
  parseDOM: [{
    tag: 'span.math-node',
    getAttrs: function getAttrs(dom) {
      return {
        formula: dom.textContent
      };
    }
  }],
  attrs: {
    formula: {}
  }
};
var renderMath = function renderMath(formula) {
  var span = createElement('span', {
    "class": 'math-node'
  });
  katex.render(formula, span);
  return span;
};
var mathRender = function mathRender() {
  return new Plugin({
    props: {
      nodeViews: {
        math: function math(node, view, getPos) {
          var dom = renderMath(node.attrs.formula);
          return {
            dom: dom,
            update: function update(newNode) {
              if (newNode.type.name === 'math' && newNode.attrs.formula === node.attrs.formula) return true;
              return false;
            }
          };
        }
      }
    }
  });
};
var insertMath = function insertMath(view, formula) {
  var state = view.state,
    dispatch = view.dispatch;
  var node = state.schema.nodes.math.create({
    formula: formula
  });
  dispatch(state.tr.replaceSelectionWith(node));
};

var schema = new Schema({
  nodes: _objectSpread2(_objectSpread2({
    // 整个文档
    doc: {
      // 文档内容规定必须是 block 类型的节点（block 与 HTML 中的 block 概念差不多） `+` 号代表可以有一个或多个（规则类似正则）
      content: 'block+'
    },
    math: mathNodeSpec,
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
  })), {}, {
    horizontalRule: {
      group: 'block',
      parseDOM: [{
        tag: 'hr'
      }],
      toDOM: function toDOM() {
        return ['hr'];
      }
    },
    image: {
      inline: true,
      attrs: {
        src: {},
        alt: {
          "default": null
        },
        title: {
          "default": null
        }
      },
      group: 'inline',
      draggable: true,
      parseDOM: [{
        tag: 'img[src]',
        getAttrs: function getAttrs(dom) {
          return {
            src: dom.getAttribute('src'),
            title: dom.getAttribute('title'),
            alt: dom.getAttribute('alt')
          };
        }
      }],
      toDOM: function toDOM(node) {
        var _node$attrs = node.attrs,
          title = _node$attrs.title,
          src = _node$attrs.src,
          alt = _node$attrs.alt;
        return ['img', {
          title: title,
          src: src,
          alt: alt
        }];
      }
    },
    hardBreak: {
      inline: true,
      group: 'inline',
      selectable: false,
      parseDOM: [{
        tag: 'br'
      }],
      toDOM: function toDOM() {
        return ['br'];
      }
    }
  }),
  // 除了上面定义 node 节点，一些富文本样式，可以通过 marks 定义
  marks: {
    // 文本加粗
    bold: {
      toDOM: function toDOM() {
        return ['strong', 0];
      },
      parseDOM: [{
        tag: 'stong'
      }, {
        tag: 'b',
        getAttrs: function getAttrs(dom) {
          return dom.style.fontWeight !== 'normal' && null;
        }
      }, {
        style: 'font-weight',
        getAttrs: function getAttrs(val) {
          return /^(bold(er)?|[5-9]\d{2})$/.test(val) && null;
        }
      }]
    },
    italic: {
      group: 'heading',
      toDOM: function toDOM() {
        return ['em', 0];
      },
      parseDOM: [{
        tag: 'em'
      }, {
        tag: 'i',
        getAttrs: function getAttrs(dom) {
          return dom.style.fontStyle !== 'normal' && null;
        }
      }, {
        style: 'font-style=italic'
      }]
    },
    link: {
      group: 'heading',
      attrs: {
        href: {
          "default": null
        },
        ref: {
          "default": 'noopener noreferrer nofollow'
        },
        target: {
          "default": '_blank'
        },
        title: {
          "default": ''
        }
      },
      toDOM: function toDOM(mark) {
        var _mark$attrs = mark.attrs,
          href = _mark$attrs.href,
          ref = _mark$attrs.ref,
          target = _mark$attrs.target,
          title = _mark$attrs.title;
        return ['a', {
          href: href,
          ref: ref,
          target: target,
          title: title
        }, 0];
      },
      parseDOM: [{
        tag: 'a[href]:not([href *= "javascript:" i])'
      }]
    },
    underline: {
      parseDOM: [{
        tag: 'u'
      }, {
        style: 'text-decoration',
        getAttrs: function getAttrs(val) {
          return val === 'underline' && null;
        }
      }],
      toDOM: function toDOM() {
        return ['u', 0];
      }
    },
    linethrough: {
      parseDOM: [{
        tag: 's'
      }, {
        tag: 'strike'
      }, {
        style: 'text-decoration',
        getAttrs: function getAttrs(val) {
          return val === 'linethrough' && null;
        }
      }],
      toDOM: function toDOM() {
        return ['s', 0];
      }
    },
    style: {
      attrs: {
        color: {
          "default": null
        },
        fontSize: {
          "default": null
        },
        backgroundColor: {
          "default": null
        }
      },
      parseDOM: [{
        style: 'color',
        getAttrs: function getAttrs(val) {
          return {
            color: val
          };
        }
      }, {
        style: 'font-size',
        getAttrs: function getAttrs(val) {
          return {
            fontSize: val
          };
        }
      }, {
        style: 'background-color',
        getAttrs: function getAttrs(val) {
          return {
            backgroundColor: val
          };
        }
      }],
      toDOM: function toDOM(mark) {
        var _mark$attrs2 = mark.attrs,
          color = _mark$attrs2.color,
          fontSize = _mark$attrs2.fontSize,
          backgroundColor = _mark$attrs2.backgroundColor;
        var style = '';
        if (color) style += "color:".concat(color, "; ");
        if (fontSize) style += "font-size:".concat(fontSize, "; ");
        if (backgroundColor) style += "background-color:".concat(backgroundColor, "; ");
        return ['span', {
          style: style
        }, 0];
      }
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
      "class": 'scrollbar dc-block',
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
    var dom = createElement('div', {
      "class": spec["class"] || '' + ' menu-group'
    });
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

var setMark = function setMark(view, markType) {
  var attrs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var _view$state = view.state,
    schema = _view$state.schema,
    selection = _view$state.selection,
    tr = _view$state.tr;
  var $from = selection.$from,
    $to = selection.$to;
  var mark = schema.mark(markType, attrs);
  view.dispatch(tr.addMark($from.pos, $to.pos, mark));
  return true;
};
var unSetMark = function unSetMark(view, markType) {
  var _view$state2 = view.state,
    selection = _view$state2.selection,
    tr = _view$state2.tr,
    schema = _view$state2.schema;
  var $from = selection.$from,
    $to = selection.$to;
  view.dispatch(tr.removeMark($from.pos, $to.pos, getMarkType(markType, schema)));
};
function getMarkType(markType, schema) {
  return typeof markType === 'string' ? schema.marks[markType] : markType;
}
function isMarkActive(view, markType) {
  var _view$state3 = view.state,
    schema = _view$state3.schema,
    selection = _view$state3.selection,
    tr = _view$state3.tr;
  if (!(selection instanceof TextSelection)) return false;
  var $from = selection.$from,
    $to = selection.$to;
  var realMarkType = getMarkType(markType, schema);
  var isActive = true;
  tr.doc.nodesBetween($from.pos, $to.pos, function (node) {
    if (!isActive) return false;
    if (node.isInline) {
      var mark = realMarkType.isInSet(node.marks);
      if (!mark) isActive = false;
    }
  });
  return isActive;
}
function toggleMark(view, markType) {
  if (isMarkActive(view, markType)) return unSetMark(view, markType);else return setMark(view, markType);
}
var applyBold = function applyBold(view) {
  return toggleMark(view, 'bold');
};
var applyUnderline = function applyUnderline(view) {
  return toggleMark(view, 'underline');
};
var applyLinethrough = function applyLinethrough(view) {
  return toggleMark(view, 'linethrough');
};
var applylink = function applylink(url) {
  return function (view) {
    return setMark(view, 'link', {
      href: url
    });
  };
};
var applyStyle = function applyStyle(style) {
  return function (_ref) {
    var state = _ref.state,
      dispatch = _ref.dispatch;
    var schema = state.schema,
      selection = state.selection;
    var markType = schema.marks.style;
    var tr = state.tr;
    console.log(selection, 'sel');
    var from = selection.from,
      to = selection.to;
    state.doc.nodesBetween(from, to, function (node, pos) {
      if (node.isText) {
        var existingMark = node.marks.find(function (mark) {
          return mark.type === markType;
        });
        var attrs = existingMark ? _objectSpread2(_objectSpread2({}, existingMark.attrs), style) : style;
        tr = tr.addMark(pos < from ? from : pos, pos + node.nodeSize > to ? to : pos + node.nodeSize, markType.create(attrs));
      }
    });
    dispatch(tr);
    return true;
  };
};
var applyColor = function applyColor(color) {
  return applyStyle({
    color: color
  });
};

var FloatBar = /*#__PURE__*/function () {
  function FloatBar(view, spec) {
    _classCallCheck(this, FloatBar);
    this.menus = spec.menus.map(function (menu) {
      return new MenuItem(view, menu);
    });
    this.dom = createElement('div', {
      "class": spec["class"] || 'dc-float-bar'
    }, this.menus.map(function (menu) {
      return menu.dom;
    }));
  }
  return _createClass(FloatBar, [{
    key: "update",
    value: function update(view, state) {
      this.menus.forEach(function (menu) {
        return menu.update(view, state);
      });
    }
  }, {
    key: "destroy",
    value: function destroy() {}
  }]);
}();

var Tooltip = /*#__PURE__*/function () {
  function Tooltip() {
    _classCallCheck(this, Tooltip);
    _defineProperty(this, "visible", false);
    this.tooltip = createElement('div', {
      "class": 'dc-tooltip'
    });
    if (!Tooltip.container) {
      var container = createElement('div', {
        "class": 'dc-tooltip-container'
      });
      Tooltip.container = container;
      document.body.appendChild(container);
    }
    Tooltip.container.appendChild(this.tooltip);
    this.tooltip.addEventListener('mouseup', function (e) {
      e.stopPropagation();
      e.preventDefault();
    });
  }
  return _createClass(Tooltip, [{
    key: "content",
    value: function content(dom) {
      this.tooltip.replaceChildren(dom);
    }
  }, {
    key: "showAt",
    value: function showAt(rect) {
      this.tooltip.style.visibility = 'visible';
      this.tooltip.style.opacity = '1';
      this.visible = true;
      var _this$tooltip$getBoun = this.tooltip.getBoundingClientRect(),
        height = _this$tooltip$getBoun.height,
        width = _this$tooltip$getBoun.width;
      var top = rect.top - height - 5;
      var left = rect.left + (rect.width - width) / 2;
      this.tooltip.style.top = top + 'px';
      this.tooltip.style.left = left + 'px';
    }
  }, {
    key: "show",
    value: function show(target, content) {
      if (!this.tooltip) return;
      if (!content) ; else if (typeof content === 'string') this.tooltip.innerHTML = content;else {
        this.tooltip.replaceChildren(content);
      }
      this.tooltip.style.visibility = 'visible';
      this.tooltip.style.opacity = '1';
      this.visible = true;
      var rect = target.getBoundingClientRect();
      var _this$tooltip$getBoun2 = this.tooltip.getBoundingClientRect(),
        height = _this$tooltip$getBoun2.height,
        width = _this$tooltip$getBoun2.width;
      var top = rect.top - height - 5;
      var left = rect.left + (rect.width - width) / 2;
      this.tooltip.style.top = top + 'px';
      this.tooltip.style.left = left + 'px';
    }
  }, {
    key: "hide",
    value: function hide() {
      if (!this.tooltip) return;
      this.tooltip.style.opacity = '0';
      this.tooltip.style.visibility = 'hidden';
      this.visible = false;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this$tooltip$parentN;
      (_this$tooltip$parentN = this.tooltip.parentNode) === null || _this$tooltip$parentN === void 0 || _this$tooltip$parentN.removeChild(this.tooltip);
    }
  }], [{
    key: "get",
    value: function get() {
      var instance = Tooltip.instance;
      if (!instance) {
        instance = new Tooltip();
        Tooltip.instance = instance;
      }
      return instance;
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
          }, {
            label: '合并单元格',
            handler: function handler(_ref4) {
              var state = _ref4.state,
                dispatch = _ref4.dispatch;
                _ref4.view;
              mergeCells(state, dispatch);
            }
          }, {
            label: '插入公式',
            handler: function handler(_ref5) {
              var view = _ref5.view;
              var formula = prompt('输入一条 LaTex 公式: ');
              // console.log(escapeLatex(formula));
              if (formula) insertMath(view, formula);
            }
          }]
        }]
      });
      var onMouseDown = function onMouseDown(e) {
        var x1 = e.clientX,
          y1 = e.clientY;
        var onMouseup = function onMouseup(e) {
          var x2 = e.clientX,
            y2 = e.clientY;
          var sel = _view.state.selection;
          if (!sel.empty && (Math.abs(x1 - x2) > 5 || Math.abs(y1 - y2) > 5)) {
            var from = _view.coordsAtPos(sel.$from.pos);
            var to = _view.coordsAtPos(sel.$to.pos);
            var rect = {
              left: Math.min(from.left, to.left),
              right: Math.max(from.right, to.right),
              top: Math.min(from.top, to.top),
              bottom: Math.max(from.bottom, to.bottom)
            };
            tooltip.showAt(_objectSpread2(_objectSpread2({}, rect), {}, {
              width: Math.abs(rect.left - rect.right),
              height: Math.abs(rect.top - rect.bottom)
            }));
          } else if (tooltip.visible) {
            tooltip.hide();
          }
          _view.root.removeEventListener('mouseup', onMouseup);
        };
        _view.root.addEventListener('mouseup', onMouseup);
      };
      _view.root.addEventListener('mousedown', onMouseDown);
      var floatBar = new FloatBar(_view, {
        menus: [{
          label: '加粗',
          handler: function handler(_ref6) {
            var view = _ref6.view;
            applyBold(view);
          }
        }, {
          label: '链接',
          handler: function handler(_ref7) {
            var view = _ref7.view;
            applylink('www.baidu.com')(view);
          }
        }, {
          label: '下划线',
          handler: function handler(_ref8) {
            var view = _ref8.view;
            applyUnderline(view);
          }
        }, {
          label: '删除线',
          handler: function handler(_ref9) {
            var view = _ref9.view;
            applyLinethrough(view);
          }
        }, {
          label: '颜色',
          handler: function handler(_ref10) {
            var view = _ref10.view;
            applyColor('red')(view);
          }
        }, {
          label: '颜色‘',
          handler: function handler(_ref11) {
            var view = _ref11.view;
            applyColor()(view);
          }
        }]
      });
      var tooltip = new Tooltip();
      tooltip.content(floatBar.dom);
      return {
        dom: toolbar.dom,
        update: function update(view, prevState) {
          var _toolbar;
          (_toolbar = toolbar) === null || _toolbar === void 0 || _toolbar.update(view, prevState);
        },
        destroy: function destroy() {
          var _toolbar2;
          (_toolbar2 = toolbar) === null || _toolbar2 === void 0 || _toolbar2.destroy();
          _view.root.removeEventListener('mousedown', onMouseDown);
        }
      };
    }
  });
  return {
    plugin: toolbarPlugin,
    update: function update(view, state) {
      var _toolbar3;
      return (_toolbar3 = toolbar) === null || _toolbar3 === void 0 ? void 0 : _toolbar3.update(view, state);
    },
    destroy: function destroy() {
      var _toolbar4;
      (_toolbar4 = toolbar) === null || _toolbar4 === void 0 || _toolbar4.destroy();
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
    plugins: [buildInputRules(), keymap(myKeymap), history(), toolbar.plugin, highlightCodePlugin(), columnResizing(), tableEditing({}), mathRender()]
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
    },
    handleClickOn: function handleClickOn(view, pos, node, nodePos, event, direct) {
      var markType = view.state.schema.marks.link;
      var $pos = view.state.doc.resolve(pos);
      var marks = $pos.marks();
      if (marks.some(function (mark) {
        return mark.type === markType;
      })) {
        var linkMark = marks.find(function (mark) {
          return mark.type === markType;
        });
        var _ref = (linkMark === null || linkMark === void 0 ? void 0 : linkMark.attrs) || {},
          href = _ref.href,
          target = _ref.target;
        if (href) {
          if ($pos.end() === pos) return false;
          window.open(href, target);
        }
        return true;
      }
      return false;
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
