import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import * as WEBIFC from "web-ifc";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { FragmentsLoaderFromIfc } from "./components/FragmentsLoaderFromIfc";

// Create a canvas element
var container = document.getElementById("container") as HTMLCanvasElement;
const projectPath = "warehouse";
const fileName = "warehouse";

const components = new OBC.Components();

const worlds = components.get(OBC.Worlds);

const world = worlds.create<
  OBC.SimpleScene,
  OBC.SimpleCamera,
  OBCF.PostproductionRenderer
>();

world.scene = new OBC.SimpleScene(components);
world.renderer = new OBCF.PostproductionRenderer(components, container);
world.camera = new OBC.SimpleCamera(components);

components.init();

world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

world.scene.setup();

const grids = components.get(OBC.Grids);
const grid = grids.create(world);

const fragmentIfcLoader = components.get(OBC.IfcLoader);

// Instantiate the FragmentsLoaderFromIfc component
new FragmentsLoaderFromIfc(components);

// Configure excluded categories for IFC loader
const excludedCats = [
  WEBIFC.IFCTENDONANCHOR,
  WEBIFC.IFCREINFORCINGBAR,
  WEBIFC.IFCREINFORCINGELEMENT
];

for (const cat of excludedCats) {
  fragmentIfcLoader.settings.excludedCategories.add(cat);
}
await fragmentIfcLoader.setup();

// Configure WASM path for IFC loader
fragmentIfcLoader.settings.wasm = {
  path: "https://unpkg.com/web-ifc@0.0.66/",
  absolute: true
};

// Configure additional settings for the IFC loader
fragmentIfcLoader.settings.webIfc = {
  COORDINATE_TO_ORIGIN: true,
  LINEWRITER_BUFFER: 5 * 1024 * 1024 // 5MB buffer for line writing operations
};

// Initialize our fragment loader component
const fragmentsLoader = components.get(FragmentsLoaderFromIfc);

// Load the fragments - this will either load existing .frag file
// or load the IFC and export .frag files if they don't exist
const frags = await fragmentsLoader.loadFragmentsFromProject(
  projectPath,
  fileName
);

if (frags) {
  world.scene.three.add(frags);
}
const highlighter = components.get(OBCF.Highlighter);
highlighter.setup({ world });
highlighter.zoomToSelection = true;

const { postproduction } = world.renderer;
postproduction.enabled = true;
postproduction.customEffects.excludedMeshes.push(grid.three);
postproduction.customEffects.opacity = 0.5;

const stats = new Stats();
stats.showPanel(2);
document.body.append(stats.dom);
stats.dom.style.left = "0px";
stats.dom.style.zIndex = "unset";
world.renderer.onBeforeUpdate.add(() => stats.begin());
world.renderer.onAfterUpdate.add(() => stats.end());
