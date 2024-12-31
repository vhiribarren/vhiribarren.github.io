import {visit} from 'unist-util-visit'
import type { Root, Text } from 'mdast';
import {VFile} from 'vfile'


const DIRECTIVE_NAME = 'zoomableImage'

export function mdZoomableImageDirectivePlugin() {

  return function (tree: Root, file: VFile) {

    visit(tree, function (node) {
        const isDirective =
            node.type === 'containerDirective' ||
            node.type === 'leafDirective' ||
            node.type === 'textDirective';
        if (!isDirective || node.name !== DIRECTIVE_NAME) {
            return // not for this plugin
        }
        if (node.type === 'containerDirective') {
            file.fail(`Unexpected ":::${DIRECTIVE_NAME}" block directive, use one or two colons`, node)
        }

        const data = node.data || (node.data = {})
        const attributes = node.attributes || {}
        if (attributes.src == undefined) {
            file.fail("src parameter with URL is required", node)
        }
        attributes.alt = (node.children[0] as Text).value;
        node.children = []

        data.hName = 'img'
        data.hProperties = {
            width: attributes.width,
            height: attributes.height,
            alt: attributes.alt,
            src: attributes.src,
        }

    })

  }

}