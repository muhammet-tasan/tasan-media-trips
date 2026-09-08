import React from 'react';
import { Composition } from 'remotion';
import { MulhouseRouteCheck } from './MulhouseRouteCheck';
import { MulhouseTripScore, MULHOUSE_TRIP_SCORE_DURATION } from './MulhouseTripScore';

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
				id="MulhouseTripScore"
				component={MulhouseTripScore}
				durationInFrames={MULHOUSE_TRIP_SCORE_DURATION}
				fps={30}
				width={1920}
				height={1080}
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
