import React from 'react';
import { RouteCheck, RouteCheckConfig, RouteCheckProps } from '../route-check/RouteCheck';
import config from './route-check.json';

// Thin per-video wrapper: all destination/route data lives in route-check.json
// and public/geo/naturoparc-routes.geojson (python3 scripts/fetch-routes.py naturoparc).
export const NaturoparcRouteCheck: React.FC<RouteCheckProps> = ({ holdSeconds }) => (
	<RouteCheck config={config as RouteCheckConfig} routesFile="geo/naturoparc-routes.geojson" holdSeconds={holdSeconds} />
);

export const NATUROPARC_ROUTE_CHECK_CONFIG = config as RouteCheckConfig;
