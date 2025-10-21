"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "middleware";
exports.ids = ["middleware"];
exports.modules = {

/***/ "(middleware)/./node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=%2FUsers%2Fchronode%2FDocuments%2Fzero-noise%2Fsrc%2Fmiddleware.ts&page=%2Fmiddleware&rootDir=%2FUsers%2Fchronode%2FDocuments%2Fzero-noise&matchers=&preferredRegion=&middlewareConfig=e30%3D!":
/*!************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=%2FUsers%2Fchronode%2FDocuments%2Fzero-noise%2Fsrc%2Fmiddleware.ts&page=%2Fmiddleware&rootDir=%2FUsers%2Fchronode%2FDocuments%2Fzero-noise&matchers=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ nHandler)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/web/globals */ \"(middleware)/./node_modules/next/dist/server/web/globals.js\");\n/* harmony import */ var next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/web/adapter */ \"(middleware)/./node_modules/next/dist/server/web/adapter.js\");\n/* harmony import */ var next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _src_middleware_ts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/middleware.ts */ \"(middleware)/./src/middleware.ts\");\n/* harmony import */ var next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/dist/client/components/is-next-router-error */ \"(middleware)/./node_modules/next/dist/client/components/is-next-router-error.js\");\n/* harmony import */ var next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_3__);\n\n\n// Import the userland code.\n\n\n\nconst mod = {\n    ..._src_middleware_ts__WEBPACK_IMPORTED_MODULE_2__\n};\nconst handler = mod.middleware || mod.default;\nconst page = \"/middleware\";\nif (typeof handler !== 'function') {\n    throw Object.defineProperty(new Error(`The Middleware \"${page}\" must export a \\`middleware\\` or a \\`default\\` function`), \"__NEXT_ERROR_CODE\", {\n        value: \"E120\",\n        enumerable: false,\n        configurable: true\n    });\n}\n// Middleware will only sent out the FetchEvent to next server,\n// so load instrumentation module here and track the error inside middleware module.\nfunction errorHandledHandler(fn) {\n    return async (...args)=>{\n        try {\n            return await fn(...args);\n        } catch (err) {\n            // In development, error the navigation API usage in runtime,\n            // since it's not allowed to be used in middleware as it's outside of react component tree.\n            if (true) {\n                if ((0,next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_3__.isNextRouterError)(err)) {\n                    err.message = `Next.js navigation API is not allowed to be used in Middleware.`;\n                    throw err;\n                }\n            }\n            const req = args[0];\n            const url = new URL(req.url);\n            const resource = url.pathname + url.search;\n            await (0,next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_0__.edgeInstrumentationOnRequestError)(err, {\n                path: resource,\n                method: req.method,\n                headers: Object.fromEntries(req.headers.entries())\n            }, {\n                routerKind: 'Pages Router',\n                routePath: '/middleware',\n                routeType: 'middleware',\n                revalidateReason: undefined\n            });\n            throw err;\n        }\n    };\n}\nfunction nHandler(opts) {\n    return (0,next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_1__.adapter)({\n        ...opts,\n        page,\n        handler: errorHandledHandler(handler)\n    });\n}\n\n//# sourceMappingURL=middleware.js.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vbm9kZV9tb2R1bGVzL25leHQvZGlzdC9idWlsZC93ZWJwYWNrL2xvYWRlcnMvbmV4dC1taWRkbGV3YXJlLWxvYWRlci5qcz9hYnNvbHV0ZVBhZ2VQYXRoPSUyRlVzZXJzJTJGY2hyb25vZGUlMkZEb2N1bWVudHMlMkZ6ZXJvLW5vaXNlJTJGc3JjJTJGbWlkZGxld2FyZS50cyZwYWdlPSUyRm1pZGRsZXdhcmUmcm9vdERpcj0lMkZVc2VycyUyRmNocm9ub2RlJTJGRG9jdW1lbnRzJTJGemVyby1ub2lzZSZtYXRjaGVycz0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBc0M7QUFDaUI7QUFDdkQ7QUFDNEM7QUFDcUM7QUFDSTtBQUNyRjtBQUNBLE9BQU8sK0NBQUk7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZEQUE2RCxLQUFLO0FBQ2xFO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0EsZ0JBQWdCLElBQXFDO0FBQ3JELG9CQUFvQixtR0FBaUI7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsK0ZBQWlDO0FBQ25EO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNlO0FBQ2YsV0FBVyxxRUFBTztBQUNsQjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUEiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCJuZXh0L2Rpc3Qvc2VydmVyL3dlYi9nbG9iYWxzXCI7XG5pbXBvcnQgeyBhZGFwdGVyIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvd2ViL2FkYXB0ZXJcIjtcbi8vIEltcG9ydCB0aGUgdXNlcmxhbmQgY29kZS5cbmltcG9ydCAqIGFzIF9tb2QgZnJvbSBcIi4vc3JjL21pZGRsZXdhcmUudHNcIjtcbmltcG9ydCB7IGVkZ2VJbnN0cnVtZW50YXRpb25PblJlcXVlc3RFcnJvciB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3dlYi9nbG9iYWxzXCI7XG5pbXBvcnQgeyBpc05leHRSb3V0ZXJFcnJvciB9IGZyb20gXCJuZXh0L2Rpc3QvY2xpZW50L2NvbXBvbmVudHMvaXMtbmV4dC1yb3V0ZXItZXJyb3JcIjtcbmNvbnN0IG1vZCA9IHtcbiAgICAuLi5fbW9kXG59O1xuY29uc3QgaGFuZGxlciA9IG1vZC5taWRkbGV3YXJlIHx8IG1vZC5kZWZhdWx0O1xuY29uc3QgcGFnZSA9IFwiL21pZGRsZXdhcmVcIjtcbmlmICh0eXBlb2YgaGFuZGxlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShuZXcgRXJyb3IoYFRoZSBNaWRkbGV3YXJlIFwiJHtwYWdlfVwiIG11c3QgZXhwb3J0IGEgXFxgbWlkZGxld2FyZVxcYCBvciBhIFxcYGRlZmF1bHRcXGAgZnVuY3Rpb25gKSwgXCJfX05FWFRfRVJST1JfQ09ERVwiLCB7XG4gICAgICAgIHZhbHVlOiBcIkUxMjBcIixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xufVxuLy8gTWlkZGxld2FyZSB3aWxsIG9ubHkgc2VudCBvdXQgdGhlIEZldGNoRXZlbnQgdG8gbmV4dCBzZXJ2ZXIsXG4vLyBzbyBsb2FkIGluc3RydW1lbnRhdGlvbiBtb2R1bGUgaGVyZSBhbmQgdHJhY2sgdGhlIGVycm9yIGluc2lkZSBtaWRkbGV3YXJlIG1vZHVsZS5cbmZ1bmN0aW9uIGVycm9ySGFuZGxlZEhhbmRsZXIoZm4pIHtcbiAgICByZXR1cm4gYXN5bmMgKC4uLmFyZ3MpPT57XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgZm4oLi4uYXJncyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgLy8gSW4gZGV2ZWxvcG1lbnQsIGVycm9yIHRoZSBuYXZpZ2F0aW9uIEFQSSB1c2FnZSBpbiBydW50aW1lLFxuICAgICAgICAgICAgLy8gc2luY2UgaXQncyBub3QgYWxsb3dlZCB0byBiZSB1c2VkIGluIG1pZGRsZXdhcmUgYXMgaXQncyBvdXRzaWRlIG9mIHJlYWN0IGNvbXBvbmVudCB0cmVlLlxuICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNOZXh0Um91dGVyRXJyb3IoZXJyKSkge1xuICAgICAgICAgICAgICAgICAgICBlcnIubWVzc2FnZSA9IGBOZXh0LmpzIG5hdmlnYXRpb24gQVBJIGlzIG5vdCBhbGxvd2VkIHRvIGJlIHVzZWQgaW4gTWlkZGxld2FyZS5gO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVxID0gYXJnc1swXTtcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocmVxLnVybCk7XG4gICAgICAgICAgICBjb25zdCByZXNvdXJjZSA9IHVybC5wYXRobmFtZSArIHVybC5zZWFyY2g7XG4gICAgICAgICAgICBhd2FpdCBlZGdlSW5zdHJ1bWVudGF0aW9uT25SZXF1ZXN0RXJyb3IoZXJyLCB7XG4gICAgICAgICAgICAgICAgcGF0aDogcmVzb3VyY2UsXG4gICAgICAgICAgICAgICAgbWV0aG9kOiByZXEubWV0aG9kLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IE9iamVjdC5mcm9tRW50cmllcyhyZXEuaGVhZGVycy5lbnRyaWVzKCkpXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgcm91dGVyS2luZDogJ1BhZ2VzIFJvdXRlcicsXG4gICAgICAgICAgICAgICAgcm91dGVQYXRoOiAnL21pZGRsZXdhcmUnLFxuICAgICAgICAgICAgICAgIHJvdXRlVHlwZTogJ21pZGRsZXdhcmUnLFxuICAgICAgICAgICAgICAgIHJldmFsaWRhdGVSZWFzb246IHVuZGVmaW5lZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbkhhbmRsZXIob3B0cykge1xuICAgIHJldHVybiBhZGFwdGVyKHtcbiAgICAgICAgLi4ub3B0cyxcbiAgICAgICAgcGFnZSxcbiAgICAgICAgaGFuZGxlcjogZXJyb3JIYW5kbGVkSGFuZGxlcihoYW5kbGVyKVxuICAgIH0pO1xufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1taWRkbGV3YXJlLmpzLm1hcFxuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(middleware)/./node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=%2FUsers%2Fchronode%2FDocuments%2Fzero-noise%2Fsrc%2Fmiddleware.ts&page=%2Fmiddleware&rootDir=%2FUsers%2Fchronode%2FDocuments%2Fzero-noise&matchers=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(middleware)/./src/auth.ts":
/*!*********************!*\
  !*** ./src/auth.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   auth: () => (/* binding */ auth),\n/* harmony export */   handlers: () => (/* binding */ handlers),\n/* harmony export */   signIn: () => (/* binding */ signIn),\n/* harmony export */   signOut: () => (/* binding */ signOut)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(middleware)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth_providers_nodemailer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/nodemailer */ \"(middleware)/./node_modules/next-auth/providers/nodemailer.js\");\n/* harmony import */ var _auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @auth/prisma-adapter */ \"(middleware)/./node_modules/@auth/prisma-adapter/index.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/prisma */ \"(middleware)/./src/lib/prisma.ts\");\n\n\n\n\nconst { handlers, auth, signIn, signOut } = (0,next_auth__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n    adapter: (0,_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_2__.PrismaAdapter)(_lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma),\n    trustHost: true,\n    providers: [\n        (0,next_auth_providers_nodemailer__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            server: {\n                host: process.env.EMAIL_SERVER_HOST,\n                port: Number(process.env.EMAIL_SERVER_PORT),\n                secure: true,\n                auth: {\n                    user: process.env.EMAIL_SERVER_USER,\n                    pass: process.env.EMAIL_SERVER_PASSWORD\n                }\n            },\n            from: process.env.EMAIL_FROM\n        })\n    ],\n    callbacks: {\n        async signIn ({ user }) {\n            // Check whitelist for all sign-ins\n            const existingUser = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.user.findUnique({\n                where: {\n                    email: user.email\n                }\n            });\n            if (!existingUser) {\n                // Create user record but reject sign-in (must be whitelisted first)\n                await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.user.create({\n                    data: {\n                        email: user.email,\n                        name: user.name,\n                        provider: \"email\",\n                        isWhitelisted: false\n                    }\n                });\n                return false;\n            }\n            if (!existingUser.isWhitelisted) {\n                return false // Reject sign-in\n                ;\n            }\n            // Update last login\n            await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.user.update({\n                where: {\n                    id: existingUser.id\n                },\n                data: {\n                    lastLoginAt: new Date()\n                }\n            });\n            return true;\n        },\n        async session ({ session, token }) {\n            if (token && session.user) {\n                // Fetch latest user data for session\n                const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.user.findUnique({\n                    where: {\n                        email: token.email\n                    },\n                    select: {\n                        id: true,\n                        email: true,\n                        name: true,\n                        image: true,\n                        isAdmin: true,\n                        xp: true,\n                        isWhitelisted: true\n                    }\n                });\n                if (user) {\n                    session.user.id = user.id;\n                    session.user.isAdmin = user.isAdmin;\n                    session.user.xp = user.xp;\n                    session.user.isWhitelisted = user.isWhitelisted;\n                }\n            }\n            return session;\n        },\n        async jwt ({ token, user }) {\n            if (user) {\n                token.id = user.id;\n                token.email = user.email;\n            }\n            return token;\n        }\n    },\n    pages: {\n        signIn: \"/auth/signin\",\n        error: \"/auth/error\"\n    },\n    session: {\n        strategy: \"jwt\",\n        maxAge: 30 * 24 * 60 * 60\n    },\n    secret: process.env.NEXTAUTH_SECRET\n});\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QU0sT0FBTztRQUNMekMsUUFBUTtRQUNSMEMsT0FBTztJQUNUO0lBQ0FSLFNBQVM7UUFDUFMsVUFBVTtRQUNWQyxRQUFRLEtBQUssS0FBSyxLQUFLO0lBQ3pCO0lBQ0FDLFFBQVF0QyxRQUFRQyxHQUFHLENBQUNzQyxlQUFlO0FBQ3JDLEdBQUUiLCJzb3VyY2VzIjpbIi9Vc2Vycy9jaHJvbm9kZS9Eb2N1bWVudHMvemVyby1ub2lzZS9zcmMvYXV0aC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTmV4dEF1dGggZnJvbSBcIm5leHQtYXV0aFwiXG5pbXBvcnQgTm9kZW1haWxlciBmcm9tIFwibmV4dC1hdXRoL3Byb3ZpZGVycy9ub2RlbWFpbGVyXCJcbmltcG9ydCB7IFByaXNtYUFkYXB0ZXIgfSBmcm9tIFwiQGF1dGgvcHJpc21hLWFkYXB0ZXJcIlxuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSBcIkAvbGliL3ByaXNtYVwiXG5cbmV4cG9ydCBjb25zdCB7IGhhbmRsZXJzLCBhdXRoLCBzaWduSW4sIHNpZ25PdXQgfSA9IE5leHRBdXRoKHtcbiAgYWRhcHRlcjogUHJpc21hQWRhcHRlcihwcmlzbWEpLFxuICB0cnVzdEhvc3Q6IHRydWUsXG4gIHByb3ZpZGVyczogW1xuICAgIE5vZGVtYWlsZXIoe1xuICAgICAgc2VydmVyOiB7XG4gICAgICAgIGhvc3Q6IHByb2Nlc3MuZW52LkVNQUlMX1NFUlZFUl9IT1NULFxuICAgICAgICBwb3J0OiBOdW1iZXIocHJvY2Vzcy5lbnYuRU1BSUxfU0VSVkVSX1BPUlQpLFxuICAgICAgICBzZWN1cmU6IHRydWUsXG4gICAgICAgIGF1dGg6IHtcbiAgICAgICAgICB1c2VyOiBwcm9jZXNzLmVudi5FTUFJTF9TRVJWRVJfVVNFUiEsXG4gICAgICAgICAgcGFzczogcHJvY2Vzcy5lbnYuRU1BSUxfU0VSVkVSX1BBU1NXT1JEISxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBmcm9tOiBwcm9jZXNzLmVudi5FTUFJTF9GUk9NLFxuICAgIH0pLFxuICBdLFxuICBjYWxsYmFja3M6IHtcbiAgICBhc3luYyBzaWduSW4oeyB1c2VyIH0pIHtcbiAgICAgIC8vIENoZWNrIHdoaXRlbGlzdCBmb3IgYWxsIHNpZ24taW5zXG4gICAgICBjb25zdCBleGlzdGluZ1VzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcbiAgICAgICAgd2hlcmU6IHsgZW1haWw6IHVzZXIuZW1haWwhIH1cbiAgICAgIH0pXG4gICAgICBcbiAgICAgIGlmICghZXhpc3RpbmdVc2VyKSB7XG4gICAgICAgIC8vIENyZWF0ZSB1c2VyIHJlY29yZCBidXQgcmVqZWN0IHNpZ24taW4gKG11c3QgYmUgd2hpdGVsaXN0ZWQgZmlyc3QpXG4gICAgICAgIGF3YWl0IHByaXNtYS51c2VyLmNyZWF0ZSh7XG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgZW1haWw6IHVzZXIuZW1haWwhLFxuICAgICAgICAgICAgbmFtZTogdXNlci5uYW1lLFxuICAgICAgICAgICAgcHJvdmlkZXI6IFwiZW1haWxcIixcbiAgICAgICAgICAgIGlzV2hpdGVsaXN0ZWQ6IGZhbHNlLFxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmICghZXhpc3RpbmdVc2VyLmlzV2hpdGVsaXN0ZWQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlIC8vIFJlamVjdCBzaWduLWluXG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFVwZGF0ZSBsYXN0IGxvZ2luXG4gICAgICBhd2FpdCBwcmlzbWEudXNlci51cGRhdGUoe1xuICAgICAgICB3aGVyZTogeyBpZDogZXhpc3RpbmdVc2VyLmlkIH0sXG4gICAgICAgIGRhdGE6IHsgbGFzdExvZ2luQXQ6IG5ldyBEYXRlKCkgfVxuICAgICAgfSlcbiAgICAgIFxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9LFxuICAgIGFzeW5jIHNlc3Npb24oeyBzZXNzaW9uLCB0b2tlbiB9KSB7XG4gICAgICBpZiAodG9rZW4gJiYgc2Vzc2lvbi51c2VyKSB7XG4gICAgICAgIC8vIEZldGNoIGxhdGVzdCB1c2VyIGRhdGEgZm9yIHNlc3Npb25cbiAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xuICAgICAgICAgIHdoZXJlOiB7IGVtYWlsOiB0b2tlbi5lbWFpbCEgfSxcbiAgICAgICAgICBzZWxlY3Q6IHtcbiAgICAgICAgICAgIGlkOiB0cnVlLFxuICAgICAgICAgICAgZW1haWw6IHRydWUsXG4gICAgICAgICAgICBuYW1lOiB0cnVlLFxuICAgICAgICAgICAgaW1hZ2U6IHRydWUsXG4gICAgICAgICAgICBpc0FkbWluOiB0cnVlLFxuICAgICAgICAgICAgeHA6IHRydWUsXG4gICAgICAgICAgICBpc1doaXRlbGlzdGVkOiB0cnVlLFxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgXG4gICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgc2Vzc2lvbi51c2VyLmlkID0gdXNlci5pZFxuICAgICAgICAgIHNlc3Npb24udXNlci5pc0FkbWluID0gdXNlci5pc0FkbWluXG4gICAgICAgICAgc2Vzc2lvbi51c2VyLnhwID0gdXNlci54cFxuICAgICAgICAgIHNlc3Npb24udXNlci5pc1doaXRlbGlzdGVkID0gdXNlci5pc1doaXRlbGlzdGVkXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIHNlc3Npb25cbiAgICB9LFxuICAgIGFzeW5jIGp3dCh7IHRva2VuLCB1c2VyIH0pIHtcbiAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgIHRva2VuLmlkID0gdXNlci5pZFxuICAgICAgICB0b2tlbi5lbWFpbCA9IHVzZXIuZW1haWxcbiAgICAgIH1cbiAgICAgIHJldHVybiB0b2tlblxuICAgIH1cbiAgfSxcbiAgcGFnZXM6IHtcbiAgICBzaWduSW46IFwiL2F1dGgvc2lnbmluXCIsXG4gICAgZXJyb3I6IFwiL2F1dGgvZXJyb3JcIixcbiAgfSxcbiAgc2Vzc2lvbjoge1xuICAgIHN0cmF0ZWd5OiBcImp3dFwiLFxuICAgIG1heEFnZTogMzAgKiAyNCAqIDYwICogNjAsIC8vIDMwIGRheXNcbiAgfSxcbiAgc2VjcmV0OiBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQsXG59KVxuIl0sIm5hbWVzIjpbIk5leHRBdXRoIiwiTm9kZW1haWxlciIsIlByaXNtYUFkYXB0ZXIiLCJwcmlzbWEiLCJoYW5kbGVycyIsImF1dGgiLCJzaWduSW4iLCJzaWduT3V0IiwiYWRhcHRlciIsInRydXN0SG9zdCIsInByb3ZpZGVycyIsInNlcnZlciIsImhvc3QiLCJwcm9jZXNzIiwiZW52IiwiRU1BSUxfU0VSVkVSX0hPU1QiLCJwb3J0IiwiTnVtYmVyIiwiRU1BSUxfU0VSVkVSX1BPUlQiLCJzZWN1cmUiLCJ1c2VyIiwiRU1BSUxfU0VSVkVSX1VTRVIiLCJwYXNzIiwiRU1BSUxfU0VSVkVSX1BBU1NXT1JEIiwiZnJvbSIsIkVNQUlMX0ZST00iLCJjYWxsYmFja3MiLCJleGlzdGluZ1VzZXIiLCJmaW5kVW5pcXVlIiwid2hlcmUiLCJlbWFpbCIsImNyZWF0ZSIsImRhdGEiLCJuYW1lIiwicHJvdmlkZXIiLCJpc1doaXRlbGlzdGVkIiwidXBkYXRlIiwiaWQiLCJsYXN0TG9naW5BdCIsIkRhdGUiLCJzZXNzaW9uIiwidG9rZW4iLCJzZWxlY3QiLCJpbWFnZSIsImlzQWRtaW4iLCJ4cCIsImp3dCIsInBhZ2VzIiwiZXJyb3IiLCJzdHJhdGVneSIsIm1heEFnZSIsInNlY3JldCIsIk5FWFRBVVRIX1NFQ1JFVCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(middleware)/./src/auth.ts\n");

