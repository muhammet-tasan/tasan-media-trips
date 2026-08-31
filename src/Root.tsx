import React from 'react';
import { Composition } from 'remotion';

export const Root: React.FC = () => {
	return (
		<Composition
			id="MulhouseAutomobileMuseum"
			component={MulhouseComposition}
			durationInFrames={300}
			fps={30}
			width={1920}
			height={1080}
			defaultProps={{}}
		/>
	);
};

const MulhouseComposition: React.FC = () => {
	return (
		<div
			style={{
				flex: 1,
				backgroundColor: '#000',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				color: '#fff',
				fontSize: '48px',
				fontFamily: 'sans-serif',
			}}
		>
			Mulhouse Automobile Museum
		</div>
	);
};
