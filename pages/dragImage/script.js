function dragOverHandler(event) {
  event.preventDefault();
}

function dropHandler(event) {
  event.preventDefault();
  var files = event.dataTransfer.files;
  handleFiles(files);
}

function handleFiles(files) {
  var file = files[0];
  if (file.type.startsWith("image/")) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = document.createElement("img");
      img.src = reader.result;
      document.body.appendChild(img);
    };
    reader.readAsDataURL(file);
  } else {
    alert("Please drop an image file.");
  }
}

function selectFile() {
  document.getElementById("fileElem").click();
}
