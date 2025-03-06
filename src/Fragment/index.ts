import * as THREE from "three";
import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree
} from "three-mesh-bvh";
import { FragmentHighlighter } from "./FragmentHighlighter";
import { FragmentIfcLoader } from "./FragmentLoader";
import { Disposable } from "./baseType";
import { RayCast } from "./RayCast";
import { ScreenCuller } from "./Culler";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MeshBasicMaterial } from "three";

export class FragmentModel implements Disposable {
  /**
   *
   */
  private clippingPlanes: THREE.Plane[] = [];

  private template_mat = new MeshBasicMaterial({
    color: "#4adede",
    depthWrite: false,
    toneMapped: false,
    transparent: true,
    opacity: 0.6
  });

  private standard_deviation_mat = new MeshBasicMaterial({
    color: "#FFB445",
    depthWrite: false,
    transparent: true,
    toneMapped: false
  });

  private critical_deviation_mat = new MeshBasicMaterial({
    color: "#FF3F41",
    depthTest: true,
    transparent: true,
    toneMapped: false
  });

  private analized_element_mat = new MeshBasicMaterial({
    color: "#97F0FF",
    depthTest: true,
    transparent: true,
    toneMapped: false
  });

  private focused_element_mat = new MeshBasicMaterial({
    color: "#B4B4B4",
    depthTest: true,
    transparent: true,
    side: THREE.DoubleSide,
    opacity: 1
  });
  private selected_item_mat = new THREE.MeshLambertMaterial({
    side: THREE.DoubleSide,
    color: "#4adede"
  });
  private highlight_mat = new MeshBasicMaterial({
    side: THREE.DoubleSide,
    color: "#4adede",
    depthTest: true,
    depthWrite: true,
    toneMapped: false,
    transparent: true,
    opacity: 0.2
  });

  fragmentIfcLoader: FragmentIfcLoader = new FragmentIfcLoader();
  fragmentHighlighter!: FragmentHighlighter;
  private _controls: OrbitControls;
  private _camera: THREE.PerspectiveCamera;
  get domElement() {
    //@ts-ignore
    return this._controls.domElement;
  }
  get camera() {
    return this._camera;
  }
  set setupEvent(enabled: boolean) {
    if (!this.domElement) return;
    if (enabled) {
      this.domElement.addEventListener("mousemove", this.onMouseMove);
      this.domElement.addEventListener("click", this.onSingleClick);
      this.controls.addEventListener("controlstart", this.onUpdateCulling);
      this.controls.addEventListener("controlend", this.onUpdateCulling);
    } else {
      this.domElement.removeEventListener("mousemove", this.onMouseMove);
      this.domElement.removeEventListener("click", this.onSingleClick);
      this.controls.removeEventListener("controlstart", this.onUpdateCulling);
      this.controls.removeEventListener("controlend", this.onUpdateCulling);
    }
  }

  private rayCast!: RayCast;
  _found: any | null = null;
  set found(event: any) {
    this._found = this.rayCast.getRayCastModel(event, this.filterModels);
  }
  get found() {
    return this._found;
  }
  get filterModels(): THREE.Mesh[] | THREE.InstancedMesh[] {
    return [...this.fragmentIfcLoader.fragmentManager.meshes];
  }
  private culling!: ScreenCuller;

  constructor(
    private controls: OrbitControls,
    camera: THREE.PerspectiveCamera
  ) {
    this._controls = controls;
    this._camera = camera;
    this.initFragment();
    // this.culling = new ScreenCuller(camera);
    FragmentModel.setupBVH();
  }
  dispose: () => Promise<void> = () => {
    return new Promise(() => {
      this.fragmentIfcLoader?.dispose();
      this.fragmentHighlighter?.dispose();
      this.culling?.dispose();
      this.setupEvent = false;
    });
  };

  private async initFragment() {
    this.fragmentHighlighter = new FragmentHighlighter(
      this.fragmentIfcLoader.fragmentManager,
      this.camera
    );
    await this.fragmentHighlighter.add("highlight", [this.highlight_mat]);
    await this.fragmentHighlighter.add("select", [this.selected_item_mat]);
    await this.fragmentHighlighter.add("template", [this.template_mat]);

    this.rayCast = new RayCast(
      this.domElement as HTMLElement,
      this.camera,
      this.clippingPlanes
    );
  }
  private static setupBVH() {
    (THREE.BufferGeometry.prototype as any).computeBoundsTree =
      computeBoundsTree;
    (THREE.BufferGeometry.prototype as any).disposeBoundsTree =
      disposeBoundsTree;
    THREE.Mesh.prototype.raycast = acceleratedRaycast;
  }

  private onMouseMove = async (event: any) => {
    this.found = event;
    await this.fragmentHighlighter.highlight("highlight", this.found);
  };
  private onUpdateCulling = async () => {
    if (!this.culling) return;
    this.culling.needsUpdate = true;
  };
  private onSingleClick = async () => {
    await this.fragmentHighlighter.highlight("select", this.found);
  };

  async loadIfcModel(file: File) {
    const model = await this.fragmentIfcLoader.loadIfcModel(file);
    await this.fragmentHighlighter.update();
    this.setupEvent = true;
    this.culling?.addModel(model);
    return model;
  }
}
