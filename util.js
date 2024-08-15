async function integrityURL(url) {
  async function integrityMetadata(buffer, algorithm) {
    async function hashText(buffer, algorithm) {
      function digestName(hashAlgorithm) {
        switch (hashAlgorithm) {
          case "sha256":
            return "SHA-256";
          case "sha384":
            return "SHA-384";
          case "sha512":
            return "SHA-512";
          default:
            return "SHA-384";
        }
      }
      const digest = await crypto.subtle.digest(digestName(algorithm), buffer);

      return digest;
    }
    const hashBuffer = await hashText(buffer, algorithm);
    const base64string = btoa(
      String.fromCharCode(...new Uint8Array(hashBuffer))
    );

    return `${algorithm}-${base64string}`;
  }
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const hashAlgorithm = "SHA-384";
  const integrity = await integrityMetadata(buffer, hashAlgorithm);

  return `integrity="${integrity}" crossorigin="anonymous"`;
}
