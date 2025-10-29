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
<readiant-reader id="document-id"></readiant-reader>
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
    <readiant-reader
        id="document-id"
        locale="en"
        page="1">
    </readiant-reader>
</body>
</html>
```

### JavaScript/TypeScript Usage

```typescript
import 'readiant';
// or import { ReadiantElement } from 'readiant';

// Programmatically create and configure
const viewer = document.createElement('readiant');
viewer.setAttribute('id', 'document-id');
viewer.setAttribute('locale', 'en');
viewer.setAttribute('page', '1');

document.body.appendChild(viewer);
```

## Configuration

### Basic Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `id` | string | required | The ID of the document to display |
| `locale` | string | `'en'` | Language locale (en, nl, fr, de, etc.) |
| `page` | number | `1` | Initial page to display |
| `url` | string | `''` | Base URL for document sources |
| `use-signed-urls` | boolean | `false` | Enable S3 signed URL support |
| `single-page` | boolean | `false` | Single page preview mode |
| `orientation` | string | `'auto'` | Document orientation (portrait, landscape, auto) |
| `touch` | boolean | `true` | Enable touch gestures |
| `disable` | string | `''` | Comma-separated features to disable |

### Visual Appearance

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `zoom-level` | number | `1` | Zoom level (1-5) |
| `font` | string | `'default'` | Font family |
| `font-size` | number | `16` | Font size in pixels |
| `letter-spacing` | number | `0` | Letter spacing adjustment |
| `line-height` | number | `1.2` | Line height multiplier |
| `word-spacing` | number | `0` | Word spacing adjustment |
| `screen-mode-level` | number | `1` | Theme mode (1=light, 2=sepia, 3=dark) |
| `color-blind-filter` | string | `'none'` | Color blind accessibility filter |
| `image-quality-level` | number | `4` | Image quality setting (1-4) |
| `text-mode-level` | number | `0` | Text enhancement level |

### Audio Options

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `audio-highlighting-level` | number | `0` | Audio highlighting intensity |
| `countdown-level` | number | `0` | Audio countdown settings |
| `playback-rate` | number | `1.0` | Audio playback speed |
| `read-stop-level` | number | `0` | Audio read stop behavior |
| `subtitle-font-size` | number | `16` | Subtitle text size |
| `subtitle-level` | number | `0` | Subtitle display settings |

### Legacy Attributes (for backwards compatibility)

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `zoom` | number | `1.0` | Initial zoom level (use `zoom-level` instead) |
| `theme` | string | `'light'` | Theme mode (use `screen-mode-level` instead) |
| `base-url` | string | `''` | Base URL (use `url` instead) |
| `remote-source` | string | `''` | Remote source (use `url` instead) |
| `locale-translations` | string | `''` | Custom locale translations |

### Advanced Configuration

```html
<!-- Basic configuration -->
<readiant
    id="doc-123"
    locale="en"
    page="5"
    zoom-level="2"
    font-size="18"
    screen-mode-level="3"
    disable="print,fullscreen">
</readiant>

<!-- Advanced visual customization -->
<readiant
    id="doc-456"
    font="Arial"
    font-size="20"
    letter-spacing="1"
    line-height="1.5"
    word-spacing="2"
    color-blind-filter="deuteranopia"
    image-quality-level="4">
</readiant>

<!-- Audio-enabled document -->
<readiant
    id="doc-789"
    audio-highlighting-level="2"
    playback-rate="1.2"
    subtitle-level="1"
    subtitle-font-size="18">
</readiant>

<!-- Legacy syntax (still supported) -->
<readiant
    id="doc-legacy"
    theme="dark"
    zoom="1.5"
    base-url="https://docs.example.com">
</readiant>
```

## Document Sources

### Local Documents (Default)

By default, documents are loaded from the local server using relative paths:

```html
<readiant id="local-doc"></readiant>
```

### Remote Document Sources

Load documents from cloud storage or any HTTP/HTTPS server:

```html
<!-- Amazon S3 -->
<readiant 
    id="remote-doc"
    base-url="https://mybucket.s3.amazonaws.com"
    remote-source="true">
