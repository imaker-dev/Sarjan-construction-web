import { lazy } from "react";

export const lazyLoad = (importFn) => lazy(importFn);