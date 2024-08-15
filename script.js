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
    font-family: sans-serif;
}
h1 {
  text-align: center;
}










`;
  }

  setStyle(savedCSS);

  // Live update preview
  editor.session.on("change", () => {
    userCSS.innerHTML = editor.getValue();
  });

  document.getElementById("save-button").addEventListener("click", async () => {
    const content = editor.getValue();
    localStorage.setItem("userCSS", content);
  });

  document
    .getElementById("export-button")
    .addEventListener("click", async () => {
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
  function setStyle(css) {
    editor.setValue(css, -1);
    userCSS.innerHTML = css;
  }
  document.getElementById("import-button").addEventListener("click", () => {
    function extractUrl(text) {
      // Regular expression pattern to extract URLs from HTML attributes
      const urlPattern = /(?:href|src)="(https?:\/\/[^\s"<>]+)/g;
      const urls = [];
      let match;

      while ((match = urlPattern.exec(text)) !== null) {
        return match[1];
      }
    }
    const url = extractUrl(document.getElementById("stylesheet-url").value);
    if (url) {
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Network response was not ok " + response.statusText
            );
          }
          return response.text();
        })
        .then((text) => {
          setStyle(text);
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    } else {
      alert("Please enter a valid URL.");
    }
  });
});