</readiant>

<!-- Custom Server -->
<readiant 
    id="remote-doc"
    base-url="https://documents.myserver.com"
    remote-source="true">
</readiant>
```

### Secure S3 Signed URLs

```html
<!-- Private S3 documents with signed URLs -->
<readiant
    id="doc-123"
    base-url="https://mybucket.s3.amazonaws.com"
    remote-source="true"
    use-signed-urls="true">
</readiant>
```

## Document Index Structure

Each document requires an `index.json` file that describes the document structure and files.

### Document Index (Standard)

```json
{
  "type": "pdf",
  "pages": 25,
  "availableAudio": {
    "provider1": [1, 2, 3, 4, 5],
    "provider2": [1, 3, 5]
  },
  "blueprints": [
    {
      "page": 1,
      "blueprint": ["element1", "element2"],
      "viewBox": [0, 0, 612, 792],
      "rotation": 0
    }
  ],
  "chapters": [
    {
      "title": "Chapter 1",
      "page": 1
    },
    {
      "title": "Chapter 2", 
      "page": 10
    }
  ],
  "files": [
    "docs/doc-123/elements/page1.json",
    "docs/doc-123/textContent/1.json",
    "docs/doc-123/images/image1_4.jpg",
    "docs/doc-123/audio/provider1/page1.mp3"
  ],
  "imageInfo": [
    {
      "id": "image1",
      "transparent": false
    }
  ],
  "inverted": false,
  "offset": 0,
  "rtl": false,
  "spread": false
}
```

### PDF Document Index (With Signed URLs)

```json
{
  "type": "pdf",
  "pages": 25,
  "availableAudio": {
    "provider1": [1, 2, 3, 4, 5],
    "provider2": [1, 3, 5]
  },
  "blueprints": [
    {
      "page": 1,
      "blueprint": ["element1", "element2"],
      "viewBox": [0, 0, 612, 792],
      "rotation": 0
    }
  ],
  "chapters": [
    {
      "title": "Chapter 1",
      "page": 1
    }
  ],
  "files": [
    "https://mybucket.s3.amazonaws.com/docs/doc-123/elements/page1.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
    "https://mybucket.s3.amazonaws.com/docs/doc-123/textContent/1.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
    "https://mybucket.s3.amazonaws.com/docs/doc-123/images/image1_4.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
    "https://mybucket.s3.amazonaws.com/docs/doc-123/audio/provider1/page1.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=..."
  ],
  "imageInfo": [
    {
      "id": "image1",
      "transparent": false,
      "signedUrl": "https://mybucket.s3.amazonaws.com/docs/doc-123/images/image1_4.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=..."
    }
  ],
  "inverted": false,
  "offset": 0,
  "rtl": false,
  "spread": false
}
```

## Framework Integration

### React

```jsx
import 'readiant';

function DocumentViewer({ documentId, locale = 'en', page = 1 }) {
    return (
        <readiant 
            id={documentId}
            locale={locale}
            page={page}
        />
    );
}
```

### Vue 3

```vue
<template>
    <readiant 
        :id="documentId"
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

### Angular

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
    [attr.id]="documentId"
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
    // event.detail: { documentId, totalPages, isReady }
});

// Page changed
viewer.addEventListener('page-changed', (event) => {
    console.log('Current page:', event.detail.page);
    // event.detail: { page, currentPage, totalPages, direction? }
});

// Zoom changed
viewer.addEventListener('zoom-changed', (event) => {
    console.log('Zoom level:', event.detail.zoom);
    // event.detail: { zoom, level }
});

// Theme changed
viewer.addEventListener('theme-changed', (event) => {
    console.log('Theme changed:', event.detail.theme);
    // event.detail: { theme, level }
});

// Font changed
viewer.addEventListener('font-changed', (event) => {
    console.log('Font changed:', event.detail.font);
    // event.detail: { font, fontKey }
});

// Font size changed
viewer.addEventListener('font-size-changed', (event) => {
    console.log('Font size changed:', event.detail.fontSize);
    // event.detail: { fontSize, size }
});

