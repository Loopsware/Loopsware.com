import React, { useEffect } from "react";
import { init3D } from "../3d";

function Scene() {
  useEffect(() => {
    init3D();
    console.log("Scene mounted");
  }, []);

  return <div id="scene" className="cursor-grab"></div>;
}

export default Scene;
