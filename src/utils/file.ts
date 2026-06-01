/**
 * Converts a browser File or Blob to a data URI string.
 * Returns a string like `data:image/png;base64,iVBOR...`
 *
 * Works in browsers only (requires FileReader).
 *
 * Usage:
 *   const dataURI = await fileToDataURI(file)
 *   client.run({ seedImage: dataURI, ... })
 */
export const fileToDataURI = async (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('FileReader did not return a string'))
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
