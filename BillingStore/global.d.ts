export {}; // This file needs to be a module to augment global

declare global {
  var __reanimatedWorkletInitData: {
    printData?: string;
  } | undefined;
}
