if (!figma.currentPage.selection.length) {
  figma.closePlugin("Please select an image");
}

if (figma.currentPage.selection.length > 1) {
  figma.closePlugin("Please select a single image");
}

function isPaintNode(fills: RectangleNode["fills"]): fills is Paint[] {
  return Array.isArray(fills);
}

async function convert(paint: ImagePaint) {
  if (!paint.imageHash) return;

  const image = figma.getImageByHash(paint.imageHash);

  if (!image) return;

  const bytes = await image.getBytesAsync();

  figma.showUI(__html__, { visible: false });
  figma.ui.postMessage(bytes);

  const svg: string = await new Promise((resolve) => {
    figma.ui.onmessage = (value) => resolve(value);
  });

  const parentFrame = figma.createFrame();
  parentFrame.name = "Icon";

  const node = figma.createNodeFromSvg(svg);

  const width = node.width;
  const height = node.height;

  parentFrame.resize(width, height);
  parentFrame.appendChild(node);

  const nodes: SceneNode[] = [];

  nodes.push(parentFrame);
  figma.currentPage.selection = nodes;
  figma.viewport.scrollAndZoomIntoView(nodes);

  return;
}

async function preconvert(node: SceneNode) {
  if (node.type !== "RECTANGLE") {
    return figma.closePlugin("Please select a single image");
  }

  const { fills } = node;

  if (!isPaintNode(fills)) {
    return figma.closePlugin("The select node is not a valid image");
  }

  for (const paint of fills) {
    if (paint.type !== "IMAGE") {
      return figma.closePlugin("The select node is not a valid image");
    }

    await convert(paint);
  }
  return;
}

Promise.all(
  figma.currentPage.selection.map((selected) => preconvert(selected))
).then(() => {
  return figma.closePlugin();
});
