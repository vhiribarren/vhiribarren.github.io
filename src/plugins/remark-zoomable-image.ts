import {visit} from 'unist-util-visit'
import type { Root, Text, Paragraph as P } from 'mdast';
import {VFile} from 'vfile'
import { h as _h, s as _s, type Properties } from 'hastscript';

const DIRECTIVE_NAME = 'zoomableImage'
const STYLE_ID = `${DIRECTIVE_NAME}_style`
const JAVASCRIPT_ID = `${DIRECTIVE_NAME}_javascript`

const HTML_STYLE = `
<style>
    .zoomable-image-wrapper > img {
        cursor: zoom-in;
    }
    .fullscreen-dlg {
        margin: 0 !important;
        padding: 0;
        border-width: 0;
        width: 100vw;
        height: 100vh;
        max-height: 100%;
        max-width: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        cursor: zoom-out;
    }
    .flex-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
    }
    .fullscreen-dlg img {
        display: block;
        margin: auto;
        max-height: 100%;
        width: auto;
        height: max-content;
    }
</style>
`
const JAVASCRIPT_CODE = `
<script>
(function() {
    const zoomableImages = document.querySelectorAll(".zoomable-image-wrapper > img");
    zoomableImages.forEach(zoomableImage => {
        const linkedZoomedImage = zoomableImage.parentElement.querySelector(".fullscreen-dlg");
        zoomableImage.onclick = () => {
            linkedZoomedImage.showModal();
        };
        linkedZoomedImage.onclick = () => {
            linkedZoomedImage.close();
        };
    });
})()
</script>
`

// From https://github.com/withastro/starlight/blob/main/packages/starlight/integrations/asides.ts
function h(el: string, attrs: Properties = {}, children: any[] = []): P {
	const { tagName, properties } = _h(el, attrs)
	return {
		type: 'paragraph',
		data: { hName: tagName, hProperties: properties },
		children,
	}
}

interface BuildHastForMdastParams {
    src: string
    alt: string
    width?: string | null
    height?: string | null
    style?: string | null
}
function buildHastForMdast({src, alt, width, height, style}: BuildHastForMdastParams) {
    return h(
        'div', {class: 'zoomable-image-wrapper'}, [
            {type: 'image', url: src, alt, data: {hName: "img", hProperties: {width, height, style}}},
            h('dialog', {class: 'fullscreen-dlg'}, [
                h('div', { class: 'flex-wrapper', }, [
                    {type: 'image', url: src, alt},
                ]),
            ]),
        ]
    )
}


export function mdZoomableImageDirectivePlugin() {

  return function (tree: Root, file: VFile) {

    visit(tree, function (node, _index, _parent) {
        const isDirective =
            node.type === 'containerDirective' ||
            node.type === 'leafDirective' ||
            node.type === 'textDirective'
        if (!isDirective || node.name !== DIRECTIVE_NAME) {
            return // not for this plugin
        }
        if (node.type === 'containerDirective') {
            file.fail(`Unexpected ":::${DIRECTIVE_NAME}" block directive, use one or two colons`, node)
        }
        const attributes = node.attributes || {}
        if (attributes.src == undefined) {
            file.fail("src parameter with URL is required", node)
        }
        let src = attributes.src
        let width = attributes.width
        let height = attributes.height
        let style = attributes.style
        let alt = (node.children[0] as Text).value

        const hast = buildHastForMdast({src, alt, width, height, style})
        const data = node.data || (node.data = {})
        data.hName = hast.data!.hName
        data.hProperties = hast.data!.hProperties
        node.children = hast.children

        if (tree.children.every( c => c.id !== STYLE_ID)) {
            tree.children.push({id: STYLE_ID, type: 'html', value: HTML_STYLE})
        }
        if (tree.children.every( c => c.id !== JAVASCRIPT_ID)) {
            tree.children.push({id: JAVASCRIPT_ID, type: 'html', value: JAVASCRIPT_CODE})
        }
    })

  }

}