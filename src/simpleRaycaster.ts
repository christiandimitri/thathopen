import * as THREE from "three";

export function simpleRaycaster(components: any, objects: any) {
  let previousSelection: any;
  const cubeMaterial = new THREE.MeshStandardMaterial({ color: "#6528D7" });
  const greenMaterial = new THREE.MeshStandardMaterial({ color: "#BCF124" });
  window.onmousemove = () => {
    const objectss = [objects.items[0].mesh, objects.items[1].mesh];
    const result = components.raycaster.castRay(objects.children);
    if (result) {
      console.log(result);
      result.object.material = greenMaterial;
    }
    // if (previousSelection) {
    //   previousSelection.material = cubeMaterial;
    // }
    // if (!result) {
    //   return;
    // }
    // result.object.material = greenMaterial;
    // previousSelection = result.object;
  };
}
