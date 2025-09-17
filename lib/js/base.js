class ReadiantElement extends HTMLElement {
    async connectedCallback() {
        // Load and inject template
        const response = await fetch('../template.html');
        const html = await response.text();
        this.innerHTML = new DOMParser().parseFromString(html, 'text/html').body.innerHTML;
        // Import and initialize existing Readiant
        const { Readiant } = await import('./readiant.js');
        new Readiant();
    }
}
customElements.define('readiant', ReadiantElement);
export { ReadiantElement };
