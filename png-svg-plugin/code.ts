type Res = SuccessfulResponse;

type SuccessfulResponse = {
  type: "success";
  data: string;
};

if (!figma.currentPage.selection.length) {
  figma.closePlugin("Please select a PNG/JPG image");
}

if (figma.currentPage.selection.length > 1) {
  figma.closePlugin("Please select a single image");
}

// TODO: Get current position of select image, and create new image next to it

function isPaintNode(fills: RectangleNode["fills"]): fills is Paint[] {
  return Array.isArray(fills);
}

async function convert(paint: ImagePaint) {
  if (!paint.imageHash) return;

  const image = figma.getImageByHash(paint.imageHash);

  if (!image) return;

  const bytes = await image.getBytesAsync();

  if (bytes.length > 3000) {
    figma.closePlugin(
      "The file you selected was too large. Please select an image smaller than 3kb"
    );
  }

  figma.showUI(__html__, { visible: false });
  figma.ui.postMessage(bytes);

  const response: Res = await new Promise((resolve) => {
    figma.ui.onmessage = (value) => resolve(value);
  });

  const parentFrame = figma.createFrame();
  parentFrame.name = "Icon";

  const node = figma.createNodeFromSvg(response.data);

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
  return figma.closePlugin("Your image has been successfully converted");
});
