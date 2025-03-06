import * as OBC from "openbim-components";
import * as THREE from "three";

const components = new OBC.Components();

const sceneComponent = new OBC.SimpleScene(components);
sceneComponent.setup();
components.scene = sceneComponent;

const viewerContainer = document.getElementById("app") as HTMLDivElement;
const rendererComponent = new OBC.PostproductionRenderer(
  components,
  viewerContainer
);
components.renderer = rendererComponent;
const postproduction = rendererComponent.postproduction;

const cameraComponent = new OBC.OrthoPerspectiveCamera(components);
components.camera = cameraComponent;

const raycasterComponent = new OBC.SimpleRaycaster(components);
components.raycaster = raycasterComponent;

await components.init();
postproduction.enabled = true;

const grid = new OBC.SimpleGrid(components, new THREE.Color(0x666666));
postproduction.customEffects.excludedMeshes.push(grid.get());

const cubeGeometry = new THREE.BoxGeometry(3, 3, 3);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: "#6528D7" });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 1.5, 0);

sceneComponent.get().add(cube);
components.meshes.push(cube);

const dimensions = new OBC.LengthMeasurement(components);
dimensions.enabled = true;
dimensions.snapDistance = 0.1;
dimensions.color = new THREE.Color("#00FFF8");

const className = dimensions._vertexPicker._marker._marker.element.className;
dimensions._vertexPicker._marker._marker.element.className = "square_marker";

viewerContainer.onclick = event => {
  console.log(event);
  const result = components.raycaster.castRay([cube]);
  console.log(dimensions);
  dimensions.create();
};
dimensions.onBeforeUpdate.add(() => {
  const markerElements = document.getElementsByClassName(className);
  if (markerElements.length > 0) {
    for (const element of markerElements) {
      element.className = "square_marker";
    }
  }
});
window.onkeydown = event => {
  if (event.code === "Delete" || event.code === "Backspace") {
    dimensions.delete();
    dimensions.cancelCreation();
  }
  if (event.code === "Escape") {
    dimensions.cancelCreation();
  }
};
