import * as OBC from "openbim-components";
import * as THREE from "three";
import { loadFragments } from "./loadFragments";

const viewer = new OBC.Components();

const sceneComponent = new OBC.SimpleScene(viewer);
sceneComponent.setup();
viewer.scene = sceneComponent;

const viewerContainer = document.getElementById("app") as HTMLDivElement;
const rendererComponent = new OBC.PostproductionRenderer(
  viewer,
  viewerContainer
);
viewer.renderer = rendererComponent;
const postproduction = rendererComponent.postproduction;

const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer);
viewer.camera = cameraComponent;

const raycasterComponent = new OBC.SimpleRaycaster(viewer);
viewer.raycaster = raycasterComponent;

await viewer.init();
postproduction.enabled = true;

const grid = new OBC.SimpleGrid(viewer, new THREE.Color(0x666666));
postproduction.customEffects.excludedMeshes.push(grid.get());

const fragments = new OBC.FragmentManager(viewer);

const materialManager = new OBC.MaterialManager(viewer);

const hoverMaterial = new THREE.MeshBasicMaterial({
  color: "#4adede",
  depthTest: true,
  depthWrite: true,
  toneMapped: false,
  transparent: true,
  opacity: 0.15
});

const selectedMaterial = new THREE.MeshBasicMaterial({
  color: "#4adede",
  depthTest: true,
  depthWrite: true,
  toneMapped: false,
  transparent: true,
  opacity: 1.0
});

const highlighter = new OBC.FragmentHighlighter(viewer);
highlighter.config.hoverMaterial = hoverMaterial;
highlighter.config.selectionMaterial = selectedMaterial;
await highlighter.setup();

const culler = new OBC.ScreenCuller(viewer);
await culler.setup();

cameraComponent.controls.addEventListener(
  "sleep",
  () => (culler.needsUpdate = true)
);

const propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer);
highlighter.events.select.onClear.add(() => {
  propertiesProcessor.cleanPropertiesList();
});

fragments.onFragmentsLoaded.add(async model => {
  for (const fragment of model.items) {
    culler.add(fragment.mesh);
  }

  highlighter.update();
  culler.needsUpdate = true;
});

const propertiesManager = new OBC.IfcPropertiesManager(viewer);
propertiesProcessor.propertiesManager = propertiesManager;

let fragmentIfcLoader = viewer.tools.get(OBC.FragmentIfcLoader);
await fragmentIfcLoader.setup();
const file = await fetch("./apartamento.ifc");
const data = await file.arrayBuffer();
const buffer = new Uint8Array(data);
const model = await fragmentIfcLoader.load(buffer, "example");
propertiesProcessor.process(model);
propertiesManager.ifcToExport = buffer;

const json = JSON.stringify(model.properties);
console.log(json);

sceneComponent.get().add(model);
// console.log(propertiesProcessor);
