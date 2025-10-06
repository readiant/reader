# Readiant Web Component

A minimal Web Component wrapper for the Readiant reader that provides seamless integration with modern web applications. Supports local documents, remote sources (CDNs, cloud storage), and secure S3 signed URLs for private document access.

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

### Remote Document Sources

```html
<!-- CDN-hosted documents -->
<readiant
    document-id="doc-123"
    base-url="https://cdn.example.com/documents"
    remote-source="true">
</readiant>

<!-- S3-hosted documents -->
<readiant
    document-id="doc-123"
    base-url="https://mybucket.s3.amazonaws.com"
    remote-source="true">
</readiant>
```

### Secure S3 Signed URLs

```html
<!-- Private S3 documents with signed URLs -->
<readiant
    document-id="doc-123"
    use-signed-urls="true">
</readiant>

<!-- With fallback to remote source -->
<readiant
    document-id="doc-123"
    use-signed-urls="true"
    base-url="https://fallback.s3.amazonaws.com"
    remote-source="true">
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

## Document Sources

### Local Documents (Default)

By default, documents are loaded from the local server using relative paths:

```html
<readiant document-id="local-doc"></readiant>
```

Expected structure:
```
/docs/
└── local-doc/
    ├── index.json
    ├── audio/
    ├── elements/
    ├── textContent/
    ├── images/
    └── definitions/
```

### Remote Document Sources

Load documents from CDNs, cloud storage, or any HTTP/HTTPS server:

```html
<!-- Amazon S3 -->
<readiant 
    document-id="remote-doc"
    base-url="https://mybucket.s3.amazonaws.com"
    remote-source="true">
</readiant>

<!-- CDN -->
<readiant 
    document-id="remote-doc"
    base-url="https://cdn.example.com/documents"
    remote-source="true">
</readiant>

<!-- Custom Server -->
<readiant 
    document-id="remote-doc"
    base-url="https://documents.myserver.com"
    remote-source="true">
</readiant>
```

**Benefits:**
- **Scalability**: Offload document storage to cloud services
- **Performance**: Use CDNs for global document distribution
- **Cost Efficiency**: Leverage cloud storage pricing
- **Flexibility**: Host documents separately from the embed application

### S3 Signed URLs (Ultra-Simplified)

For private documents in S3 buckets, use pre-signed URLs directly in the files array:

```html
<readiant 
    document-id="private-doc"
    use-signed-urls="true">
</readiant>
```

## Index.json Structure

### Traditional Format (Backward Compatible)

```json
{
  "type": "pdf",
  "pages": 100,
  "files": [
    "doc123/audio/provider1/page1.mp3",
    "doc123/audio/provider1/page1.json",
    "doc123/elements/page1.json",
    "doc123/textContent/1.json",
    "doc123/definitions/definitions.json"
  ],
  "imageInfo": [
    {
      "id": "img1",
      "transparent": false
    }
  ]
}
```

### Direct Signed URLs (New Simplified Format)

```json
{
  "type": "pdf",
  "pages": 100,
  "files": [
    "https://mybucket.s3.amazonaws.com/docs/doc123/audio/provider1/page1.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
    "https://mybucket.s3.amazonaws.com/docs/doc123/audio/provider1/page1.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
    "https://mybucket.s3.amazonaws.com/docs/doc123/elements/page1.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
    "https://mybucket.s3.amazonaws.com/docs/doc123/textContent/1.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
    "https://mybucket.s3.amazonaws.com/docs/doc123/definitions/definitions.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=..."
  ],
  "imageInfo": [
    {
      "id": "img1",
      "transparent": false,
      "signedUrl": "https://mybucket.s3.amazonaws.com/docs/doc123/images/img1_4.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=..."
    }
  ]
}
```

**Benefits of Ultra-Simplified Structure:**
- **Maximum Simplicity**: Direct use of signed URLs as strings - no objects or nested properties
- **Consistent Format**: `files` is always a string array regardless of signed URL usage
- **Automatic Detection**: System automatically detects full URLs vs relative paths
- **Backward Compatible**: Zero changes needed for existing implementations
- **Performance**: Direct usage, no mapping or complex logic

## Backend Implementation

### Node.js/Lambda with Simplified Structure

```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

