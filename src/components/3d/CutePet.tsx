"use client";

import { useRef } from "react";
import type { ThreeElements } from "@react-three/fiber";
import { Group } from "three";
import { useGLTF } from "@react-three/drei";

export function CutePet(props: ThreeElements["group"]) {
  const group = useRef<Group>(null);
  
  // โหลดโมเดล 3D สัตว์เลี้ยงจาก project storage
  const { scene } = useGLTF("https://plearny-l37tbtr8.manus.space/manus-storage/base_basic_pbr_a0e9ac15.glb");

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("https://plearny-l37tbtr8.manus.space/manus-storage/base_basic_pbr_a0e9ac15.glb");
