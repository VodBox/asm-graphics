import * as THREE from "three";
import { useGLTF, useTexture } from "@react-three/drei";

import HillModel from "./assets/Grass.glb?url";
import Grass from "./assets/grass.png";
import { Tree } from "./tree";
import { useEffect, useRef, useState } from "react";
import { timeOfDayTint } from "./colours";

type HillProps = {
	seed?: number;
	treeNumber?: number;
	time?: number;
} & JSX.IntrinsicElements["group"];

const scaleMax = 0.5;
const scaleMin = 0.2;

function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t;
}

const raycaster = new THREE.Raycaster();

export const Hill = (props: HillProps) => {
	const meshRef = useRef<THREE.Mesh>(null);
	const { nodes } = useGLTF(HillModel);
	const texture = useTexture(Grass) as THREE.Texture;
	const [trees, setTrees] = useState<JSX.Element[]>([]);

	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(5, 5);

	const randomSeed = props.seed ?? Math.random();
	const random = mulberry32(randomSeed);

	useEffect(() => {
		if (!meshRef.current) return;

		const mesh = meshRef.current;
		const position = props.position as number[];
		const boundsX = (meshRef.current.geometry.boundingBox?.max.x ?? 0) * 1.3;
		const boundsZ = (meshRef.current.geometry.boundingBox?.max.z ?? 0) * 1.3;

		setTrees(
			Array.from({ length: props.treeNumber ?? 50 }, () => {
				let attempts = 0;
				let y = -4;
				do {
					const x = random() * boundsX - boundsX / 2;
					const z = random() * boundsZ - boundsZ / 2;
					const scale = lerp(scaleMin, scaleMax, random());
					const rotation = random() * Math.PI * 2;

					raycaster.set(new THREE.Vector3(x + position[0], 0, z + position[2]), new THREE.Vector3(0, -1, 0));

					const intersects = raycaster.intersectObject(mesh, true);

					if (intersects.length > 0) {
						y = intersects[0].point.y - position[1];
					} else {
						attempts++;
						continue;
					}

					return (
						<Tree
							key={x.toString() + z.toString()}
							position={[x, y, z]}
							scale={scale}
							rotation={[0, rotation, 0]}
							color={hillColour}
						/>
					);
				} while (attempts < 100);

				// Fallback
				return <></>;
			}),
		);
	}, [meshRef.current, props.treeNumber, props.seed, props.time]);

	const hillColour = timeOfDayTint(props.time);

	return (
		<group {...props} dispose={null}>
			<mesh geometry={nodes.Plane008.geometry} name="Hill" ref={meshRef}>
				<meshBasicMaterial map={texture} fog color={hillColour} />
			</mesh>
			{trees}
		</group>
	);
};

function mulberry32(a: number) {
	return function () {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		var t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

// #0e3446

useGLTF.preload(HillModel);
