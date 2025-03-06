export async function fetchFile(url: string): Promise<File> {
  // Fetch the file
  const response = await fetch(url);

  // Get the blob from the response
  const blob = await response.blob();

  // Create a File object from the blob
  const filename = url.substring(url.lastIndexOf("/") + 1);
  const file = new File([blob], filename, { type: blob.type });

  return file;
}
