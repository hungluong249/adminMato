/**
 * CaretContainer.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This module handles caret containers. A caret container is a node that
 * holds the caret for positional purposes.
 *
 * @private
 * @class tinymce.caret.CaretContainer
 */
define("tinymce/caret/CaretContainer", [
	"tinymce/dom/NodeType",
	"tinymce/text/Zwsp"
], function(NodeType, Zwsp) {
	var isElement = NodeType.isElement,
		isText = NodeType.isText;

	function isCaretContainerBlock(node) {
		if (isText(node)) {
			node = node.parentNode;
		}

		return isElement(node) && node.hasAttribute('data-mce-caret');
	}

	function isCaretContainerInline(node) {
		return isText(node) && Zwsp.isZwsp(node.data);
	}

	function isCaretContainer(node) {
		return isCaretContainerBlock(node) || isCaretContainerInline(node);
	}

	function removeNode(node) {
		var parentNode = node.parentNode;
		if (parentNode) {
			parentNode.removeChild(node);
		}
	}

	function getNodeValue(node) {
		try {
			return node.nodeValue;
		} catch (ex) {
			// IE sometimes produces "Invalid argument" on nodes
			return "";
		}
	}

	function setNodeValue(node, text) {
		if (text.length === 0) {
			removeNode(node);
		} else {
			node.nodeValue = text;
		}
	}

	function insertInline(node, before) {
		var doc, sibling, textNode, parentNode;

		doc = node.ownerDocument;
		textNode = doc.createTextNode(Zwsp.ZWSP);
		parentNode = node.parentNode;

		if (!before) {
			sibling = node.nextSibling;
			if (isText(sibling)) {
				if (isCaretContainer(sibling)) {
					return sibling;
				}

				if (startsWithCaretContainer(sibling)) {
					sibling.splitText(1);
					return sibling;
				}
			}

			if (node.nextSibling) {
				parentNode.insertBefore(textNode, node.nextSibling);
			} else {
				parentNode.appendChild(textNode);
			}
		} else {
			sibling = node.previousSibling;
			if (isText(sibling)) {
				if (isCaretContainer(sibling)) {
					return sibling;
				}

				if (endsWithCaretContainer(sibling)) {
					return sibling.splitText(sibling.data.length - 1);
				}
			}

			parentNode.insertBefore(textNode, node);
		}

		return textNode;
	}

	function insertBlock(blockName, node, before) {
		var doc, blockNode, parentNode;

		doc = node.ownerDocument;
		blockNode = doc.createElement(blockName);
		blockNode.setAttribute('data-mce-caret', before ? 'before' : 'after');
		blockNode.setAttribute('data-mce-bogus', 'all');
		blockNode.appendChild(doc.createTextNode('\u00a0'));
		parentNode = node.parentNode;

		if (!before) {
			if (node.nextSibling) {
				parentNode.insertBefore(blockNode, node.nextSibling);
			} else {
				parentNode.appendChild(blockNode);
			}
		} else {
			parentNode.insertBefore(blockNode, node);
		}

		return blockNode;
	}

	function remove(caretContainerNode) {
		if (isElement(caretContainerNode) && isCaretContainer(caretContainerNode)) {
			if (caretContainerNode.innerHTML != '&nbsp;') {
				caretContainerNode.removeAttribute('data-mce-caret');
			} else {
				removeNode(caretContainerNode);
			}
		}

		if (isText(caretContainerNode)) {
			var text = Zwsp.trim(getNodeValue(caretContainerNode));
			setNodeValue(caretContainerNode, text);
		}
	}

	function startsWithCaretContainer(node) {
		return isText(node) && node.data[0] == Zwsp.ZWSP;
	}

	function endsWithCaretContainer(node) {
		return isText(node) && node.data[node.data.length - 1] == Zwsp.ZWSP;
	}

	return {
		isCaretContainer: isCaretContainer,
		isCaretContainerBlock: isCaretContainerBlock,
		isCaretContainerInline: isCaretContainerInline,
		insertInline: insertInline,
		insertBlock: insertBlock,
		remove: remove,
		startsWithCaretContainer: startsWithCaretContainer,
		endsWithCaretContainer: endsWithCaretContainer
	};
});