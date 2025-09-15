# Readiant Web Component

A minimal Web Component wrapper for the Readiant reader that provides seamless integration with modern web applications.

## Installation

```bash
npm install readiant
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

## Configuration

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `document-id` | string | required | The ID of the document to display |
| `locale` | string | `'en'` | Language locale (en, nl, fr, de, etc.) |
| `page` | number | `1` | Initial page to display |
| `zoom` | number | `1.0` | Initial zoom level |
| `font-size` | string | `'medium'` | Text size (small, medium, large) |
| `theme` | string | `'light'` | Theme mode (light, dark, sepia) |
| `disable` | string | `''` | Comma-separated features to disable |

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

## Examples

### Basic Document Viewer

```html
<readiant document-id="sample-doc"></readiant>
```

### Multi-language Document

```html
<readiant 
    document-id="multilang-doc"
    locale="fr">
</readiant>
```

### Presentation Mode

```html
<readiant 
    document-id="presentation"
    theme="dark"
    disable="download,print"
    style="width: 100vw; height: 100vh;">
</readiant>
```

### Embedded in Article

```html
<article>
    <h1>Research Paper</h1>
    <readiant 
        document-id="research-paper"
        page="1"
        style="width: 100%; height: 500px; margin: 20px 0;">
    </readiant>
    <p>Continue reading below...</p>
</article>
```

## TypeScript Support

The package includes TypeScript definitions:

```typescript
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'readiant': {
                'document-id'?: string;
                locale?: string;
                page?: number;
                zoom?: number;
                'font-size'?: string;
                theme?: string;
                disable?: string;
            };
        }
    }
}

interface ReadiantElement extends HTMLElement {
    currentPage: number;
    totalPages: number;
    isLoaded: boolean;
    goToPage(page: number): void;
    nextPage(): void;
    previousPage(): void;
    zoomIn(): void;
    zoomOut(): void;
    setZoom(level: number): void;
    setTheme(theme: string): void;
    toggleFullscreen(): void;
    print(): void;
}
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

## CDN Usage

```html
<script type="module" src="https://unpkg.com/readiant@latest/dist/index.js"></script>
<readiant document-id="your-doc-id"></readiant>
```

## License

MIT License - see LICENSE file for details.

## Support

- Documentation: [https://readiant.app/documentation](https://readiant.app/documentation)
- Issues: [https://github.com/readiant/readiant/issues](https://github.com/readiant/readiant/issues)
- Email: support@readiant.com