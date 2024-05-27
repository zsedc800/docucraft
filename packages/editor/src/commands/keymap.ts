import {
  splitBlock,
  chainCommands,
  newlineInCode,
  createParagraphNear,
  liftEmptyBlock,
  baseKeymap,
} from 'prosemirror-commands';
import { Attrs, Fragment, NodeType, Slice } from 'prosemirror-model';
import { canSplit } from 'prosemirror-transform';
import {
  Command,
  EditorState,
  NodeSelection,
  Transaction,
  Selection,
} from 'prosemirror-state';
import { schema } from '../model';
import { redo, undo } from 'prosemirror-history';
import { EditorView } from 'prosemirror-view';
import { createTaskList } from '../components/taskList';

const splitListItem = (itemType: NodeType, itemAttrs?: Attrs): Command => {
  return (
    state: EditorState,
    dispatch?: (tr: Transaction) => void
  ): boolean => {
    let { $from, $to, node } = state.selection as NodeSelection;
    if ((node && node.isBlock) || $from.depth < 2 || !$from.sameParent($to))
      return false;
    let grandParent = $from.node(-1);
    if (
      grandParent.type != itemType &&
      grandParent.type != schema.nodes.taskItem
    )
      return false;
    const liCount = $from.node(-2).childCount;
    if (
      $from.parent.content.size == 0 &&
      $from.node(-1).childCount == $from.indexAfter(-1)
    ) {
      // In an empty block. If this is a nested list, the wrapping
      // list item should be split. Otherwise, bail out and let next
      // command handle lifting.
      if (
        $from.depth == 3 ||
        $from.node(-3).type != itemType ||
        $from.index(-2) != liCount - 1
      )
        return false;
      if (dispatch) {
        let wrap = Fragment.empty;
        let depthBefore = $from.index(-1) ? 1 : $from.index(-2) ? 2 : 3;
        // Build a fragment containing empty versions of the structure
        // from the outer list item to the parent node of the cursor
        for (let d = $from.depth - depthBefore; d >= $from.depth - 3; d--)
          wrap = Fragment.from($from.node(d).copy(wrap));
        // wrap = Fragment.from($from.node($from.depth - depthBefore).copy(wrap));
        let depthAfter =
          $from.indexAfter(-1) < $from.node(-2).childCount
            ? 1
            : $from.indexAfter(-2) < $from.node(-3).childCount
              ? 2
              : 3;
        // Add a second list item with an empty default start node
        wrap = wrap.append(Fragment.from(itemType.createAndFill()));

        let start = $from.before($from.depth - (depthBefore - 1));
        const s = new Slice(wrap, 4 - depthBefore, 0);
        let tr = state.tr.replace(start, $from.after(-depthAfter), s);
        let sel = -1;
        tr.doc.nodesBetween(start, tr.doc.content.size, (node, pos) => {
          if (sel > -1) return false;
          if (node.isTextblock && node.content.size == 0) sel = pos + 1;
        });
        if (sel > -1) tr.setSelection(Selection.near(tr.doc.resolve(sel)));
        dispatch(tr.scrollIntoView());
      }
      return true;
    }
    let nextType =
      $to.pos == $from.end() ? grandParent.contentMatchAt(0).defaultType : null;
    let tr = state.tr.delete($from.pos, $to.pos);
    let types = nextType
      ? [
          itemAttrs ? { type: itemType, attrs: itemAttrs } : null,
          { type: nextType },
        ]
      : undefined;
    if (!canSplit(tr.doc, $from.pos, 2, types)) return false;
    if (dispatch) dispatch(tr.split($from.pos, 2, types).scrollIntoView());
    return true;
  };
};

export const myKeymap: { [key: string]: Command } = {
  ...baseKeymap,
  Enter: chainCommands(
    splitListItem(schema.nodes.list_item),
    newlineInCode,
    createParagraphNear,
    liftEmptyBlock,
    splitBlock
  ),
  'Mod-z': undo,
  'Mod-y': redo,
  Tab: (state: EditorState, dispatch?: EditorView['dispatch']) => {
    const { $from, $to } = state.selection;
    console.log($from.parent, 'p');
    if (!$from.sameParent($to) || $from.parent.type !== schema.nodes.codeBlock)
      return false;
    if (dispatch) {
      dispatch(state.tr.insertText('\t'));
      return true;
    }
    return false;
  },
  'Ctrl-Shift-L': createTaskList,
};