/***/ }),

/***/ "(middleware)/./src/lib/prisma.ts":
/*!***************************!*\
  !*** ./src/lib/prisma.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient({\n    log:  true ? [\n        'query',\n        'error',\n        'warn'\n    ] : 0\n});\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vc3JjL2xpYi9wcmlzbWEudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQTZDO0FBRTdDLE1BQU1DLGtCQUFrQkM7QUFJakIsTUFBTUMsU0FDWEYsZ0JBQWdCRSxNQUFNLElBQ3RCLElBQUlILHdEQUFZQSxDQUFDO0lBQ2ZJLEtBQUtDLEtBQXNDLEdBQUc7UUFBQztRQUFTO1FBQVM7S0FBTyxHQUFHLENBQVM7QUFDdEYsR0FBRTtBQUVKLElBQUlBLElBQXFDLEVBQUVKLGdCQUFnQkUsTUFBTSxHQUFHQSIsInNvdXJjZXMiOlsiL1VzZXJzL2Nocm9ub2RlL0RvY3VtZW50cy96ZXJvLW5vaXNlL3NyYy9saWIvcHJpc21hLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gJ0BwcmlzbWEvY2xpZW50J1xuXG5jb25zdCBnbG9iYWxGb3JQcmlzbWEgPSBnbG9iYWxUaGlzIGFzIHVua25vd24gYXMge1xuICBwcmlzbWE6IFByaXNtYUNsaWVudCB8IHVuZGVmaW5lZFxufVxuXG5leHBvcnQgY29uc3QgcHJpc21hID1cbiAgZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA/P1xuICBuZXcgUHJpc21hQ2xpZW50KHtcbiAgICBsb2c6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnID8gWydxdWVyeScsICdlcnJvcicsICd3YXJuJ10gOiBbJ2Vycm9yJ10sXG4gIH0pXG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBnbG9iYWxGb3JQcmlzbWEucHJpc21hID0gcHJpc21hXG4iXSwibmFtZXMiOlsiUHJpc21hQ2xpZW50IiwiZ2xvYmFsRm9yUHJpc21hIiwiZ2xvYmFsVGhpcyIsInByaXNtYSIsImxvZyIsInByb2Nlc3MiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(middleware)/./src/lib/prisma.ts\n");

/***/ }),

