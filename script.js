document.addEventListener("DOMContentLoaded", () => {
  const editor = ace.edit("css-editor");
  editor.setTheme("ace/theme/monokai");
  editor.session.setMode("ace/mode/css");

  // Optional: Set the editor to fill the available space
  editor.setOptions({
    maxLines: Infinity,
    wrap: true,
  });

  // Load saved CSS or default to Skeleton CSS
  const userCSS = document.getElementById("user-css");
  let savedCSS = localStorage.getItem("userCSS");
  if (!savedCSS) {
    savedCSS = `body {
    font-family: serif;
}
h1 {
  text-align: center;
}










`;
  }

  editor.setValue(savedCSS, -1);
  userCSS.innerHTML = savedCSS;

  // Live update preview
  editor.session.on("change", () => {
    userCSS.innerHTML = editor.getValue();
  });

  // Save CSS to pastes.dev
  document.getElementById("save-button").addEventListener("click", async () => {
    const content = editor.getValue();
    localStorage.setItem("userCSS", content);

    try {
      const response = await fetch("https://api.pastes.dev/post", {
        method: "POST",
        headers: {
          "Content-Type": "text/css",
          "User-Agent": "Personal-CSS-app",
        },
        body: content,
      });

      if (response.ok) {
        const locationHeader = response.headers.get("Location");
        const key = locationHeader || (await response.json()).key;

        document.getElementById(
          "exportedcss"
        ).innerText = `<link rel="stylesheet" href="https://api.pastes.dev/${key}"></link>`;
      } else {
        throw new Error("Failed to upload CSS");
      }
    } catch (error) {
      alert("Error saving CSS: " + error.message);
    }
  });
});
