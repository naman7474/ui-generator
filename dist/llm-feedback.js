"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFeedback = void 0;
const gemini_1 = require("./gemini");
const buildFeedback = async (artifacts) => {
    return (0, gemini_1.generateMultiDeviceFixPrompt)(artifacts);
};
exports.buildFeedback = buildFeedback;
