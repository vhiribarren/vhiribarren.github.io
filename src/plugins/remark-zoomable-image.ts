import {visit} from 'unist-util-visit'
import type { Root, Text } from 'mdast';
import {VFile} from 'vfile'
import { h as _h, s as _s, type Properties } from 'hastscript';


const DIRECTIVE_NAME = 'zoomableImage'


/** Hacky function that generates an mdast HTML tree ready for conversion to HTML by rehype. */
function h(el: string, attrs: Properties = {}, children: any[] = []): P {
	const { tagName, properties } = _h(el, attrs);
	return {
		type: 'paragraph',
		data: { hName: tagName, hProperties: properties },
		children,
	};
}

function buildHastForMdast({src, alt, width, height}) {
    return h(
        'div', {class: 'zoomable-image-wrapper'}, [
            h('img', {src, alt, width, height}),
            h('dialog', {class: 'fullscreen-dlg'}, [
                h('div', { class: 'flex-wrapper', }, [
                    h('img', {src, alt}),
                ]),
            ]),
            h('script', {}, [{type: 'text', value: `
                (function() {
                    const zoomableImages = document.querySelectorAll(".zoomable-image-wrapper > img");
                    zoomableImages.forEach(zoomableImage => {
                        const linkedZoomedImage = zoomableImage.parentElement.querySelector(".fullscreen-dlg");
                        zoomableImage.addEventListener("click", () => {
                            linkedZoomedImage.showModal();
                        });
                        linkedZoomedImage.addEventListener("click", () => {
                            linkedZoomedImage.close();
                        });
                    });
                })()
            `}]),
            h('style', {}, [{type: 'text', value: `
                .zoomable-img {
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
                    max-width: 100%;
                    height: max-content;
                } 
            `}]),
        ]
    );
}


export function mdZoomableImageDirectivePlugin() {

  return function (tree: Root, file: VFile) {

    visit(tree, function (node, _index, _parent) {
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
        const attributes = node.attributes || {}
        if (attributes.src == undefined) {
            file.fail("src parameter with URL is required", node)
        }
        let src = attributes.src;
        let width = attributes.width;
        let height = attributes.height;
        let alt = (node.children[0] as Text).value;

        const hast = buildHastForMdast({src, alt, width, height});
        const data = node.data || (node.data = {})
        data.hName = hast.data.hName;
        data.hProperties = hast.data.hProperties;
        node.children = hast.children
    })

  }

}