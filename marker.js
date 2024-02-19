const { MarkerModule, Package } = ARjsStudioBackend;
const firebaseConfig = {
  apiKey: "AIzaSyAyXn3hYGZjTLVUrGa5fVX-XgifZkqXtpg",
  authDomain: "webar-609e0.firebaseapp.com",
  databaseURL: "https://webar-609e0-default-rtdb.firebaseio.com",
  projectId: "webar-609e0",
  storageBucket: "webar-609e0.appspot.com",
  messagingSenderId: "436573714098",
  appId: "1:436573714098:web:9bcfefacfb44967df53bab",
};
firebase.initializeApp(firebaseConfig);

var githubButton = document
  .querySelector("page-footer")
  .shadowRoot.querySelector("#github-publish");
var zipButton = document
  .querySelector("page-footer")
  .shadowRoot.querySelector("#zip-publish");

window.assetParam = {
  scale: 1.0,
  size: {
    width: 1.0,
    height: 1.0,
    depth: 1.0,
  },
};

const storage = firebase.storage();
const storageRef = storage.ref("pattern/");

const setDefaultMarker = () => {
  const c = document.createElement("canvas");
  const img = document.querySelector(".default-marker-hidden");
  c.height = img.naturalHeight;
  c.width = img.naturalWidth;
  const ctx = c.getContext("2d");

  ctx.drawImage(img, 0, 0, c.width, c.height);
  const base64String = c.toDataURL();
  window.markerImage = base64String;

  MarkerModule.getFullMarkerImage(base64String, 0.5, 512, "black").then(
    (fullMarkerImage) => {
      window.fullMarkerImage = fullMarkerImage;
      img.remove();
    }
  );
};

const checkUserUploadStatus = () => {
  enablePageFooter(window.markerImage && window.assetFile);
};

const enablePageFooter = (enable) => {
  if (enable) {
    githubButton.classList.remove("publish-disabled");
    zipButton.classList.remove("publish-disabled");
    githubButton.removeAttribute("disabled");
    zipButton.removeAttribute("disabled");
  } else {
    githubButton.classList.add("publish-disabled");
    zipButton.classList.add("publish-disabled");
    githubButton.setAttribute("disabled", "");
    zipButton.setAttribute("disabled", "");
  }
};
function generateRandomUid(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}
function getFileType(file) {
  let type = file.name.split(".").pop().toLocaleLowerCase();

  if (supportedFileMap["3d"].types.indexOf(type) > -1) return "3d";
  if (supportedFileMap["image"].types.indexOf("image/" + type) > -1)
    return "image";
  if (supportedFileMap["audio"].types.indexOf("audio/" + type) > -1)
    return "audio";
  if (supportedFileMap["video"].types.indexOf("video/" + type) > -1)
    return "video";
}

function isValidFile(type, file, errorId) {
  const supportedFile = supportedFileMap[type];
  const previewError = document.getElementById(errorId);

  if (!type || !isValidFileType(type, file)) {
    previewError.innerHTML = "*Please select a supported file listed above.";
    return false;
  }
  if (!isValidFileSize(type, file)) {
    previewError.innerHTML = `*The file is too large. Max size is ${supportedFile.maxSizeText}.`;
    return false;
  }
  if (!isValidFileExt(type, file)) {
    previewError.innerHTML = `*The file is not supported. Supported file types are ${supportedFile.types.join(
      ", "
    )}.`;
    return false;
  }

  previewError.innerHTML = "";
  return true;
}

/** Checks whether file is uploaded and its type exists in the supportedFileMap. */
function isValidFileType(type, file) {
  const supportedFile = supportedFileMap[type];
  return supportedFile && file;
}


function handleImageUpload(file) {
    const fileName = file.name;
    const fileURL = URL.createObjectURL(file);
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onloadend = function () {
        window.assetFile = reader.result.split(",")[1];
        window.assetName = file.type.replace('image/', 'asset.');
        checkUserUploadStatus();
    };

    let preview = document.getElementById("content-preview");
    preview.innerHTML = previewImageTemplate(fileURL, fileName);
};

