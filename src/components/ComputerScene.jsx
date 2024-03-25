import React, { useEffect } from "react";
import { ComputerRender } from "../computer_render";

function ComputerScene() {
  useEffect(() => {
    ComputerRender();
    console.log("ComputerScene mounted");
  }, []);

  return <div id="scene" className="cursor-grab"></div>;
}

export default ComputerScene;
