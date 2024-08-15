$(document).ready(function () {
  const editor = ace.edit("css-editor");
  editor.setTheme("ace/theme/monokai");
  editor.session.setMode("ace/mode/css");

  // Optional: Set the editor to fill the available space
  editor.setOptions({
    maxLines: Infinity,
    wrap: true,
  });

  editor.commands.addCommand({
    name: "save",
    bindKey: { win: "Ctrl-S", mac: "Command-S" },
    exec: function (editor) {
      const content = editor.getValue();
      localStorage.setItem("userCSS", content);
    },
  });

  // Load saved CSS or default to Skeleton CSS
  const $userCSS = $("#user-css");
  let savedCSS = localStorage.getItem("userCSS");
  if (!savedCSS) {
    savedCSS = `/* CSS */
body {
    font-family: sans-serif;
}
h1 {
    text-align: center;
}
`;
  }

  setStyle(savedCSS);

  // Live update preview
  editor.session.on("change", function () {
    $userCSS.html(editor.getValue());
  });

  $("#save-button").on("click", function () {
    const content = editor.getValue();
    localStorage.setItem("userCSS", content);
  });

  $("#export-button").on("click", async function () {
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
        const url = `https://api.pastes.dev/${key}`;
        const integrity = await integrityURL(url);
        $("#exportedcss").text(
          `<link rel="stylesheet" href="https://api.pastes.dev/${key}" ${integrity}></link>`
        );
      } else {
        throw new Error("Failed to upload CSS");
      }
    } catch (error) {
      alert("Error saving CSS: " + error.message);
    }
  });

  function setStyle(css) {
    editor.setValue(css, -1);
    $("#user-css").html(css);
  }

  $("#import-button").on("click", function () {
    function extractUrl(text) {
      // Regular expression pattern to extract URLs from HTML attributes
      const urlPattern = /(?:href|src)="(https?:\/\/[^\s"<>]+)/g;
      let match;

      while ((match = urlPattern.exec(text)) !== null) {
        return match[1];
      }
    }

    const url = extractUrl($("#stylesheet-url").val());
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
