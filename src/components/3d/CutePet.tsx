"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { useGLTF } from "@react-three/drei";

export function CutePet(props: any) {
  const group = useRef<Group>(null);
  
  // โหลดโมเดล 3D สัตว์เลี้ยงจากโฟลเดอร์ public
  const { scene } = useGLTF("/4017de01-0eba-4012-a225-2f28d686af08/base_basic_pbr.glb");

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/4017de01-0eba-4012-a225-2f28d686af08/base_basic_pbr.glb");
