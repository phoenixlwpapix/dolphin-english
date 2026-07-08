/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _lib_permissions from "../_lib/permissions.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as courses from "../courses.js";
import type * as creditConfig from "../creditConfig.js";
import type * as credits from "../credits.js";
import type * as http from "../http.js";
import type * as learningPaths from "../learningPaths.js";
import type * as progress from "../progress.js";
import type * as userCourses from "../userCourses.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "_lib/permissions": typeof _lib_permissions;
  analytics: typeof analytics;
  auth: typeof auth;
  courses: typeof courses;
  creditConfig: typeof creditConfig;
  credits: typeof credits;
  http: typeof http;
  learningPaths: typeof learningPaths;
  progress: typeof progress;
  userCourses: typeof userCourses;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
