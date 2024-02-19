const FooterContent = `
  <head>
     <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
     <link rel="stylesheet" href="../../dist/output.css" />
  </head>
  <div>
    <div id="footer">
      <button id="zip-publish" class="bg-white ">
         <i
                class="text-[25px] bx bx-save"
              ></i>
      </button>
    </div>
    </div>
  </div>`;

class PageFooter extends HTMLElement {
  shadow = null;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = FooterContent
  }
}

customElements.define('page-footer', PageFooter);
