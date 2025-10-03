# NITS Forensic GUI

## Overview

The NITS Forensic GUI provides a lightweight web-based interface for document injection, analysis, and results visualization. This streamlines testing, onboarding, and repeated validation of the NITS analysis engine.

![NITS GUI Initial Page](https://github.com/user-attachments/assets/7c983e4b-c39e-4895-8eaa-754fdb9cb326)

## Features

* **File Upload**: Browse and upload documents (PDF, XLS, TXT, HTML) via drag-and-drop or file chooser
* **Real-time Analysis**: Trigger `IntegratedNITSCore.analyzeDocument()` with a single click
* **Results Display**: 
  - Threat level scoring (0-100)
  - Detailed violation breakdown
  - Severity indicators with color coding
  - Evidence and penalty information
  - Prosecution recommendations
* **User-Friendly Interface**: Clean, professional design with intuitive navigation
* **Live Feedback**: Console log panel for system diagnostics

## Installation

Dependencies are already included in `package.json`:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "ejs": "^3.1.8"
  }
}
```

Install dependencies:

```bash
npm install
```

## Usage

### Starting the GUI Server

```bash
npm run start:gui
```

The server will start on port 4000 by default. You can customize the port:

```bash
GUI_PORT=8080 npm run start:gui
```

### Accessing the GUI

Open your browser and navigate to:

```
http://localhost:4000
```

### Analyzing Documents

1. Click **"Choose File"** or drag a document onto the upload area
2. Select a document (.pdf, .txt, .xlsx, .html)
3. Click **"🔍 Analyze Document"**
4. View results including:
   - Overall threat level (color-coded: red=high, yellow=medium, green=low)
   - Number of violations detected
   - Detailed breakdown of each violation with severity, evidence, and penalties
   - Prosecution recommendations

## Architecture

### Server: `deploy/gui_server.ts`

- **Express.js** web server
- **Multer** for file upload handling
- **EJS** templating engine
- Integrates with `IntegratedNITSCore` for analysis

### Views: `gui_views/index.ejs`

- Responsive HTML/CSS interface
- Dynamic results rendering
- Color-coded threat indicators
- Violation cards with full details

### Core Integration: `deploy/complete_integration_patch.ts`

The `IntegratedNITSCore` class wraps the analysis pipeline:

```typescript
const nits = new IntegratedNITSCore();
await nits.initialize();
const result = await nits.analyzeDocument(filePath);
```

Returns:
- `violations`: Array of detected violations
- `overallThreatLevel`: Threat score (0-100)
- `recommendation`: Prosecution recommendation

## File Structure

```
N.I.T.S-/
├── deploy/
│   ├── gui_server.ts                    # GUI server implementation
│   └── complete_integration_patch.ts    # Core analysis engine with IntegratedNITSCore
├── gui_views/
│   └── index.ejs                        # HTML template
├── uploads/                             # Temporary upload directory (gitignored)
└── package.json                         # Dependencies and scripts
```

## Configuration

### Port Configuration

Set the `GUI_PORT` environment variable to customize the port:

```bash
export GUI_PORT=8080
npm run start:gui
```

### API Key Configuration

The system uses the same API key configuration as the core engine:

```bash
export GOVINFO_API_KEY="your-api-key"
npm run start:gui
```

## Security Notes

- Uploaded files are stored temporarily in the `uploads/` directory
- Files are analyzed but **not** automatically deleted (consider implementing cleanup)
- The GUI should be run on localhost for development/testing
- For production deployment, add authentication and secure file handling

## Testing

### Manual Testing

1. Start the GUI server:
   ```bash
   npm run start:gui
   ```

2. Use sample documents from `sample_docs/`:
   - `test_document.txt` - High-risk financial report with multiple violations
   - `second_document.txt` - Compliant document for comparison

3. Upload and analyze each document to verify:
   - File upload functionality
   - Analysis execution
   - Results display
   - Error handling

### Expected Results

For `test_document.txt`:
- **Threat Level**: ~100/100 (High)
- **Violations**: 4-6 violations detected
- **Types**: Insider trading, fraud indicators, compliance violations
- **Recommendation**: SEC enforcement with criminal investigation

## Troubleshooting

### Port Already in Use

If port 4000 is busy:
```bash
GUI_PORT=4001 npm run start:gui
```

### Module Not Found Errors

Ensure dependencies are installed:
```bash
npm install
```

### Analysis Fails

Check that:
1. The uploaded file is readable
2. The file format is supported (.txt, .pdf, .xlsx, .html)
3. The file contains analyzable text content

## Future Enhancements

Potential improvements for production deployment:

- **Export Options**: Add Markdown/HTML report export buttons
- **Batch Upload**: Support multiple document analysis
- **Dashboard View**: Historical analysis tracking
- **Authentication**: User login and session management
- **API Endpoints**: RESTful API for programmatic access
- **Real-time Updates**: WebSocket for live analysis progress
- **File Cleanup**: Automatic removal of uploaded files after analysis
- **Docker Support**: Containerized deployment

## Related Documentation

- [QUICKSTART.md](QUICKSTART.md) - Quick start guide for the core system
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - System implementation details
- [deploy/README_INTEGRATION_PATCH.md](deploy/README_INTEGRATION_PATCH.md) - Integration patch documentation

---

**Built for offense. Ready for deployment. Zero tolerance.**
