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
  const ids: string[] = [];
  for (const fragment of model.items) {
    culler.add(fragment.mesh);
    const tempIds = [...fragment.ids].map(id => id);
    ids.push(...tempIds);
    fragment.items.forEach(item => {
      ids.push(item);
    });
  }
  highlighter.events.hover.onHighlight.add(async hovered => {
    // await changeMaterial("default");
  });

  highlighter.events.hover.onClear.add(async hovered => {
    // await changeMaterial("default");
  });

  highlighter.events.select.onHighlight.add(async selection => {
    highlighter.zoomToSelection = true;
    const fragmentID = Object.keys(selection)[0];
    const expressID = Number([...selection[fragmentID]][0]);
    const selectedFragment = model.items.find(f => f.id === fragmentID);
    console.log(selectedFragment);
    const itemData = selectedFragment?.getItemData(`${expressID}`);
    console.log(itemData);
    const instance = selectedFragment?.getInstance(
      Number(itemData?.instanceID),
      selectedFragment.mesh.matrix
    );
    console.log(instance);
    for (const fragment of model.items) {
      for (const id of fragment.ids) {
        const idsToHide = new Set(
          [...fragment.ids].filter(existingId => existingId !== `${expressID}`)
        );
        fragment.setVisibility(false, idsToHide);
      }
    }
    setTimeout(() => {
      highlighter.zoomToSelection = false;
    }, 200);
  });

  highlighter.events.select.onClear.add(() => {
    // highlighter.zoomToSelection = false
  });
  highlighter.update();
  culler.needsUpdate = true;
});

await loadFragments(fragments, "apartamento.frag");
console.log(sceneComponent);

async function hideObjects() {}
async function changeMaterial(name: string) {
  let lastSelection: OBC.FragmentIdMap;
  const singleSelection = { value: true };
  const result = await highlighter.highlight(name, singleSelection.value);
  if (result) {
    lastSelection = {};
    console.log(result.fragments);
    for (const fragment of result.fragments) {
      const fragmentID = fragment.id;
      lastSelection[fragmentID] = new Set([result.id]);
    }
  }
}
