import React from 'react';
import { Composition } from 'remotion';
import { MulhouseRouteCheck } from './mulhouse-automobile-museum/MulhouseRouteCheck';
import { MulhouseTripScore, MULHOUSE_TRIP_SCORE_DURATION } from './mulhouse-automobile-museum/MulhouseTripScore';
import { NaturoparcRouteCheck, NaturoparcRouteCheckNoPlate, NaturoparcRouteCheckEditorial, NATUROPARC_ROUTE_CHECK_CONFIG } from './naturoparc/NaturoparcRouteCheck';
import { routeCheckTimeline } from './route-check/RouteCheck';
import { TasanBrandIntro, INTRO_DURATION } from './brand/TasanBrandIntro';

export const Root: React.FC = () => {
	return (
		<>
			<Composition
				id="MulhouseTest"
				component={MulhouseTest}
				durationInFrames={150}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="MulhouseRouteCheck"
				component={MulhouseRouteCheck}
				durationInFrames={480}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="NaturoparcRouteCheck"
				component={NaturoparcRouteCheck}
				defaultProps={{ holdSeconds: 2 }}
				calculateMetadata={({ props }) => ({
					durationInFrames: routeCheckTimeline(NATUROPARC_ROUTE_CHECK_CONFIG, props.holdSeconds).duration,
				})}
				durationInFrames={672}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="NaturoparcRouteCheckNoPlate"
				component={NaturoparcRouteCheckNoPlate}
				defaultProps={{ holdSeconds: 2 }}
				calculateMetadata={({ props }) => ({
					durationInFrames: routeCheckTimeline(NATUROPARC_ROUTE_CHECK_CONFIG, props.holdSeconds).duration,
				})}
				durationInFrames={672}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="NaturoparcRouteCheckEditorial"
				component={NaturoparcRouteCheckEditorial}
				defaultProps={{ holdSeconds: 2 }}
				calculateMetadata={({ props }) => ({
					durationInFrames: routeCheckTimeline(NATUROPARC_ROUTE_CHECK_CONFIG, props.holdSeconds).duration,
				})}
				durationInFrames={672}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="MulhouseTripScore"
				component={MulhouseTripScore}
				durationInFrames={MULHOUSE_TRIP_SCORE_DURATION}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="TasanBrandIntro"
				component={TasanBrandIntro}
				durationInFrames={INTRO_DURATION}
				fps={30}
				width={3840}
				height={2160}
			/>
		</>
	);
};

const MulhouseTest: React.FC = () => {
	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				backgroundColor: '#1a1a1a',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				color: '#ffffff',
				fontFamily: 'Arial, sans-serif',
				gap: '40px',
			}}
		>
			<div style={{ fontSize: '72px', fontWeight: 'bold' }}>
				TASAN MEDIA Trips
			</div>
			<div style={{ fontSize: '48px', color: '#cccccc' }}>
				Mulhouse Automobile Museum
			</div>
		</div>
	);
};
