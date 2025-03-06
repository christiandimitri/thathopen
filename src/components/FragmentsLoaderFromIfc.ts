import * as OBC from "@thatopen/components";
import { FragmentsGroup } from "@thatopen/fragments";

/**
 * A component that loads fragments from IFC files.
 * If a fragment file exists for a given IFC file, it loads the fragment file.
 * If not, it loads the IFC file, exports fragments, and then loads them.
 */
export class FragmentsLoaderFromIfc extends OBC.Component {
  static readonly uuid = "60bd6763-f9ff-4820-a04f-2054922c0297" as const;

  enabled = true;

  constructor(components: OBC.Components) {
    super(components);
    components.add(FragmentsLoaderFromIfc.uuid, this);
  }

  /**
   * Loads fragments for a project, either from existing fragment files or from IFC files.
   * @param projectName Name of the project folder inside the data directory
   * @param fileName Name of the file without extension
   * @returns The loaded fragments group
   */
  async loadFragmentsFromProject(
    projectName: string,
    fileName: string
  ): Promise<FragmentsGroup | undefined> {
    // Define paths
    const ifcFilePath = `../data/${projectName}/${fileName}.ifc`;
    const fragFilePath = `../data/${projectName}/small.frag`;

    // Get necessary components
    const fragments = this.components.get(OBC.FragmentsManager);
    const fragmentIfcLoader = this.components.get(OBC.IfcLoader);

    try {
      // Check if fragment file exists by attempting to fetch it
      const fragResponse = await fetch(fragFilePath);

      if (fragResponse.ok) {
        // Fragment file exists, load it
        console.log(
          `Fragment file found for ${fileName}. Loading fragments...`
        );
        return await this.loadFragments(fragFilePath, fragments);
      }
    } catch (error) {
      // Fragment file doesn't exist or error occurred
      console.log(
        `Fragment file not found for ${fileName} or error occurred. Proceeding to load IFC...`
      );
    }

    // Fragment file doesn't exist, load IFC and export fragments
    console.log(`Loading IFC file for ${fileName} and exporting fragments...`);
    try {
      // Load IFC file
      const ifcResponse = await fetch(ifcFilePath);
      if (!ifcResponse.ok) {
        console.error(`IFC file not found: ${ifcFilePath}`);
        return undefined;
      }

      const data = await ifcResponse.arrayBuffer();
      const buffer = new Uint8Array(data);

      // Ensure IFC loader is set up
      await fragmentIfcLoader.setup();

      // Load IFC file and generate fragments
      const group = await fragmentIfcLoader.load(buffer, true, fileName);
      group.name = fileName;

      // Export fragments
      await this.exportFragments(fragments, group, projectName, fileName);

      return group;
    } catch (error) {
      console.error(`Error loading IFC file ${ifcFilePath}:`, error);
      return undefined;
    }
  }

  /**
   * Loads fragments from a file.
   * @param fragFilePath Path to the fragment file
   * @param fragments FragmentsManager instance
   * @returns The loaded fragments group
   */
  private async loadFragments(
    fragFilePath: string,
    fragments: OBC.FragmentsManager
  ): Promise<FragmentsGroup | undefined> {
    try {
      const file = await fetch(fragFilePath);
      const data = await file.arrayBuffer();
      const buffer = new Uint8Array(data);
      const group = fragments.load(buffer);
      return group;
    } catch (error) {
      console.error(`Error loading fragments from ${fragFilePath}:`, error);
      return undefined;
    }
  }

  /**
   * Exports fragments to files.
   * @param fragments FragmentsManager instance
   * @param group Fragments group to export
   * @param projectName Name of the project folder
   * @param fileName Name of the file without extension
   */
  private async exportFragments(
    fragments: OBC.FragmentsManager,
    group: FragmentsGroup,
    projectName: string,
    fileName: string
  ): Promise<void> {
    // Export fragments data
    const data = fragments.export(group);
    this.downloadFile(
      new Blob([data]),
      `${projectName}_small.frag`,
      `Fragment file for ${fileName} exported. IMPORTANT: Please move this file to data/${projectName}/small.frag for future use.`
    );

    // Export properties if available
    const properties = group.getLocalProperties();
    if (properties) {
      this.downloadFile(
        new Blob([JSON.stringify(properties)]),
        `${projectName}_small.json`,
        `Properties for ${fileName} exported. IMPORTANT: Please move this file to data/${projectName}/small.json for future use.`
      );
    }

    console.warn(`
============================================================
IMPORTANT: FILE SYSTEM ACCESS LIMITATION
============================================================
Due to browser security restrictions, files cannot be directly 
saved to the data/${projectName}/ directory.

Please manually move the downloaded files:
1. ${projectName}_small.frag → data/${projectName}/small.frag
2. ${projectName}_small.json → data/${projectName}/small.json

These files will be used for faster loading in future runs.
============================================================`);
  }

  /**
   * Downloads a file via the browser.
   * @param blob The file data as a Blob
   * @param filename Name of the file to download
   * @param logMessage Message to log after download
   */
  private downloadFile(blob: Blob, filename: string, logMessage: string): void {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    console.log(logMessage);
  }
}
