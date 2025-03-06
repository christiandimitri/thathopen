import * as OBC from "openbim-components";
import * as THREE from "three";
import { loadFragments } from "./loadFragments";

export async function run() {
  const viewer = new OBC.Components();

  const sceneComponent = new OBC.SimpleScene(viewer);
  sceneComponent.setup();
  viewer.scene = sceneComponent;

  const viewerContainer = document.getElementById("app") as HTMLDivElement;
  const rendererComponent: OBC.PostproductionRenderer =
    new OBC.PostproductionRenderer(viewer, viewerContainer);
  viewer.renderer = rendererComponent;
  const postproduction = rendererComponent.postproduction;

  const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer);
  viewer.camera = cameraComponent;

  const raycasterComponent = new OBC.SimpleRaycaster(viewer);
  viewer.raycaster = raycasterComponent;
  viewer.raycaster.get().layers.set(0);
  await viewer.init();
  postproduction.enabled = true;
  const culler = new OBC.ScreenCuller(viewer);
  await culler.setup();
  cameraComponent.controls.addEventListener(
    "sleep",
    () => (culler.needsUpdate = true)
  );

  const fragments = viewer.tools.get(OBC.FragmentManager);
  const highlighter = new OBC.FragmentHighlighter(viewer);
  await highlighter.setup();

  const gridColor = new THREE.Color(6710886);

  const grid = new OBC.SimpleGrid(viewer, gridColor);
  grid.get().renderOrder = -1;

  try {
    await loadFragments(fragments, "apartamento.frag");
    highlighter.update();
    viewer.renderer.postproduction.customEffects.outlineEnabled = false;
    highlighter.outlineEnabled = false;
    highlighter.outlineMaterial.color.set(15794042);

    const highlightMaterial = new THREE.MeshBasicMaterial({
      color: "#BCF124",
      depthTest: false,
      opacity: 0.8,
      transparent: true
    });

    // const meshes = fragments.meshes;
    highlighter.events.hover.onHighlight.add(hovered => {
      const fragmentID = Object.keys(hovered)[0];
      const expressID = Number([...hovered[fragmentID]][0]);
      console.log(fragmentID, expressID);
    });
    highlighter.update();
  } catch (error) {
    console.log(error);
  }
}
