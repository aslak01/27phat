const epd2in7 = require("./build/Release/epd2in7");
const font = "./fonts/MesloLGS-NF-Regular.ttf";
const fontSize = 12;

const img = epd2in7.getImageBuffer("landscape");
const width = epd2in7.height;
const height = epd2in7.width;
let epdp = epd2in7.init({ fastLut: false });

const refreshDisplay = (message) =>
  (epdp = epdp
    // init is required since we set it sleeping at the end of this chain
    .then(() => epd2in7.init({ fastLut: false }))
    .then(() =>
      img.then((img) => {
        // display a black rectangle
        img.filledRectangle(
          Math.round(width / 8),
          Math.round(height / 8),
          Math.round((7 * width) / 8),
          Math.round((7 * height) / 8),
          epd2in7.colors.black
        );

        // Retrieve bounding box of displayed string
        let [xll, yll, xlr, ylr, xur, yur, xul, yul] = img.stringFTBBox(
          epd2in7.colors.white,
          font,
          fontSize,
          0,
          0,
          0,
          message
        );

        // Center the message
        img.stringFT(
          epd2in7.colors.white,
          font,
          fontSize,
          0,
          Math.round(width / 2 - (xur - xul) / 2),
          Math.round(height / 2 + (yll - yul) / 2),
          message
        );

        return epd2in7.displayImageBuffer(img);
      })
    )
    .then(() => epd2in7.sleep()));

refreshDisplay("Hello world !");

// Handle buttons
epd2in7.buttons.handler.then((handler) =>
  handler.on("pressed", function (button) {
    let buttonLabel = "none";
    switch (button) {
      case epd2in7.buttons.button1:
        buttonLabel = "first button";
        break;
      case epd2in7.buttons.button2:
        buttonLabel = "second button";
        break;
      case epd2in7.buttons.button3:
        buttonLabel = "third button";
        break;
      case epd2in7.buttons.button4:
        buttonLabel = "fourth button";
        break;
      default:
        buttonLabel = "an unknown button";
    }
    refreshDisplay(`You pressed \n${buttonLabel}`);
  })
);

// Handle exit
function exitHandler(options, err) {
  let promise = null;
  if (options.cleanup) {
    promise = img.then((img) => img.destroy());
  }

  if (err && err.stack) {
    console.log(err.stack);
  }

  if (options.exit) {
    if (promise !== null) {
      promise.then(() => process.exit());
    } else {
      process.exit();
    }
  }
}

process.on("exit", exitHandler.bind(null, { cleanup: true, exit: true }));
process.on("SIGINT", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));
process.on("uncaughtException", exitHandler.bind(null, { exit: true }));
