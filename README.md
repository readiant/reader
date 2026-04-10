# Readiant

A minimal Web Component wrapper for the Readiant reader that provides seamless integration with modern web applications. Supports local documents and remote sources for private document access.

## Installation

```bash
npm install @readiant/reader
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
        import '@readiant/reader';
    </script>
    
    <!-- Use the component -->
    <readiant-reader
        document-id="your-document-id"
        page="1">
    </readiant-reader>
</body>
</html>
```

### JavaScript/TypeScript Usage

```typescript
import '@readiant/reader';

// Programmatically create and configure
const viewer = document.createElement('readiant-reader');
viewer.setAttribute('document-id', 'your-document-id');
viewer.setAttribute('page', '1');

document.body.appendChild(viewer);
```

## Configuration

### Basic Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `document-id` | string | required | The ID of the document to display |
| `page` | number | `1` | Initial page to display |
| `url` | string | `''` | Base URL for document sources |
| `use-signed-urls` | boolean | `false` | Enable S3 signed URL support |
| `orientation` | string | `'auto'` | Document orientation (portrait, landscape) |
| `disable` | string | `''` | Comma-separated features to disable |
| `concurrency-limit` | number | `6` | Maximum concurrent file downloads (1-20) |
| `lang` | string | `'en'` | BCP 47 language tag — automatically loads the matching locale file; falls back to English if not found |
| `translations` | string (JSON) | `''` | JSON-encoded key overrides applied on top of the `lang` locale (see [Localization](#localization)) |

### Visual Appearance

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `zoom-level` | number | `1` | Zoom level (1-5) |
| `font` | string | `'default'` | Font family |
| `letter-spacing` | number | `0` | Letter spacing adjustment |
| `line-height` | number | `1.2` | Line height multiplier |
| `line-highlighter-width` | number | `30` | Line highlighter band width in pixels |
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

### Advanced Configuration

```html
<!-- Basic configuration -->
<readiant-reader
    document-id="doc-123"
    page="5"
    zoom-level="2"
    screen-mode-level="3"
    disable="print,fullscreen">
</readiant-reader>

<!-- Advanced visual customization -->
<readiant-reader
    document-id="doc-456"
    font="Arial"
    letter-spacing="1"
    line-height="1.5"
    word-spacing="2"
    color-blind-filter="deuteranopia"
    image-quality-level="4">
</readiant-reader>

<!-- Audio-enabled document -->
<readiant-reader
    document-id="doc-789"
    audio-highlighting-level="2"
    playback-rate="1.2"
    subtitle-level="1"
    subtitle-font-size="18">
</readiant-reader>

<!-- Performance optimization for large documents -->
<readiant-reader
    document-id="doc-large"
    concurrency-limit="10">
</readiant-reader>
```

## Localization

Set the `lang` attribute to any supported language tag. The component automatically loads the matching locale file from the package. If the language is not available it falls back to English.

```html
<readiant-reader document-id="doc-123" lang="nl"></readiant-reader>
```

### Overriding specific strings

Pass a `translations` JSON object to override individual keys on top of the loaded language file. You only need to supply the keys you want to change — everything else comes from the locale file (or English if the locale is missing).

```html
<readiant-reader
    document-id="doc-123"
    lang="nl"
    translations='{"chapters":"Inhoudsopgave"}'>
</readiant-reader>
```

If `lang` is absent or `"en"`, the baked-in English strings are used and no network request is made.

### Available locales

| `lang` value | Language |
|---|---|
| `en` (default) | English — baked in, no request |
| `nl` | Dutch |

### React example

```tsx
import { Reader } from '@readiant/reader/jsx';

function DocumentViewer({ documentId, lang = 'en' }) {
    return (
        <Reader
            document-id={documentId}
            lang={lang}
        />
    );
}
```

If you need to override specific strings on top of the locale:

```tsx
<Reader
    document-id={documentId}
    lang="nl"
    translations={JSON.stringify({ chapters: 'Inhoudsopgave' })}
/>
```

## Document Sources

### Local Documents (Default)

By default, documents are loaded from the local server using relative paths:

```html
<readiant-reader document-id="local-doc"></readiant-reader>
```

### Remote Document Sources

Load documents from cloud storage or any HTTP/HTTPS server:

```html
<!-- Amazon S3 -->
<readiant-reader 
    document-id="remote-doc"
    url="https://mybucket.s3.amazonaws.com/docs/remote-doc/">
</readiant-reader>

<!-- Custom Server -->
<readiant-reader 
    document-id="remote-doc"
    url="https://documents.myserver.com/docs/remote-doc/">
</readiant-reader>
```

### Secure S3 Signed URLs

When using signed URLs, the `url` attribute should point directly to the signed `index.json` URL. The `document-id` attribute is optional in this case.

```html
<!-- Private S3 documents with signed URLs -->
<readiant-reader
    url="https://mybucket.s3.amazonaws.com/docs/doc-123/index.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=..."
    use-signed-urls="true">
</readiant-reader>

<!-- With explicit document ID -->
<readiant-reader
    document-id="doc-123"
    url="https://mybucket.s3.amazonaws.com/docs/doc-123/index.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=..."
    use-signed-urls="true">
</readiant-reader>
```

**Note:** When `use-signed-urls="true"`:
- The `url` attribute must point to the complete signed `index.json` URL (not a base path)
- All file paths in the `index.json` should be complete signed URLs
- The `document-id` is optional and will be auto-generated if not provided

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
    "elements/page1.json",
    "textContent/1.json",
    "images/image1_4.jpg",
    "audio/provider1/page1.mp3"
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

#### Using the Web Component Directly

```jsx
import '@readiant/reader';

function DocumentViewer({ documentId, page = 1 }) {
    return (
        <readiant-reader 
            document-id={documentId}
            page={page}
        />
    );
}
```

#### Using the React Wrapper Component (Recommended)

For better TypeScript support and a more React-friendly API, use the `Reader` wrapper component:

```tsx
import { Reader } from '@readiant/reader/jsx';

function DocumentViewer({ documentId, page = 1 }: { documentId: string; page?: number }) {
    return (
        <Reader 
            document-id={documentId}
            page={page}
            zoom-level={2}
            screen-mode-level={3}
            onDocumentLoaded={(e) => console.log('Document loaded:', e.detail)}
            onPageChanged={(e) => console.log('Current pages:', e.detail.pages)}
            onZoomChanged={(e) => console.log('Zoom level:', e.detail.zoom)}
            onError={(e) => console.error('Error:', e.detail.message)}
        />
    );
}
```

**Benefits of the React Wrapper:**
- Full TypeScript type definitions for all props
- IntelliSense autocomplete for properties and event handlers
- Type checking for attribute values and event payloads
- No need to import the base web component separately

**Available Props:**

All web component attributes are available as props with full TypeScript support:

```tsx
interface ReaderProps {
  // Document configuration
  'document-id'?: string;
  page?: number | string;
  url?: string;
  'use-signed-urls'?: boolean | string;
  orientation?: string;
  disable?: string;
  
  // Visual appearance
  'zoom-level'?: number | string;
  font?: string;
  'letter-spacing'?: number | string;
  'line-height'?: number | string;
  'line-highlighter-width'?: number | string;
  'word-spacing'?: number | string;
  'screen-mode-level'?: number | string;
  'color-blind-filter'?: string;
  'image-quality-level'?: number | string;
  'text-mode-level'?: number | string;
  
  // Audio options
  'audio-highlighting-level'?: number | string;
  'countdown-level'?: number | string;
  'playback-rate'?: number | string;
  'read-stop-level'?: number | string;
  'subtitle-font-size'?: number | string;
  'subtitle-level'?: number | string;
  
  // Event handlers
  onDocumentLoaded?: (event: CustomEvent<{
    documentId: string;
    isReady: boolean;
  }>) => void;
  onPageChanged?: (event: CustomEvent<{
    pages: number[];
    direction?: string;
    previous?: {
      duration: number;
      pages: { page: number; audio?: { playbackPercentage: number } }[];
    };
  }>) => void;
  onZoomChanged?: (event: CustomEvent<{
    zoom: number;
  }>) => void;
  onThemeChanged?: (event: CustomEvent<{
    theme: number;
  }>) => void;
  onError?: (event: CustomEvent<{
    message: string;
    type: string;
  }>) => void;
}
```

### Vue 3

```vue
<template>
    <readiant-reader 
        :document-id="documentId"
        :page="page"
    />
</template>

<script setup>
import '@readiant/reader';

defineProps({
    documentId: String,
    page: { type: Number, default: 1 }
});
</script>
```

### Angular

```typescript
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import '@readiant/reader';

@NgModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    // ... other config
})
export class AppModule {}
```

```html
<!-- component.html -->
<readiant-reader 
    [attr.document-id]="documentId"
    [attr.page]="page">
</readiant-reader>
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
const viewer = document.querySelector('readiant-reader');

// Get current page
console.log(viewer.currentPage);

// Get total pages
console.log(viewer.totalPages);

// Check if document is loaded
console.log(viewer.isLoaded);
```

### Methods

```typescript
const viewer = document.querySelector('readiant-reader');

// Navigation
viewer.goToPage(10);
viewer.nextPage();
viewer.previousPage();

// Zoom control
viewer.zoomIn();
viewer.zoomOut();
viewer.setZoom(1.5);

// Theme control
viewer.setTheme('dark'); // 'light' | 'sepia' | 'dark'

// Feature control
await viewer.toggleFullscreen();
viewer.print();
```

### Events

```typescript
const viewer = document.querySelector('readiant-reader');

// Document loaded
viewer.addEventListener('document-loaded', (event) => {
    console.log('Document loaded:', event.detail);
    // event.detail: { documentId?: string, isReady: boolean }
});

// Page changed — fired for all navigation: UI buttons, swipe, keyboard, goToPage(), nextPage(), previousPage()
viewer.addEventListener('page-changed', (event) => {
    console.log('Current pages:', event.detail.pages);
    // event.detail: { pages: number[], direction?, previous? }
    // pages: all currently visible page numbers (1 in portrait, up to 2 in landscape)
    // direction: 'next' | 'previous' (omitted for direct jumps and initial load)
    // previous: { duration, pages: [{ page, audio?: { playbackPercentage } }] } (omitted on initial load)
});

// Page closed (before unload)
viewer.addEventListener('page-closed', (event) => {
    console.log('Page closed:', event.detail.pages);
    // event.detail: { pages: number[] }
});

// Zoom changed
viewer.addEventListener('zoom-changed', (event) => {
    console.log('Zoom level:', event.detail.zoom);
    // event.detail: { zoom: number }
});

// Theme changed
viewer.addEventListener('theme-changed', (event) => {
    console.log('Theme changed:', event.detail.theme);
    // event.detail: { theme: number }
});

// Font changed
viewer.addEventListener('font-changed', (event) => {
    console.log('Font changed:', event.detail.font);
    // event.detail: { font?: string }
});

// Font size changed
viewer.addEventListener('font-size-changed', (event) => {
    console.log('Font size:', event.detail.fontSize);
    // event.detail: { fontSize: number }
});

// Letter spacing changed
viewer.addEventListener('letter-spacing-changed', (event) => {
    console.log('Letter spacing:', event.detail.letterSpacing);
    // event.detail: { letterSpacing: number }
});

// Line height changed
viewer.addEventListener('line-height-changed', (event) => {
    console.log('Line height:', event.detail.lineHeight);
    // event.detail: { lineHeight: number }
});

// Word spacing changed
viewer.addEventListener('word-spacing-changed', (event) => {
    console.log('Word spacing:', event.detail.wordSpacing);
    // event.detail: { wordSpacing: number }
});

// Image quality changed
viewer.addEventListener('image-quality-changed', (event) => {
    console.log('Image quality level:', event.detail.imageQualityLevel);
    // event.detail: { imageQualityLevel: number, imageQuality: string }
});

// Color blind filter changed
viewer.addEventListener('color-blind-filter-changed', (event) => {
    console.log('Color blind filter:', event.detail.filter);
    // event.detail: { filter?: string }
});

// Text mode changed
viewer.addEventListener('text-mode-changed', (event) => {
    console.log('Text mode level:', event.detail.textModeLevel);
    // event.detail: { textModeLevel: number }
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

// Audio highlighting changed
viewer.addEventListener('audio-highlighting-changed', (event) => {
    console.log('Audio highlighting level:', event.detail.audioHighlightingLevel);
    // event.detail: { audioHighlightingLevel: number }
});

// Countdown changed
viewer.addEventListener('countdown-changed', (event) => {
    console.log('Countdown level:', event.detail.countdownLevel);
    // event.detail: { countdownLevel: number }
});

// Playback rate changed
viewer.addEventListener('playback-rate-changed', (event) => {
    console.log('Playback rate:', event.detail.playbackRate);
    // event.detail: { playbackRate: number }
});

// Read stop changed
viewer.addEventListener('read-stop-changed', (event) => {
    console.log('Read stop level:', event.detail.readStopLevel);
    // event.detail: { readStopLevel: number }
});

// Subtitle changed
viewer.addEventListener('subtitle-changed', (event) => {
    console.log('Subtitle level:', event.detail.subtitleLevel);
    // event.detail: { subtitleLevel: number }
});

// Subtitle font size changed
viewer.addEventListener('subtitle-font-size-changed', (event) => {
    console.log('Subtitle font size:', event.detail.subtitleFontSize);
    // event.detail: { subtitleFontSize: number }
});

// Fullscreen changed
viewer.addEventListener('fullscreen-changed', (event) => {
    console.log('Fullscreen:', event.detail.isFullscreen);
    // event.detail: { isFullscreen: boolean }
});

// Orientation changed
viewer.addEventListener('orientation-changed', (event) => {
    console.log('Orientation changed');
    // event.detail: { action: 'toggle', orientation: string }
});

// Print
viewer.addEventListener('print', (event) => {
    console.log('Print triggered:', event.detail.pages);
    // event.detail: { pages: number[] }
});

// Resize
viewer.addEventListener('resize', (event) => {
    console.log('Resize:', event.detail.width, event.detail.height);
    // event.detail: { width: number, height: number }
});

// Translation
viewer.addEventListener('translate', (event) => {
    console.log('Translate:', event.detail.language, event.detail.text);
    // event.detail: { language: string, text: string }
});

// Audio management
viewer.addEventListener('audio-added', (event) => {
    console.log('Audio added:', event.detail);
    // event.detail: { page: number, provider: string, language?: string, voiceId?: string }
});

viewer.addEventListener('audio-switched', (event) => {
    console.log('Audio switched:', event.detail.key);
    // event.detail: { key: string }
});

// Annotations
viewer.addEventListener('annotation-added', (event) => {
    console.log('Annotation saved:', event.detail.page);
    // event.detail: { annotations: string, page: number }
});

// Issue reported
viewer.addEventListener('issue-reported', (event) => {
    console.log('Issue reported:', event.detail);
    // event.detail: { documentType: 'ePub' | 'PDF', issueType: 'audio' | 'content' | 'visual', pageOrChapter: number }
});

// Highlighting
viewer.addEventListener('highlighting-started', (event) => {
    console.log('Highlighting started:', event.detail.indices);
    // event.detail: { indices: number[] }
});

viewer.addEventListener('highlighting-stopped', (event) => {
    console.log('Highlighting stopped');
    // event.detail: { action: 'stop' }
});

// Error
viewer.addEventListener('error', (event) => {
    console.error('Error:', event.detail.message);
    // event.detail: { message: string, type: string }
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

The component uses Shadow DOM for style encapsulation. All visual customization is done via CSS custom properties set on the `readiant-reader` element (or any ancestor, including `:root`).

```css
readiant-reader {
    /* Size the component */
    width: 100%;
    height: 600px;
    display: block;

    /* Customize */
    --readiant-font-family: 'Inter', sans-serif;
    --readiant-button-height: 48px;
}
```

### CSS Custom Properties Reference

#### Component

| Property | Default | Description |
|----------|---------|-------------|
| `--readiant-component-width` | `100%` | Component width |
| `--readiant-component-height` | `100%` | Component height |
| `--readiant-font-family` | `roboto, sans-serif` | Base font family |

#### Default Theme

| Property | Default | Description |
|----------|---------|-------------|
| `--readiant-default-background-color` | `#fcfcfc` | Page/content background |
| `--readiant-default-menu-background-color` | `#ececec` | Menu bar background |
| `--readiant-default-text-color` | `#000` | Body text color |
| `--readiant-default-active-background-color` | `rgba(94, 111, 219, 6%)` | Active element background |
| `--readiant-default-active-border-color` | `#5ba1d2` | Active element border |
| `--readiant-default-hover-background-color` | `rgba(94, 111, 219, 6%)` | Hover background |
| `--readiant-default-hover-border-color` | `#5ba1d2` | Hover border |
| `--readiant-default-button-background-color` | `transparent` | Button background |
| `--readiant-default-button-box-shadow` | `none` | Button box shadow |
| `--readiant-default-button-color` | `#555` | Button icon/text color |

#### Sepia Theme

| Property | Default | Description |
|----------|---------|-------------|
| `--readiant-sepia-background-color` | `#eee2cd` | Page/content background |
| `--readiant-sepia-menu-background-color` | `#f3f0d7` | Menu bar background |
| `--readiant-sepia-text-color` | `#5e454b` | Body text color |
| `--readiant-sepia-active-background-color` | `rgba(94, 111, 219, 6%)` | Active element background |
| `--readiant-sepia-active-border-color` | `#5ba1d2` | Active element border |
| `--readiant-sepia-hover-background-color` | `rgba(94, 111, 219, 6%)` | Hover background |
| `--readiant-sepia-hover-border-color` | `#5ba1d2` | Hover border |
| `--readiant-sepia-button-background-color` | `transparent` | Button background |
| `--readiant-sepia-button-box-shadow` | `none` | Button box shadow |
| `--readiant-sepia-button-color` | `#555` | Button icon/text color |

#### Dark Theme

| Property | Default | Description |
|----------|---------|-------------|
| `--readiant-dark-background-color` | `#292929` | Page/content background |
| `--readiant-dark-menu-background-color` | `#121212` | Menu bar background |
| `--readiant-dark-text-color` | `#fff` | Body text color |
| `--readiant-dark-active-background-color` | `rgba(94, 111, 219, 6%)` | Active element background |
| `--readiant-dark-active-border-color` | `#5ba1d2` | Active element border |
| `--readiant-dark-hover-background-color` | `rgba(94, 111, 219, 6%)` | Hover background |
| `--readiant-dark-hover-border-color` | `#5ba1d2` | Hover border |
| `--readiant-dark-button-background-color` | `transparent` | Button background |
| `--readiant-dark-button-box-shadow` | `none` | Button box shadow |
| `--readiant-dark-button-color` | `#555` | Button icon/text color |

#### Buttons

| Property | Default | Description |
|----------|---------|-------------|
| `--readiant-button-height` | `52px` | Height of toolbar buttons |
| `--readiant-button-width` | `auto` | Width of toolbar buttons |
| `--readiant-button-padding` | `4px 12px 0` | Padding inside buttons |
| `--readiant-button-border-top` | `0` | Top border |
| `--readiant-button-border-right` | `0` | Right border |
| `--readiant-button-border-bottom` | `4px solid transparent` | Bottom border (used for active indicator) |
| `--readiant-button-border-left` | `0` | Left border |
| `--readiant-button-border-radius` | `0` | Border radius |

#### Menu Bar

| Property | Default | Description |
|----------|---------|-------------|
| `--readiant-menu-height` | `56px` | Total menu bar height (nav + progress bar) |
| `--readiant-menu-width` | `100%` | Menu bar width |
| `--readiant-menu-top` | `4px` | Distance from top (accounts for progress bar) |
| `--readiant-menu-bottom` | `auto` | Distance from bottom |
| `--readiant-menu-left` | `0` | Distance from left |
| `--readiant-menu-right` | `auto` | Distance from right |
| `--readiant-menu-buttons-width` | `auto` | Width of the buttons container |
| `--readiant-menu-buttons-justify` | `flex-end` | `justify-content` for the buttons row |

#### Progress Bar

| Property | Default | Description |
|----------|---------|-------------|
| `--readiant-progress-height` | `4px` | Progress bar height |
| `--readiant-progress-width` | `100%` | Progress bar width |
| `--readiant-progress-background-color` | `#ececec` | Progress bar track color |

#### Navigation Buttons (prev/next page)

| Property | Default | Description |
|----------|---------|-------------|
| `--readiant-navigation-button-width` | `4rem` | Button width |
| `--readiant-navigation-button-height` | `4rem` | Button height |
| `--readiant-navigation-button-padding` | `0` | Button padding |
| `--readiant-navigation-button-border` | `0` | Button border |
| `--readiant-navigation-button-background-color` | `transparent` | Button background |
| `--readiant-navigation-button-color` | `rgba(85, 85, 85, 40%)` | Arrow color |
| `--readiant-navigation-button-hover-background-color` | `transparent` | Hover background |
| `--readiant-navigation-button-hover-color` | `#555` | Hover arrow color |

#### Viewport

| Property | Default | Description |
|----------|---------|-------------|
| `--readiant-viewport-margin` | `calc(56px + 2rem) 2rem 2rem` | Margin around the document viewport. Top accounts for the menu bar height. |

#### Element Visibility

Set any of these to `none` to hide the element, or `inline-block`/`block`/`flex` to show it.

| Property | Default | Element |
|----------|---------|---------|
| `--readiant-logo-display` | `block` | Logo in menu bar |
| `--readiant-annotations-button-display` | `inline-block` | Annotations toolbar button |
| `--readiant-audio-progress-display` | `block` | Audio progress bar |
| `--readiant-audio-progress-top-display` | `inline-block` | Audio progress bar (top variant) |
| `--readiant-bottom-bar-display` | `flex` | Bottom bar |
| `--readiant-bottom-bar-settings-button-display` | `inline-block` | Bottom bar settings button |
| `--readiant-chapters-button-display` | `inline-block` | Chapters toolbar button |
| `--readiant-first-page-display` | `inline-block` | First page button |
| `--readiant-fullscreen-toggle-display` | `inline-block` | Fullscreen toggle button |
| `--readiant-line-highlight-display` | `inline-block` | Line highlighter button |
| `--readiant-mute-display` | `inline-block` | Mute button |
| `--readiant-pause-display` | `none` | Pause button (hidden by default; use with `--readiant-play-display`) |
| `--readiant-page-number-display` | `inline-block` | Page number widget |
| `--readiant-play-display` | `none` | Play button (hidden by default; use with `--readiant-pause-display`) |
| `--readiant-page-number-text-display` | `none` | Text label alongside page number |
| `--readiant-playback-rate-toggle-display` | `inline-block` | Playback rate toggle button |
| `--readiant-playback-rate-top-parent-display` | `inline-block` | Playback rate container (top bar) |
| `--readiant-print-button-display` | `inline-block` | Print button |
| `--readiant-screen-settings-button-display` | `inline-block` | Screen settings button |
| `--readiant-search-button-display` | `inline-block` | Search button |
| `--readiant-settings-button-display` | `inline-block` | Settings button |
| `--readiant-start-display` | `inline-block` | Start button (visible when audio is available; set to `none` to use play/pause mode) |
| `--readiant-stop-display` | `inline-block` | Stop button (visible while audio is playing; set to `none` to use play/pause mode) |
| `--readiant-tooltip-display` | `block` | Tooltips |
| `--readiant-unmute-display` | `inline-block` | Unmute button |

**Example — hide buttons you don't need:**

```css
readiant-reader {
    --readiant-print-button-display: none;
    --readiant-fullscreen-toggle-display: none;
    --readiant-annotations-button-display: none;
}
```

### Icon Customization

Icons are rendered as `<span>` elements styled with CSS `mask-image`. Each icon has a corresponding CSS custom property that accepts any valid `url()` value — an inline SVG data URL, an external SVG file, or an SVG sprite fragment.

The built-in icon is always the fallback, so you only need to set the properties for icons you want to replace.

#### Replace a single icon

```css
readiant-reader {
    /* Inline SVG data URL */
    --readiant-icon-settings: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='...'/></svg>");

    /* External SVG file */
    --readiant-icon-search: url('/assets/icons/my-search.svg');

    /* SVG sprite fragment */
    --readiant-icon-print: url('/assets/sprite.svg#print');
}
```

> **Note:** Icons inherit their color from the surrounding text via `background-color: currentColor` + `mask-image`. You do not need to add `fill` or `color` to your SVG — the shape is used as a mask only.

#### All available icon properties

| Property | Icon |
|----------|------|
| `--readiant-icon-annotations` | Annotations |
| `--readiant-icon-audio` | Audio / headphones |
| `--readiant-icon-audiohighlighterall` | Highlight all words |
| `--readiant-icon-audiohighlighterhide` | Hide audio highlights |
| `--readiant-icon-audiohighlightersentence` | Highlight by sentence |
| `--readiant-icon-backward` | Skip backward |
| `--readiant-icon-bottombarsettings` | Bottom bar settings |
| `--readiant-icon-chapters` | Chapters / table of contents |
| `--readiant-icon-close` | Close / dismiss |
| `--readiant-icon-closelinehighlighter` | Close line highlighter |
| `--readiant-icon-comments` | Comments |
| `--readiant-icon-countdowninstant` | Countdown (instant) |
| `--readiant-icon-countdownmanual` | Countdown (manual) |
| `--readiant-icon-countdownnormal` | Countdown (normal) |
| `--readiant-icon-eraser` | Eraser / clear annotations |
| `--readiant-icon-firstpage` | Go to first page |
| `--readiant-icon-forward` | Skip forward |
| `--readiant-icon-fullscreen` | Fullscreen (generic) |
| `--readiant-icon-fullscreenclose` | Exit fullscreen |
| `--readiant-icon-fullscreenopen` | Enter fullscreen |
| `--readiant-icon-grayscale` | Grayscale filter |
| `--readiant-icon-imagequalityauto` | Image quality: auto |
| `--readiant-icon-imagequalityhigh` | Image quality: high |
| `--readiant-icon-imagequalitylow` | Image quality: low |
| `--readiant-icon-issueaudio` | Report audio issue |
| `--readiant-icon-issuecontent` | Report content issue |
| `--readiant-icon-issuevisual` | Report visual issue |
| `--readiant-icon-lineheightlarge` | Line height: large |
| `--readiant-icon-lineheightnormal` | Line height: normal |
| `--readiant-icon-lineheightsmall` | Line height: small |
| `--readiant-icon-linehighlighter` | Line highlighter |
| `--readiant-icon-logo` | Brand logo |
| `--readiant-icon-marker` | Marker / highlight tool |
| `--readiant-icon-more` | More / overflow menu |
| `--readiant-icon-mute` | Mute audio |
| `--readiant-icon-next` | Next page |
| `--readiant-icon-orientation` | Orientation (generic) |
| `--readiant-icon-orientationlandscape` | Landscape orientation |
| `--readiant-icon-orientationportrait` | Portrait orientation |
| `--readiant-icon-pause` | Pause |
| `--readiant-icon-play` | Play |
| `--readiant-icon-playpause` | Play/pause toggle |
| `--readiant-icon-previous` | Previous page |
| `--readiant-icon-print` | Print |
| `--readiant-icon-readstoppage` | Read stop: per page |
| `--readiant-icon-readstopsentence` | Read stop: per sentence |
| `--readiant-icon-readstopword` | Read stop: per word |
| `--readiant-icon-screenmodedark` | Dark screen mode |
| `--readiant-icon-screenmodesepia` | Sepia screen mode |
| `--readiant-icon-screenmodenormal` | Normal screen mode |
| `--readiant-icon-screensettings` | Screen/display settings |
| `--readiant-icon-search` | Search |
| `--readiant-icon-settings` | Settings |
| `--readiant-icon-show` | Show / reveal |
| `--readiant-icon-smallannotation` | Small: annotation |
| `--readiant-icon-smallaudiolinehighlighter` | Small: audio line highlighter |
| `--readiant-icon-smallcolorblind` | Small: color blind filter |
| `--readiant-icon-smallcomments` | Small: comments |
| `--readiant-icon-smallcountdown` | Small: countdown |
| `--readiant-icon-smallfont` | Small: font |
| `--readiant-icon-smallfontsize` | Small: font size |
| `--readiant-icon-smallfullscreen` | Small: fullscreen |
| `--readiant-icon-smallimagequality` | Small: image quality |
| `--readiant-icon-smallissue` | Small: issue report |
| `--readiant-icon-smallletterspacing` | Small: letter spacing |
| `--readiant-icon-smalllineheight` | Small: line height |
| `--readiant-icon-smalllinehighlighter` | Small: line highlighter |
| `--readiant-icon-smallmarkings` | Small: markings |
| `--readiant-icon-smallorientation` | Small: orientation |
| `--readiant-icon-smallplaybackrate` | Small: playback rate |
| `--readiant-icon-smallreadstop` | Small: read stop |
| `--readiant-icon-smallscreenmode` | Small: screen mode |
| `--readiant-icon-smallsubtitles` | Small: subtitles |
| `--readiant-icon-smallsubtitlesfontsize` | Small: subtitles font size |
| `--readiant-icon-smalltextmode` | Small: text mode |
| `--readiant-icon-smalltranslate` | Small: translate |
| `--readiant-icon-smallvoice` | Small: voice |
| `--readiant-icon-smallwordspacing` | Small: word spacing |
| `--readiant-icon-smallzoom` | Small: zoom |
| `--readiant-icon-stop` | Stop |
| `--readiant-icon-subtitles` | Subtitles |
| `--readiant-icon-subtitlesall` | Subtitles: show all |
| `--readiant-icon-subtitleshide` | Subtitles: hide |
| `--readiant-icon-subtitlessentence` | Subtitles: by sentence |
| `--readiant-icon-textmodenormal` | Text mode: normal |
| `--readiant-icon-textmodeplaintext` | Text mode: plain text |
| `--readiant-icon-textmodesplit` | Text mode: split |
| `--readiant-icon-textmodeswitch` | Text mode: switch |
| `--readiant-icon-translate` | Translate |
| `--readiant-icon-undo` | Undo |
| `--readiant-icon-unmute` | Unmute audio |

## License

see LICENSE file for details.

## Support

- **Documentation**: [https://readiant.app/documentation](https://readiant.app/documentation)
- **Issues**: [https://github.com/readiant/reader/issues](https://github.com/readiant/reader/issues)
- **Email**: support@readiant.com