async function generateIndexWithSignedUrls(documentId, bucketName, useSignedUrls = true) {
  const expiresIn = 3600; // 1 hour
  
  // Define files that need signed URLs
  const fileList = [
    `${documentId}/audio/provider1/page1.mp3`,
    `${documentId}/audio/provider1/page1.json`,
    `${documentId}/elements/page1.json`,
    `${documentId}/textContent/1.json`,
    `${documentId}/definitions/definitions.json`
  ];
  
  let files;
  
  if (useSignedUrls) {
    // Generate files array with signed URLs directly as strings
    files = await Promise.all(
      fileList.map(async (filePath) => {
        const params = {
          Bucket: bucketName,
          Key: `docs/${filePath}`,
          Expires: expiresIn
        };
        
        try {
          return s3.getSignedUrl('getObject', params);
        } catch (error) {
          console.error(`Failed to generate signed URL for ${filePath}:`, error);
          throw error;
        }
      })
    );
  } else {
    // Traditional string format for backward compatibility
    files = fileList;
  }
  
  // Generate signed URL for images
  const imageInfo = [{
    id: 'img1',
    transparent: false,
    signedUrl: useSignedUrls ? s3.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: `docs/${documentId}/images/img1_4.jpg`,
      Expires: expiresIn
    }) : undefined
  }];
  
  return {
    type: 'pdf',
    pages: 100,
    files: files,
    imageInfo: imageInfo
  };
}

// API endpoint
app.get('/api/document/:id', async (req, res) => {
  try {
    const useSignedUrls = req.query.signed === 'true';
    const indexData = await generateIndexWithSignedUrls(req.params.id, 'my-bucket', useSignedUrls);
    res.json(indexData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate index with signed URLs' });
  }
});
```

### Python/Flask with Simplified Structure

```python
import boto3
from botocore.exceptions import ClientError

def generate_index_with_signed_urls(document_id, bucket_name, use_signed_urls=True, expiration=3600):
    s3_client = boto3.client('s3')
    
    file_list = [
        f'{document_id}/audio/provider1/page1.mp3',
        f'{document_id}/audio/provider1/page1.json',
        f'{document_id}/elements/page1.json',
        f'{document_id}/textContent/1.json',
        f'{document_id}/definitions/definitions.json'
    ]
    
    if use_signed_urls:
        # Generate files array with signed URLs directly as strings
        files = []
        for file_path in file_list:
            try:
                signed_url = s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': bucket_name, 'Key': f'docs/{file_path}'},
                    ExpiresIn=expiration
                )
                files.append(signed_url)
            except ClientError as e:
                print(f"Error generating signed URL for {file_path}: {e}")
                raise e
    else:
        # Traditional string format for backward compatibility
        files = file_list
    
    # Generate signed URL for images
    image_info = [{
        'id': 'img1',
        'transparent': False
    }]
    
    if use_signed_urls:
        try:
            image_signed_url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': bucket_name, 'Key': f'docs/{document_id}/images/img1_4.jpg'},
                ExpiresIn=expiration
            )
            image_info[0]['signedUrl'] = image_signed_url
        except ClientError as e:
            print(f"Error generating signed URL for image: {e}")
    
    return {
        'type': 'pdf',
        'pages': 100,
        'files': files,
        'imageInfo': image_info
    }

@app.route('/api/document/<document_id>')
def get_document_index(document_id):
    try:
        use_signed_urls = request.args.get('signed', 'false').lower() == 'true'
        index_data = generate_index_with_signed_urls(document_id, 'my-bucket', use_signed_urls)
        return jsonify(index_data)
    except Exception as e:
        return jsonify({'error': 'Failed to generate index with signed URLs'}), 500
