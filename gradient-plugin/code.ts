// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 316, height: 600 });

figma.ui.onmessage = (msg) => {
  if (msg.type === "generate") {
    const { colors } = msg;

    const parentFrame = figma.createFrame();

    parentFrame.resize(400, 100);

    parentFrame.name = "Gradient";
    parentFrame.primaryAxisSizingMode = "AUTO";
    parentFrame.counterAxisSizingMode = "AUTO";

    const rect = figma.createRectangle();

    rect.resize(400, 100);

    const gradientStops: ColorStop[] = colors.map((color: RGB, i: number) => {
      const colorStop: ColorStop = {
        color: {
          r: color.r / 255,
          g: color.g / 255,
          b: color.b / 255,
          a: 1,
        },
        position: i / (colors.length - 1),
      };

      return colorStop;
    });

    rect.fills = [
      {
        type: "GRADIENT_LINEAR",
        gradientStops,
        gradientTransform: [
          [1, 0, 0],
          [0, 1, 0],
        ],
      },
    ];

    parentFrame.appendChild(rect);

    const nodes: SceneNode[] = [];
    nodes.push(parentFrame);
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }

  figma.closePlugin();
};
