"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { useGLTF } from "@react-three/drei";

export function CuteCharacter(props: any) {
  const group = useRef<Group>(null);
  
  // โหลดโมเดล 3D จากโฟลเดอร์ public
  const { scene } = useGLTF("/2531b550-223c-48de-b2ef-d54a52d44f70/base_basic_pbr.glb");

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

// Preload โมเดลไว้ล่วงหน้าเพื่อให้โหลดเร็วขึ้น
useGLTF.preload("/2531b550-223c-48de-b2ef-d54a52d44f70/base_basic_pbr.glb");
