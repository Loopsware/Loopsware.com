// src/components/Scene.jsx
import React, { useEffect } from "react";
import { init3D } from "../3d";

function Scene() {
  useEffect(() => {
    init3D();
  }, []);

  return <div id="3d-scene"></div>;
}

export default Scene;