```

## Migration from Legacy signedUrls Structure

### Old Structure (Deprecated)
```json
{
  "files": ["doc123/page1.json", "doc123/page2.json"],
  "signedUrls": {
    "docs/doc123/page1.json": "https://signed-url-1",
    "docs/doc123/page2.json": "https://signed-url-2"
  }
}
```

### New Structure (Recommended)
```json
{
  "useSignedUrls": true,
  "files": [
    "https://signed-url-1",
    "https://signed-url-2"
  ]
}
```

The system automatically detects full URLs vs relative paths and handles them appropriately, ensuring seamless backward compatibility while providing the absolute simplest structure possible - just an array of strings!

## CORS Configuration

### S3 CORS Setup

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

### Nginx CORS Setup

```nginx
location /docs/ {
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, HEAD, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Accept';
    
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
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

## Migration Guide

### From Local to Remote Documents

1. Upload your existing `docs/` folder to your remote server/CDN
2. Configure CORS on your remote server
3. Update components to include `base-url` and `remote-source="true"`
4. Test all document types (PDF, EPUB)

### From Remote to Signed URLs

1. Move documents to private S3 bucket
2. Implement backend API to generate signed URLs
3. Update `index.json` to include `signedUrls` mapping
4. Update components to use `use-signed-urls="true"`
5. Set appropriate S3 bucket permissions

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

### CDN-Hosted Documents

```html
<readiant 
    document-id="cdn-doc"
    base-url="https://cdn.example.com/documents"
    remote-source="true"
    style="width: 100%; height: 600px;">
</readiant>
```

### Private S3 Documents

```html
<readiant 
    document-id="private-doc"
    use-signed-urls="true"
    style="width: 100%; height: 600px;">
</readiant>
```

### Multi-Source Fallback

```html
<!-- Try signed URLs first, fallback to remote source -->
<readiant 
    document-id="secure-doc"
    use-signed-urls="true"
    base-url="https://backup.s3.amazonaws.com"
    remote-source="true">
</readiant>
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
                'base-url'?: string;
                'remote-source'?: boolean;
                'use-signed-urls'?: boolean;
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

## Troubleshooting

### Common Issues

#### CORS Errors
- **Problem**: Cross-origin requests blocked by browser
- **Solution**: Configure CORS headers on your remote server/S3 bucket
- **Debug**: Check browser network tab for CORS-related errors

#### 404 Errors
- **Problem**: Document files not found
- **Solution**: Verify document structure matches expected paths
- **Debug**: Test individual resource URLs directly in browser

#### Signed URL Expiration
- **Problem**: Pre-signed URLs have expired
- **Solution**: Generate new signed URLs with appropriate expiration time
- **Debug**: Check URL expiration timestamp in signed URL parameters

#### Mixed Content Issues
- **Problem**: Loading HTTP resources from HTTPS page
- **Solution**: Use HTTPS for both embed page and document sources
- **Debug**: Check browser console for mixed content warnings

#### Authentication Errors
- **Problem**: Access denied to private S3 resources
- **Solution**: Verify IAM permissions and bucket policies
- **Debug**: Test signed URLs directly and check S3 access logs

### Debug Tips

1. **Network Tab**: Open browser developer tools and check network requests
2. **Console Errors**: Look for JavaScript errors and CORS messages
3. **URL Testing**: Test constructed URLs directly in browser address bar
4. **S3 Permissions**: Verify bucket policies and IAM roles
5. **CORS Configuration**: Ensure proper CORS settings on remote servers

### Performance Optimization

#### For Remote Sources
- Use CDN for global distribution
- Enable gzip compression on server
- Set appropriate cache headers
- Minimize file sizes where possible

#### For S3 Signed URLs
- Set reasonable expiration times (balance security vs performance)
- Use CloudFront for better global performance
- Consider S3 Transfer Acceleration for large files
- Monitor S3 request costs

### Security Best Practices

#### S3 Signed URLs
- Set minimum necessary expiration time
- Use IP restrictions in bucket policies when possible
- Enable S3 access logging for audit trails
- Rotate AWS credentials regularly

#### Remote Sources
- Use HTTPS only
- Implement rate limiting on your servers
- Consider authentication for sensitive documents
- Monitor access logs for unusual patterns

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

- **Documentation**: [https://readiant.app/documentation](https://readiant.app/documentation)
- **Issues**: [https://github.com/readiant/readiant/issues](https://github.com/readiant/readiant/issues)
- **Email**: support@readiant.com

### Getting Help

When reporting issues, please include:
- Browser version and environment
- Document source type (local/remote/signed URLs)
- Complete error messages from browser console
- Sample configuration that reproduces the issue
- Network tab screenshots for resource loading problems

### Enterprise Support

For enterprise deployments with custom requirements:
- S3 bucket configuration assistance  
- Custom CORS setup guidance
- Performance optimization consulting
- Security audit and recommendations