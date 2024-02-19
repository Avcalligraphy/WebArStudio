const fileHolderTemplate = `
  <style>
    
@media screen and (min-width: 550px) { 
    .image-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 23.75em;
      width: 23.75em;
      background: var(--passive-color);
      border: 1px solid var(--passive-color-dark);
      box-sizing: border-box;
      border-radius: 5px;
      font-family: Chakra Petch;
      font-style: normal;
      font-weight: 600;
      font-size: 1.25em;
      line-height: 25px;
      color: var(--passive-color-dark);
      cursor: pointer;
      margin-bottom: 50px;
    }
     .drop-area {
  width: 300px;
  height: 200px;
  border: 2px dashed #ccc;
  border-radius: 5px;
  text-align: center;
  padding: 20px;
  cursor: pointer;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;

}

.drop-area p {
  margin: 0;
}
}
@media screen and (max-width: 550px) { 
    .image-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 300px;
      width: 300px;
      background: var(--passive-color);
      border: 1px solid var(--passive-color-dark);
      box-sizing: border-box;
      border-radius: 5px;
      font-family: Chakra Petch;
      font-style: normal;
      font-weight: 600;
      font-size: 1.25em;
      line-height: 25px;
      color: var(--passive-color-dark);
      cursor: pointer;
    }
     .drop-area {
  width: 300px;
  height: 200px;
  border: 2px dashed #ccc;
  border-radius: 5px;
  text-align: center;
  padding: 20px;
  cursor: pointer;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;

}

.drop-area p {
  margin: 0;
}
  }
  
  </style>

  <div>
    <div class="image-placeholder">
      <div class="drop-area" >
      <p>Drag & Drop an image file here</p>
      </div>
    </div>
  </div>`;

class FileHolder extends HTMLElement {
  constructor() {
    super();

    var shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = fileHolderTemplate;
    setTimeout(function () {
      var targetAttr = this.parentElement.getAttribute('target');
      var target = document.querySelector('#' + targetAttr)
      if (target) {
        this.onclick = function () {
          target.click();
        };
      }
    }.bind(this), 500);
  }

  connectedCallback() {
    this.classList.add('pages-content-element');
  }
}

customElements.define('file-holder', FileHolder);
