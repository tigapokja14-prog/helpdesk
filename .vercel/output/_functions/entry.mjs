import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_B3TEKyKA.mjs';
import { manifest } from './manifest_BpkxI_MD.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin.astro.mjs');
const _page2 = () => import('./pages/api/auth/admin.astro.mjs');
const _page3 = () => import('./pages/api/auth/login.astro.mjs');
const _page4 = () => import('./pages/api/balasan.astro.mjs');
const _page5 = () => import('./pages/api/tiket/_id_.astro.mjs');
const _page6 = () => import('./pages/api/tiket.astro.mjs');
const _page7 = () => import('./pages/api/upload.astro.mjs');
const _page8 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin/index.astro", _page1],
    ["src/pages/api/auth/admin.ts", _page2],
    ["src/pages/api/auth/login.ts", _page3],
    ["src/pages/api/balasan/index.ts", _page4],
    ["src/pages/api/tiket/[id].ts", _page5],
    ["src/pages/api/tiket/index.ts", _page6],
    ["src/pages/api/upload.ts", _page7],
    ["src/pages/index.astro", _page8]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "1636be1b-f62a-42bd-b835-0331a92de1fb",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
