const del = require("del");

del.sync(["dist/**", "!dist/miniprogram_npm"]);
