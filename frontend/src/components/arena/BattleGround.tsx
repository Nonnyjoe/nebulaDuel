import { Suspense } from 'react'
import { Canvas } from "@react-three/fiber";
// import modelPath from "/models/char1.glb"
import { useGLTF } from '@react-three/drei';


function Model() {
    const gltf = useGLTF('/models/char1.glb')
    return <primitive object={gltf.scene} scale={0.1} position={[0.4, -0.6, -0.8]}/>
}


export const BattleGround = () => {
    return (
        <>
            <Canvas linear flat shadows camera={{ position: [0, 0, 3], fov: 30 }}>
                {/* <color attach="background" args={["#171720"]} /> */}
                <fog attach="fog" args={["#171720", 10, 30]} />
                <ambientLight intensity={2} />
                <directionalLight position={[3.3, 1.0, 4.4]} intensity={4} />
                <Suspense>
                    <Model />
                </Suspense>
                {/* <OrbitControls target={[1, 0, 0]} /> */}
            </Canvas>
        </>
    )
}

