import {
  LineBasicMaterial,
  MeshBasicMaterial,
  DoubleSide,
  MeshLambertMaterial,
  Color
} from "three";

const template_mat = new MeshBasicMaterial({
  color: "#4adede",
  depthWrite: false,
  toneMapped: false,
  transparent: true,
  opacity: 0.6
});

const standard_deviation_mat = new MeshBasicMaterial({
  color: "#FFB445",
  depthWrite: false,
  transparent: true,
  toneMapped: false
});

const critical_deviation_mat = new MeshBasicMaterial({
  color: "#FF3F41",
  depthTest: true,
  transparent: true,
  toneMapped: false
});

const analized_element_mat = new MeshBasicMaterial({
  color: "#97F0FF",
  depthTest: true,
  transparent: true,
  toneMapped: false
});

const focused_element_mat = new MeshBasicMaterial({
  color: "#B4B4B4",
  depthTest: true,
  transparent: true,
  side: DoubleSide,
  opacity: 1
});

const transparent_mat = new MeshBasicMaterial({
  color: "#B4B4B4",
  transparent: true,
  opacity: 0.05
});

const wireframe_edges_mat = new LineBasicMaterial({
  depthTest: true,
  color: "black"
});

const wireframe_edges_transparent_mat = new LineBasicMaterial({
  depthTest: true,
  depthWrite: true,
  color: "black",
  transparent: true,
  opacity: 0.35
});

const highlight_mat = new MeshBasicMaterial({
  side: DoubleSide,
  color: "#4adede",
  depthTest: true,
  depthWrite: true,
  toneMapped: false,
  transparent: true,
  opacity: 0.2
});

const measure_lines_mat = new LineBasicMaterial({
  color: "#00FFF8",
  depthTest: false
});

const selected_item_mat = new MeshLambertMaterial({
  side: DoubleSide,
  color: "#4adede"
});

const subset_mesh_mat = new MeshLambertMaterial({
  transparent: false,
  opacity: 1,
  side: DoubleSide,
  color: new Color().setRGB(0.498, 0.498, 0.498)
});
export const C2B_MATERIALS = {
  STANDARD_DEVIATION: standard_deviation_mat,
  CRITICAL_DEVIATION: critical_deviation_mat,
  FOCUSED_ELEMENT: focused_element_mat,
  HIGHLIGHTED_ELEMENT: highlight_mat,
  TRANSPARENT: transparent_mat,
  WIREFRAME: wireframe_edges_mat,
  WIREFRAME_TRANSPARENT: wireframe_edges_transparent_mat,
  ANALIZED_ELEMENT: analized_element_mat,
  MEASURE_LINES: measure_lines_mat,
  TEMPLATE: template_mat,
  SELECTED_ITEM: selected_item_mat,
  SUBSET_MESH_MAT: subset_mesh_mat
};
