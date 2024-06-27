import { Suspense } from 'react'
import { Canvas, useLoader } from "@react-three/fiber";
import { useGLTF } from '@react-three/drei';
import { radToDeg } from 'three/src/math/MathUtils.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'



function Createmodel() {
    const models = ['/models/troll.gltf', '/models/drake.gltf', '/models/techno.gltf', '/models/luna.gltf', '/models/zylar.gltf', '/models/vortex.gltf'];
    let element
    let array1 = []
    for (let index = 0; index < models.length; index++) {
        element = models[index];
        const gltf = useLoader(GLTFLoader, element)
        gltf.scene.lookAt(0,0,0)
        array1.push(<primitive object={gltf.scene} scale={0.17} rotation={[radToDeg(0), radToDeg(90), radToDeg(0)]} position={[Math.random() * (1.22 - -1.22) + -1.22, Math.random() * (-1.0 - -1.6) + -1.6, -0.8]} />)
    }
    array1.forEach(model => {
        console.log(model.props)
    });

    return (array1)
}

export const BattleGround = () => {
    return (
        <>
            <Canvas linear flat shadows camera={{ position: [0, 2, 3], fov: 30 }}>
                <fog attach="fog" args={["#171720", 10, 30]} />
                <ambientLight intensity={2} />
                <directionalLight position={[3.3, 1.0, 4.4]} intensity={4} />
                <Suspense>
                    <Createmodel />
                </Suspense>
            </Canvas>
        </>
    )
}

