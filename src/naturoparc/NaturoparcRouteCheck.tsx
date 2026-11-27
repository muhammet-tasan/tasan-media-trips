import React from 'react';
import { RouteCheck, RouteCheckConfig, RouteCheckProps } from '../route-check/RouteCheck';
import config from './route-check.json';

// Thin per-video wrapper: all destination/route data lives in route-check.json
// and public/geo/naturoparc-routes.geojson (python3 scripts/fetch-routes.py naturoparc).
export const NaturoparcRouteCheck: React.FC<RouteCheckProps> = ({ holdSeconds }) => (
	<RouteCheck config={config as RouteCheckConfig} routesFile="geo/naturoparc-routes.geojson" holdSeconds={holdSeconds} />
);

export const NATUROPARC_ROUTE_CHECK_CONFIG = config as RouteCheckConfig;

// Alternative without text container: same config, `plate.enabled: false` (text directly on the map, text-shadow only).
export const NATUROPARC_ROUTE_CHECK_NO_PLATE_CONFIG: RouteCheckConfig = {
	...(config as RouteCheckConfig),
	plate: { ...(config as RouteCheckConfig).plate, enabled: false, textShadow: '0 0 3px rgba(246,241,227,0.95), 0 0 9px rgba(246,241,227,0.95), 0 0 18px rgba(246,241,227,0.75)' },
};
export const NaturoparcRouteCheckNoPlate: React.FC<RouteCheckProps> = ({ holdSeconds }) => (
	<RouteCheck config={NATUROPARC_ROUTE_CHECK_NO_PLATE_CONFIG} routesFile="geo/naturoparc-routes.geojson" holdSeconds={holdSeconds} />
);

// Editorial Travel Map variant: theme 'editorial' (Inter, forest green/terracotta, container-free left-aligned block, SVG icons).
// Same routes, animations, order and timing as the other variants (`at` values unchanged).
export const NATUROPARC_ROUTE_CHECK_EDITORIAL_CONFIG: RouteCheckConfig = {
	...(config as RouteCheckConfig),
	theme: 'editorial',
	infoLines: [
		{ text: 'Kostenloser Parkplatz', icon: 'parking', at: 6.5 },
		{ text: 'Busverbindung', icon: 'bus', at: 9 },
		{ text: 'Linie 106 · Colmar → Hunawihr', size: 'detail', at: 10.5 },
	],
	destination: { ...(config as RouteCheckConfig).destination, location: 'Hunawihr · bei Colmar' },
};
export const NaturoparcRouteCheckEditorial: React.FC<RouteCheckProps> = ({ holdSeconds }) => (
	<RouteCheck config={NATUROPARC_ROUTE_CHECK_EDITORIAL_CONFIG} routesFile="geo/naturoparc-routes.geojson" holdSeconds={holdSeconds} />
);