function handleAudioUpload(file) {
    const fileName = file.name;
    const fileURL = URL.createObjectURL(file);
    const reader = new FileReader();

    reader.readAsArrayBuffer(file);
    reader.onloadend = function () {
        //for backend api asset needs only base64 part
        window.assetFile =  Array.from(new Uint8Array(reader.result));
        window.assetName = file.type.replace('audio/', 'asset.');
        checkUserUploadStatus();
    };

    let preview = document.getElementById("content-preview");
    preview.innerHTML = previewAudioTemplate(fileURL, fileName);
};

function handleVideoUpload(file) {
    const fileName = file.name;
    const fileURL = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = function () {
        //for backend api asset needs only base64 part
        window.assetFile = Array.from(new Uint8Array(reader.result));
        window.assetName = file.type.replace('video/', 'asset.');
        checkUserUploadStatus();
    };
    let preview = document.getElementById("content-preview");
    preview.innerHTML = previewVideoTemplate(fileURL, fileName);

    var video = document.querySelector('#video');
    video.addEventListener('canplay', () => {
        if (video.videoWidth > video.videoHeight) {
            video.style.width = '100%';
        } else {
            video.style.height = '100%';
        }

        window.assetParam.size = { width: video.videoWidth, height: video.videoHeight };

        video.parentElement.style.backgroundColor = 'black';
        document.querySelector('#videoFrame').style.opacity = 1;
    });
};

function handleModelUpload(file) {
    let fileType = file.name.split('.').slice(-1)[0];
    if (fileType === 'glb') {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function () {
            //for backend api asset needs only base64 part
            window.assetFile = reader.result.split(",")[1];
            window.assetName = 'asset.glb';
            checkUserUploadStatus();
            let preview = document.getElementById("content-preview");
            preview.innerHTML = previewModelTemplate(reader.result, file.name);
        };
    } else if (fileType === 'gltf') {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onloadend = function () {
            const previewError = document.getElementById("content-error");
            try {
                let gltf = JSON.parse(reader.result);
                let buffers = gltf.buffers || [];
                let images = gltf.images || [];
                let uri;

                for (let i = 0; i < buffers.length; i++) {
                    uri = buffers[i].uri;
                    if (!reg4Base64.test(uri)) { // need a related file: data:application/octet-stream;base64,
                        previewError.innerHTML = '*Please pack all related files to zip file and try again, consult <a class="link" target="_blank" href="https://github.com/AR-js-org/studio/blob/master/how-to-upload-gltf.md">this guide on uploading gltf.</a>'

                        return;
                    }
                }
                for (let i = 0; i < images.length; i++) {
                    uri = images[i].uri;
                    if (!reg4Base64.test(uri)) { // need a related file
                        previewError.innerHTML = '*Please pack all related files to zip file and try again, consult <a class="link" target="_blank" href="https://github.com/AR-js-org/studio/blob/master/how-to-upload-gltf.md">this guide on uploading gltf.</a>'
                        return;
                    }
                }
                // need to load again
                const reader2 = new FileReader();
                reader2.readAsDataURL(file);
                reader2.onloadend = function () {
                    //for backend api asset needs only base64 part
                    window.assetFile = reader2.result.split(",")[1];
                    window.assetName = 'asset.gltf';
                    checkUserUploadStatus();
                    let preview = document.getElementById("content-preview");
                    preview.innerHTML = previewModelTemplate(reader2.result, file.name);
                };

            } catch (error) {
                previewError.innerHTML = '*The gltf file is corrupted.'
                return;
            }
        };
    } else if (fileType == 'zip') {
        handleZip(file, (err, result) => {
            if (err) {
                const previewError = document.getElementById("content-error");
                previewError.innerHTML = err === true ? '*Please check the zip file is correct' : err;
                return;
            }
            window.assetFile = result.split(",")[1];
            window.assetName = 'asset.gltf';
            checkUserUploadStatus();
            let preview = document.getElementById("content-preview");
            preview.innerHTML = previewModelTemplate(result, file.name);
        })

    }
};
function dataURItoBlobMarker(dataURI) {
  const byteString = atob(dataURI.split(",")[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: "image/png" });
}
const showLoadingScreen = () => {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.style.display = "block";
  }
};

