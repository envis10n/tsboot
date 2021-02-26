const fs = require("fs");

const noop = () => {};

// Remove build and incremental build files.
fs.rm("build", {recursive: true, force: true}, noop);
fs.rm(".tsbuild", {force: true}, noop);