// Audio play/pause
viewer.addEventListener('audio-play', (event) => {
    console.log('Audio started playing');
    // event.detail: { isPlaying: true, action: 'play' }
});

viewer.addEventListener('audio-pause', (event) => {
    console.log('Audio paused');
    // event.detail: { isPlaying: false, action: 'pause' }
});

// Fullscreen changed
viewer.addEventListener('fullscreen-changed', (event) => {
    console.log('Fullscreen:', event.detail.isFullscreen);
    // event.detail: { isFullscreen }
});

// Error occurred
viewer.addEventListener('error', (event) => {
    console.error('Error:', event.detail.message);
    // event.detail: { message, type }
});

// Annotations added
viewer.addEventListener('annotations-added', (event) => {
    console.log('Annotations added:', event.detail.count);
    // event.detail: { annotations, count }
});

// Audio highlighting changed
viewer.addEventListener('audio-highlighting-changed', (event) => {
    console.log('Audio highlighting level:', event.detail.level);
    // event.detail: { level, audioHighlightingLevel }
});

// Color blind filter changed
viewer.addEventListener('color-blind-filter-changed', (event) => {
    console.log('Color blind filter:', event.detail.filter);
    // event.detail: { filter, filterKey }
});

// Countdown changed
viewer.addEventListener('countdown-changed', (event) => {
    console.log('Countdown level:', event.detail.level);
    // event.detail: { level, countdownLevel }
});

// Image quality changed
viewer.addEventListener('image-quality-changed', (event) => {
    console.log('Image quality level:', event.detail.level);
    // event.detail: { level, imageQualityLevel }
});

// Letter spacing changed
viewer.addEventListener('letter-spacing-changed', (event) => {
    console.log('Letter spacing:', event.detail.spacing);
    // event.detail: { spacing, letterSpacing }
});

// Line height changed
viewer.addEventListener('line-height-changed', (event) => {
    console.log('Line height:', event.detail.height);
    // event.detail: { height, lineHeight }
});

// Playback rate changed
viewer.addEventListener('playback-rate-changed', (event) => {
    console.log('Playback rate:', event.detail.rate);
    // event.detail: { rate, playbackRate }
});

// Read stop changed
viewer.addEventListener('read-stop-changed', (event) => {
    console.log('Read stop level:', event.detail.level);
    // event.detail: { level, readStopLevel }
});

// Subtitle changed
viewer.addEventListener('subtitle-changed', (event) => {
    console.log('Subtitle level:', event.detail.level);
    // event.detail: { level, subtitleLevel }
});

// Subtitle font size changed
viewer.addEventListener('subtitle-font-size-changed', (event) => {
    console.log('Subtitle font size:', event.detail.fontSize);
    // event.detail: { fontSize, subtitleFontSize }
});

// Text mode changed
viewer.addEventListener('text-mode-changed', (event) => {
    console.log('Text mode level:', event.detail.level);
    // event.detail: { level, textModeLevel }
});

// Word spacing changed
viewer.addEventListener('word-spacing-changed', (event) => {
    console.log('Word spacing:', event.detail.spacing);
    // event.detail: { spacing, wordSpacing }
});

// Audio management events
viewer.addEventListener('audio-added', (event) => {
    console.log('Audio added:', event.detail);
    // event.detail: { page, provider, language, voiceId }
});

viewer.addEventListener('audio-switched', (event) => {
    console.log('Audio switched:', event.detail.key);
    // event.detail: { key, audioKey }
});

// Highlighting events
viewer.addEventListener('highlighting-started', (event) => {
    console.log('Highlighting started:', event.detail.indices);
    // event.detail: { position, indices }
});

viewer.addEventListener('highlighting-stopped', (event) => {
    console.log('Highlighting stopped');
    // event.detail: { action: 'stop' }
});

// Orientation changed
viewer.addEventListener('orientation-changed', (event) => {
    console.log('Orientation changed');
    // event.detail: { action: 'toggle', orientation: 'toggled' }
});
```

## Document Structure

All document sources must maintain this folder structure:

```
baseUrl/ (or local server)
└── docs/
    └── {id}/
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