// Function to hide the loading screen
const hideLoadingScreen = () => {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.style.display = "none";
  }
};
const zip = async () => {
  try {
    showLoadingScreen();
    const markerInfo = document.getElementById("markerInfo").value;
    // const landscapeRadio = document.getElementById("landscape");
    // const portraitRadio = document.getElementById("portrait");
    // const selectedValue = landscapeRadio.checked
    //   ? landscapeRadio.value
    //   : portraitRadio.value;
    // TODO: replace alerts with HTML error messages.
    if (!window.markerImage) throw new Error("Please select a marker image");
    if (!markerInfo) throw new Error("Please Input the project name");
    if (!window.assetType)
      throw new Error("Please select the correct content type");
    if (!window.assetFile || !window.assetName)
      throw new Error("Please upload a content");

    const markerPattern = await MarkerModule.getMarkerPattern(
      window.markerImage
    );
    const randomUid = generateRandomUid(10);

    // Save pattern file to Firebase Storage
    const patternFileRef = storageRef.child(`${randomUid}_marker.patt`);
    await patternFileRef.putString(markerPattern, "raw", {
      contentType: "text/plain",
    });

    const markerPatternImage = storageRef.child(
      `${randomUid}__fullMarkerImage.png`
    );
    console.log("FullImageMarker: ", window.fullMarkerImage )
    console.log("Image: ", window.assetFile);
    const blob = dataURItoBlobMarker(window.fullMarkerImage);
    await markerPatternImage.put(blob, { contentType: "image/png" });


    // Save marker image to Firebase Storage
    const markerImageFileRef = storageRef.child(
      `${randomUid}_${window.assetName}`
    );
    let assetFile;

    if (window.assetType === "image") {
      const decodedImageData = atob(window.assetFile);
      const arrayBuffer = new ArrayBuffer(decodedImageData.length);
      const uint8Array = new Uint8Array(arrayBuffer);

      for (let i = 0; i < decodedImageData.length; i++) {
        uint8Array[i] = decodedImageData.charCodeAt(i);
      }

      assetFile = new File([uint8Array], "image.jpg", { type: "image/jpeg" });
    } else {
      const blob = new Blob([new Uint8Array(window.assetFile)], {
        type: "video/mp4",
      });
      assetFile = new File([blob], "video.mp4", { type: "video/mp4" });
    }

    await markerImageFileRef.put(assetFile);

    // Get the download URLs for the pattern file and marker image
    const patternFileURL = await patternFileRef.getDownloadURL();
    const patternMarkerFileURL = await markerPatternImage.getDownloadURL();
    const markerImageFileURL = await markerImageFileRef.getDownloadURL();
    const timestamp = firebase.database.ServerValue.TIMESTAMP;

    await firebase.database().ref(`pattern/${randomUid}`).set({
      patternImage: patternFileURL,
      image: markerImageFileURL,
      id: randomUid,
      type: window.assetType,
      name: markerInfo,
      markerPatternImage: patternMarkerFileURL,
      size: 'potrait',
      timestamp,
    });
    hideLoadingScreen();
    // alert("Files uploaded successfully!");
     window.location.href = "home.html";
  } catch (error) {
    console.error("Error uploading files:", error);
    alert("Error uploading files. Please try again.", error);
    hideLoadingScreen();
  }
};

const publish = () => {
  // TODO: replace alerts with HTML error messages.
  if (!window.markerImage) return alert("Please, select a marker image.");
  if (!window.assetType)
    return alert("Please, select the correct content type.");
  if (!window.assetFile || !window.assetName)
    return alert("Please, upload a content.");

  MarkerModule.getMarkerPattern(window.markerImage).then((markerPattern) => {
    window.name = JSON.stringify({
      arType: "pattern",
      assetType: window.assetType,
      assetFile: window.assetFile,
      assetName: window.assetName,
      assetParam: window.assetParam,
      markerPatt: markerPattern,
      markerImage: window.markerImage,
      fullMarkerImage: window.fullMarkerImage,
    });
    window.location = "../publish";
  });
};

zipButton.addEventListener("click", zip);
githubButton.addEventListener("click", publish);
