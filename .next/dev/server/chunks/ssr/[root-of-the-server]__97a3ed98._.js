module.exports = [
"[externals]/mongodb [external] (mongodb, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("mongodb", () => require("mongodb"));

module.exports = mod;
}),
"[project]/src/app/database/product.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "databaseName",
    ()=>databaseName,
    "getProductDatabase",
    ()=>getProductDatabase,
    "mongoUri",
    ()=>mongoUri
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongodb [external] (mongodb, cjs)");
;
const mongoUri = "mongodb+srv://taget-clothe-api-v3:gOLnob3ViyD60xPT@cluster0.iswyjxz.mongodb.net/taget-clothe-api-v3?appName=Cluster0";
const databaseName = "taget-clothe-api-v3";
const clientOptions = {};
const client = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$29$__["MongoClient"](mongoUri, clientOptions);
const clientPromise = globalThis._productMongoClientPromise ?? client.connect().then((connectedClient)=>connectedClient);
if ("TURBOPACK compile-time truthy", 1) {
    globalThis._productMongoClientPromise = clientPromise;
}
async function getProductDatabase() {
    const connectedClient = await clientPromise;
    return connectedClient.db(databaseName);
}
;
}),
"[project]/src/app/dashboard/items/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"000a61d53817bbaeac70d146a5b0f339435b8f0980":"getDashboardProducts","0036d8afb5b4151d822ab2808619bb112151232c0a":"getDashboardCategories","003b9ea90b70d86ea2a174109486f07593577473be":"getDashboardBrands"},"",""] */ __turbopack_context__.s([
    "getDashboardBrands",
    ()=>getDashboardBrands,
    "getDashboardCategories",
    ()=>getDashboardCategories,
    "getDashboardProducts",
    ()=>getDashboardProducts
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$database$2f$product$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/database/product.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
function serializeDocument(document) {
    return JSON.parse(JSON.stringify(document));
}
async function getDashboardProducts() {
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$database$2f$product$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getProductDatabase"])();
    const products = await db.collection("products").find({}).sort({
        createdAt: -1
    }).toArray();
    return products.map(serializeDocument);
}
async function getDashboardCategories() {
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$database$2f$product$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getProductDatabase"])();
    const categories = await db.collection("categories").find({}).sort({
        category: 1
    }).toArray();
    return categories.map(serializeDocument);
}
async function getDashboardBrands() {
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$database$2f$product$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getProductDatabase"])();
    const brands = await db.collection("item_brands").find({}).sort({
        item_brand: 1
    }).toArray();
    return brands.map(serializeDocument);
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getDashboardProducts,
    getDashboardCategories,
    getDashboardBrands
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getDashboardProducts, "000a61d53817bbaeac70d146a5b0f339435b8f0980", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getDashboardCategories, "0036d8afb5b4151d822ab2808619bb112151232c0a", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getDashboardBrands, "003b9ea90b70d86ea2a174109486f07593577473be", null);
}),
"[project]/.next-internal/server/app/dashboard/items/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/dashboard/items/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$dashboard$2f$items$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/dashboard/items/actions.ts [app-rsc] (ecmascript)");
;
;
;
}),
"[project]/.next-internal/server/app/dashboard/items/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/dashboard/items/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "000a61d53817bbaeac70d146a5b0f339435b8f0980",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$dashboard$2f$items$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDashboardProducts"],
    "0036d8afb5b4151d822ab2808619bb112151232c0a",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$dashboard$2f$items$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDashboardCategories"],
    "003b9ea90b70d86ea2a174109486f07593577473be",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$dashboard$2f$items$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDashboardBrands"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$dashboard$2f$items$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$dashboard$2f$items$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/dashboard/items/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/dashboard/items/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$dashboard$2f$items$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/dashboard/items/actions.ts [app-rsc] (ecmascript)");
}),
"[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/* eslint-disable import/no-extraneous-dependencies */ Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "registerServerReference", {
    enumerable: true,
    get: function() {
        return _server.registerServerReference;
    }
});
const _server = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)"); //# sourceMappingURL=server-reference.js.map
}),
"[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// This function ensures that all the exported values are valid server actions,
// during the runtime. By definition all actions are required to be async
// functions, but here we can only check that they are functions.
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ensureServerEntryExports", {
    enumerable: true,
    get: function() {
        return ensureServerEntryExports;
    }
});
function ensureServerEntryExports(actions) {
    for(let i = 0; i < actions.length; i++){
        const action = actions[i];
        if (typeof action !== 'function') {
            throw Object.defineProperty(new Error(`A "use server" file can only export async functions, found ${typeof action}.\nRead more: https://nextjs.org/docs/messages/invalid-use-server-value`), "__NEXT_ERROR_CODE", {
                value: "E352",
                enumerable: false,
                configurable: true
            });
        }
    }
} //# sourceMappingURL=action-validate.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__97a3ed98._.js.map