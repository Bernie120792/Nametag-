<!DOCTYPE html><html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Editable Name Tag (Image Download)</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Pacifico&family=Bebas+Neue&family=Indie+Flower&family=Anton&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f5f7fa;
      margin: 0;
      padding: 30px;
      text-align: center;
      color: #333;
    }h2 {
  margin-top: 40px;
  font-size: 28px;
  color: #2c3e50;
}

.nametag {
  width: 816px;
  height: 353px;
  margin: 20px auto;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 3px solid #ccc;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.editable {
  font-weight: bold;
  outline: none;
  padding: 5px 10px;
  border-radius: 10px;
}

.name {
  font-size: 70px;
  letter-spacing: 4px;
}

.line {
  font-size: 40px;
  margin-top: 10px;
}

.small-line {
  font-size: 28px;
  margin-top: 10px;
}

.controls {
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.controls input, .controls select, .controls button {
  padding: 10px 15px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.controls button {
  background-color: #3498db;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
}

.controls button:hover {
  background-color: #2980b9;
}

.color-row {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
}

  </style>
</head>
<body>  <h2>Front Side</h2>
  <div class="controls">
    <input type="file" accept="image/*" onchange="setBackgroundImage(event, 'frontTag')">
    <input type="color" onchange="setBackgroundColor(this.value, 'frontTag')">
    <select onchange="setFontStyle('front-name', this.value)">
      <option value="Luckiest Guy">Luckiest Guy</option>
      <option value="Pacifico">Pacifico</option>
      <option value="Bebas Neue">Bebas Neue</option>
      <option value="Indie Flower">Indie Flower</option>
      <option value="Anton">Anton</option>
    </select>
    <button onclick="downloadAsImage('frontTag', 'front-nametag')">Download Front (PNG)</button>
  </div>  <div class="color-row">
    <label>Name: <input type="color" onchange="setColor('front-name', this.value)"></label>
    <label>Kinder: <input type="color" onchange="setColor('front-kinder', this.value)"></label>
    <label>Guro: <input type="color" onchange="setColor('front-guro', this.value)"></label>
  </div>  <div class="nametag" id="frontTag">
    <div class="editable name" id="front-name" contenteditable="true" style="font-family: 'Luckiest Guy', cursive;">Type Name</div>
    <div class="editable line" id="front-kinder" contenteditable="true">grade and section</div>
    <div class="editable line" id="front-guro" contenteditable="true">Teacher</div>
  </div>  <h2>Back Side</h2>
  <div class="controls">
    <input type="file" accept="image/*" onchange="setBackgroundImage(event, 'backTag')">
    <input type="color" onchange="setBackgroundColor(this.value, 'backTag')">
    <button onclick="downloadAsImage('backTag', 'back-nametag')">Download Back (PNG)</button>
  </div>  <div class="color-row">
    <label>Magulang: <input type="color" onchange="setColor('back-parent', this.value)"></label>
    <label>Address: <input type="color" onchange="setColor('back-address', this.value)"></label>
    <label>Contact #: <input type="color" onchange="setColor('back-contact', this.value)"></label>
  </div>  <div class="nametag" id="backTag">
    <div class="editable line" id="back-parent" contenteditable="true">Name of parents</div>
    <div class="editable line" id="back-address" contenteditable="true">Address</div>
    <div class="editable line" id="back-contact" contenteditable="true">Contact number</div>
  </div>  <script>
    function setBackgroundImage(event, tagId) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        const element = document.getElementById(tagId);
        element.style.backgroundImage = `url('${e.target.result}')`;
        element.style.backgroundColor = "";
      };
      reader.readAsDataURL(file);
    }

    function setBackgroundColor(color, tagId) {
      const element = document.getElementById(tagId);
      element.style.backgroundColor = color;
      element.style.backgroundImage = "";
    }

    function setColor(elementId, color) {
      document.getElementById(elementId).style.color = color;
    }

    function setFontStyle(elementId, font) {
      document.getElementById(elementId).style.fontFamily = `'${font}', cursive`;
    }

    function downloadAsImage(tagId, filename) {
      const element = document.getElementById(tagId);
      html2canvas(element).then(canvas => {
        const link = document.createElement('a');
        link.download = filename + '.png';
        link.href = canvas.toDataURL();
        link.click();
      });
    }
  </script></body>
</html>