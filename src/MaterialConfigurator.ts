import * as OBC from "openbim-components";
import * as THREE from "three";

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
  opacity: 1
});
export class MaterialConfigurator {
  highlighter?: OBC.FragmentHighlighter;
  materialManager?: OBC.MaterialManager;
  constructor(viewer: OBC.Components) {
    this.materialManager = new OBC.MaterialManager(viewer);
    this.highlighter = new OBC.FragmentHighlighter(viewer);
    this.highlighter.config.hoverMaterial = hoverMaterial;
    this.highlighter.config.selectionMaterial = selectedMaterial;
    this.setup(this.highlighter);
  }
  async setup(highlighter: OBC.FragmentHighlighter) {
    await highlighter.setup();
  }
}
