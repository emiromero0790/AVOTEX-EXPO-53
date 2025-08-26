/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(app)` | `/(app)/` | `/(app)/agenda` | `/(app)/mapping` | `/(app)/results` | `/(app)/scan` | `/(auth)` | `/_sitemap` | `/agenda` | `/mapping` | `/results` | `/scan`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