/***/ "(middleware)/./src/middleware.ts":
/*!***************************!*\
  !*** ./src/middleware.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   runtime: () => (/* binding */ runtime)\n/* harmony export */ });\n/* harmony import */ var _auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/auth */ \"(middleware)/./src/auth.ts\");\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/server */ \"(middleware)/./node_modules/next/dist/api/server.js\");\nconst runtime = 'nodejs';\n\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_auth__WEBPACK_IMPORTED_MODULE_0__.auth)((req)=>{\n    const isLoggedIn = !!req.auth;\n    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');\n    if (!isLoggedIn && !isAuthPage) {\n        return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.redirect(new URL('/auth/signin', req.url));\n    }\n    if (isLoggedIn && isAuthPage) {\n        return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.redirect(new URL('/', req.url));\n    }\n    return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.next();\n}));\nconst config = {\n    matcher: [\n        \"/((?!api|_next/static|_next/image|favicon.ico).*)\"\n    ]\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vc3JjL21pZGRsZXdhcmUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBTyxNQUFNQSxVQUFVLFNBQVE7QUFFRjtBQUNhO0FBRTFDLGlFQUFlQywyQ0FBSUEsQ0FBQyxDQUFDRTtJQUNuQixNQUFNQyxhQUFhLENBQUMsQ0FBQ0QsSUFBSUYsSUFBSTtJQUM3QixNQUFNSSxhQUFhRixJQUFJRyxPQUFPLENBQUNDLFFBQVEsQ0FBQ0MsVUFBVSxDQUFDO0lBRW5ELElBQUksQ0FBQ0osY0FBYyxDQUFDQyxZQUFZO1FBQzlCLE9BQU9ILHFEQUFZQSxDQUFDTyxRQUFRLENBQUMsSUFBSUMsSUFBSSxnQkFBZ0JQLElBQUlRLEdBQUc7SUFDOUQ7SUFFQSxJQUFJUCxjQUFjQyxZQUFZO1FBQzVCLE9BQU9ILHFEQUFZQSxDQUFDTyxRQUFRLENBQUMsSUFBSUMsSUFBSSxLQUFLUCxJQUFJUSxHQUFHO0lBQ25EO0lBRUEsT0FBT1QscURBQVlBLENBQUNVLElBQUk7QUFDMUIsRUFBRTtBQUVLLE1BQU1DLFNBQVM7SUFDcEJDLFNBQVM7UUFBQztLQUFvRDtBQUNoRSxFQUFDIiwic291cmNlcyI6WyIvVXNlcnMvY2hyb25vZGUvRG9jdW1lbnRzL3plcm8tbm9pc2Uvc3JjL21pZGRsZXdhcmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IHJ1bnRpbWUgPSAnbm9kZWpzJ1xuXG5pbXBvcnQgeyBhdXRoIH0gZnJvbSBcIkAvYXV0aFwiXG5pbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIlxuXG5leHBvcnQgZGVmYXVsdCBhdXRoKChyZXEpID0+IHtcbiAgY29uc3QgaXNMb2dnZWRJbiA9ICEhcmVxLmF1dGhcbiAgY29uc3QgaXNBdXRoUGFnZSA9IHJlcS5uZXh0VXJsLnBhdGhuYW1lLnN0YXJ0c1dpdGgoJy9hdXRoJylcblxuICBpZiAoIWlzTG9nZ2VkSW4gJiYgIWlzQXV0aFBhZ2UpIHtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLnJlZGlyZWN0KG5ldyBVUkwoJy9hdXRoL3NpZ25pbicsIHJlcS51cmwpKVxuICB9XG5cbiAgaWYgKGlzTG9nZ2VkSW4gJiYgaXNBdXRoUGFnZSkge1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UucmVkaXJlY3QobmV3IFVSTCgnLycsIHJlcS51cmwpKVxuICB9XG5cbiAgcmV0dXJuIE5leHRSZXNwb25zZS5uZXh0KClcbn0pXG5cbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XG4gIG1hdGNoZXI6IFtcIi8oKD8hYXBpfF9uZXh0L3N0YXRpY3xfbmV4dC9pbWFnZXxmYXZpY29uLmljbykuKilcIl0sXG59XG4iXSwibmFtZXMiOlsicnVudGltZSIsImF1dGgiLCJOZXh0UmVzcG9uc2UiLCJyZXEiLCJpc0xvZ2dlZEluIiwiaXNBdXRoUGFnZSIsIm5leHRVcmwiLCJwYXRobmFtZSIsInN0YXJ0c1dpdGgiLCJyZWRpcmVjdCIsIlVSTCIsInVybCIsIm5leHQiLCJjb25maWciLCJtYXRjaGVyIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(middleware)/./src/middleware.ts\n");

/***/ }),

/***/ "../app-render/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/server/app-render/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/action-async-storage.external.js");

/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../lib/cache-handlers/default.external":
/*!**************************************************************************!*\
  !*** external "next/dist/server/lib/cache-handlers/default.external.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/lib/cache-handlers/default.external.js");

/***/ }),

/***/ "./work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "dns":
/*!**********************!*\
  !*** external "dns" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("dns");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("net");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "node:async_hooks":
/*!***********************************!*\
  !*** external "node:async_hooks" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("node:async_hooks");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "tls":
/*!**********************!*\
  !*** external "tls" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("tls");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("./webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/nodemailer","vendor-chunks/jose","vendor-chunks/oauth4webapi","vendor-chunks/preact","vendor-chunks/preact-render-to-string","vendor-chunks/@auth","vendor-chunks/@panva"], () => (__webpack_exec__("(middleware)/./node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=%2FUsers%2Fchronode%2FDocuments%2Fzero-noise%2Fsrc%2Fmiddleware.ts&page=%2Fmiddleware&rootDir=%2FUsers%2Fchronode%2FDocuments%2Fzero-noise&matchers=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();