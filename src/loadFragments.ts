import { FragmentsManager } from "@thatopen/components";

export async function loadFragmentsLatest(
  filePath: string,
  fragments: FragmentsManager
) {
  if (fragments.groups.size) {
    return;
  }
  const file = await fetch(filePath);
  const data = await file.arrayBuffer();
  const buffer = new Uint8Array(data);
  const group = fragments.load(buffer);
  return group;
}
