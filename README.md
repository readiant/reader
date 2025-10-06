# Readiant Web Component

A minimal Web Component wrapper for the Readiant reader that provides seamless integration with modern web applications. Supports local documents and remote sources for private document access.

## Installation

### NPM

```bash
npm install readiant
```

### CDN

```html
<script type="module" src="https://unpkg.com/readiant@latest/dist/index.js"></script>
<readiant document-id="your-doc-id"></readiant>
```

## Quick Start

### HTML Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Document Viewer</title>
</head>
<body>
    <!-- Import the web component -->
    <script type="module">
        import 'readiant';
    </script>
    
    <!-- Use the component -->
    <readiant
        document-id="your-document-id"
        locale="en"
        page="1">
    </readiant>
</body>
</html>
```

### JavaScript/TypeScript Usage

```typescript
import 'readiant';
// or import { ReadiantElement } from 'readiant';

// Programmatically create and configure
const viewer = document.createElement('readiant');
viewer.setAttribute('document-id', 'your-document-id');
viewer.setAttribute('locale', 'en');
viewer.setAttribute('page', '1');

document.body.appendChild(viewer);
```

## Configuration

### Basic Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `document-id` | string | required | The ID of the document to display |
| `locale` | string | `'en'` | Language locale (en, nl, fr, de, etc.) |
| `page` | number | `1` | Initial page to display |
| `zoom` | number | `1.0` | Initial zoom level |
| `font-size` | string | `'medium'` | Text size (small, medium, large) |
| `theme` | string | `'light'` | Theme mode (light, dark, sepia) |
| `disable` | string | `''` | Comma-separated features to disable |
| `base-url` | string | `''` | Base URL for remote document sources |
| `remote-source` | boolean | `false` | Enable remote document loading |
| `use-signed-urls` | boolean | `false` | Enable S3 signed URL support |

### Advanced Configuration

```html
<readiant
    document-id="doc-123"
    locale="en"
    page="5"
    zoom="1.5"
    font-size="large"
    theme="dark"
    disable="print,fullscreen,download">
</readiant>
```

## Document Sources

### Local Documents (Default)

By default, documents are loaded from the local server using relative paths:

```html
<readiant document-id="local-doc"></readiant>
```

### Remote Document Sources

Load documents from cloud storage or any HTTP/HTTPS server:

```html
<!-- Amazon S3 -->
<readiant 
    document-id="remote-doc"
    base-url="https://mybucket.s3.amazonaws.com"
    remote-source="true">
</readiant>

<!-- Custom Server -->
<readiant 
    document-id="remote-doc"
    base-url="https://documents.myserver.com"
    remote-source="true">
</readiant>
```

### Secure S3 Signed URLs

```html
<!-- Private S3 documents with signed URLs -->
<readiant
    document-id="doc-123"
    base-url="https://mybucket.s3.amazonaws.com"
    remote-source="true"
    use-signed-urls="true">
</readiant>
```

### Framework Integration

#### React

```jsx
import 'readiant';

function DocumentViewer({ documentId, locale = 'en', page = 1 }) {
    return (
        <readiant 
            document-id={documentId}
            locale={locale}
            page={page}
        />
    );
}
```

#### Vue 3

```vue
<template>
    <readiant 
        :document-id="documentId"
        :locale="locale"
        :page="page"
    />
</template>

<script setup>
import 'readiant';

defineProps({
    documentId: String,
    locale: { type: String, default: 'en' },
    page: { type: Number, default: 1 }
});
</script>
```

#### Angular

```typescript
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import 'readiant';

@NgModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    // ... other config
})
export class AppModule {}
```

```html
<!-- component.html -->
<readiant 
    [attr.document-id]="documentId"
    [attr.locale]="locale"
    [attr.page]="page">
</readiant>
```

## Browser Support

- Chrome/Edge 54+
- Firefox 63+
- Safari 10.1+
- iOS Safari 10.3+
- Android Chrome 54+

For older browsers, include the Web Components polyfill:

```html
<script src="https://unpkg.com/@webcomponents/webcomponentsjs@^2/webcomponents-bundle.js"></script>
```

## API

### Properties

```typescript
const viewer = document.querySelector('readiant');

// Get current page
console.log(viewer.currentPage);

// Get total pages
console.log(viewer.totalPages);

// Check if document is loaded
console.log(viewer.isLoaded);
```

### Methods

```typescript
const viewer = document.querySelector('readiant');

// Navigation
viewer.goToPage(10);
viewer.nextPage();
viewer.previousPage();

// Zoom control
viewer.zoomIn();
viewer.zoomOut();
viewer.setZoom(1.5);

// Theme control
viewer.setTheme('dark');

// Feature control
viewer.toggleFullscreen();
viewer.print();
```

### Events

```typescript
const viewer = document.querySelector('readiant');

// Document loaded
viewer.addEventListener('document-loaded', (event) => {
    console.log('Document loaded:', event.detail);
});

// Page changed
viewer.addEventListener('page-changed', (event) => {
    console.log('Current page:', event.detail.page);
});

// Zoom changed
viewer.addEventListener('zoom-changed', (event) => {
    console.log('Zoom level:', event.detail.zoom);
});

// Error occurred
viewer.addEventListener('error', (event) => {
    console.error('Error:', event.detail.message);
});
```

## Document Structure

All document sources must maintain this folder structure:

```
baseUrl/ (or local server)
└── docs/
    └── {document-id}/
        ├── index.json
        ├── audio/
        │   ├── provider1/
        │   │   ├── page1.mp3
        │   │   ├── page1.json
        │   │   └── ...
        │   └── provider2/
        ├── elements/
        │   ├── page1.json
        │   ├── page2.json
        │   └── ...
        ├── textContent/
        │   ├── 1.json
        │   ├── 2.json
        │   └── ...
        ├── images/
        │   ├── image1_4.png
        │   ├── image2_4.jpg
        │   └── ...
        └── definitions/
            └── definitions.json
```

## Styling

The component uses Shadow DOM for style encapsulation, but you can customize the appearance using CSS custom properties:

```css
readiant {
    --readiant-primary-color: #0066cc;
    --readiant-background-color: #ffffff;
    --readiant-text-color: #333333;
    --readiant-border-radius: 8px;
    --readiant-font-family: 'Inter', sans-serif;
    
    /* Size the component */
    width: 100%;
    height: 600px;
    display: block;
}
```

### Available CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--readiant-primary-color` | `#0066cc` | Primary theme color |
| `--readiant-background-color` | `#ffffff` | Background color |
| `--readiant-text-color` | `#333333` | Text color |
| `--readiant-border-color` | `#e0e0e0` | Border color |
| `--readiant-border-radius` | `4px` | Border radius |
| `--readiant-font-family` | `system-ui` | Font family |
| `--readiant-font-size` | `14px` | Base font size |

## License

see LICENSE file for details.

## Support

- **Documentation**: [https://readiant.app/documentation](https://readiant.app/documentation)
- **Issues**: [https://github.com/readiant/readiant/issues](https://github.com/readiant/readiant/issues)
- **Email**: support@readiant.com
