import React, { useImperativeHandle, useRef } from "react";
import styled from "styled-components";
import { useReplicant } from "@nodecg/react-hooks";

import type NodeCG from "@nodecg/types";

import { TickerItemHandles } from "./incentives";

const PhotosContainer = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	/* transform: translate(-100%, 0); */
	padding: 16px;
	box-sizing: border-box;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 20px;
`;

const EventPhotos = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const EventPhoto = styled.img`
	height: 380px;
	width: auto;
	object-fit: contain;
`;

const NUMBER_OF_PHOTOS = 5;

export const Photos = React.forwardRef<TickerItemHandles>((_, ref) => {
	const photosRef = useRef<HTMLDivElement>(null);
	const [photosRep] = useReplicant<NodeCG.AssetFile[]>("assets:eventPhotos");

	useImperativeHandle(ref, () => ({
		animation: (tl) => {
			tl.fromTo(photosRef.current, { xPercent: -210 }, { xPercent: 210, duration: 20, ease: "none" });
			return tl;
		},
	}));

	const getRandomPhotos = () => {
		const randomPhotos: NodeCG.AssetFile[] = [];
		if (photosRep && photosRep.length > NUMBER_OF_PHOTOS) {
			const shuffledPhotos = [...photosRep].sort(() => Math.random() - 0.5);
			randomPhotos.push(...shuffledPhotos.slice(0, NUMBER_OF_PHOTOS));
		}
		return randomPhotos;
	};

	const randomPhotos = getRandomPhotos();

	return (
		<PhotosContainer>
			<EventPhotos ref={photosRef}>
				{randomPhotos.map((photo, index) => (
					<EventPhoto key={index} src={photo.url} />
				))}
			</EventPhotos>
		</PhotosContainer>
	);
});

Photos.displayName = "Socials";
