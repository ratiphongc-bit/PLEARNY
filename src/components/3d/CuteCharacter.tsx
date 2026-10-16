"use client";

import { useRef } from "react";
import type { ThreeElements } from "@react-three/fiber";
import { Group } from "three";
import { useGLTF } from "@react-three/drei";

export function CuteCharacter(props: ThreeElements["group"]) {
  const group = useRef<Group>(null);
  
  // โหลดโมเดล 3D จาก project storage
  const { scene } = useGLTF("https://plearny-l37tbtr8.manus.space/manus-storage/base_basic_pbr_5ba5edf6.glb");

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

// Preload โมเดลไว้ล่วงหน้าเพื่อให้โหลดเร็วขึ้น
useGLTF.preload("https://plearny-l37tbtr8.manus.space/manus-storage/base_basic_pbr_5ba5edf6.glb");
