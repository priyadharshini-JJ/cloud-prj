import { describe, it, expect } from 'vitest';
import {
  validateAttachment,
  formatBytes,
  MAX_FILE_SIZE_BYTES
} from '../lib/storageService';

describe('Storage & Attachment Validation Service', () => {
  it('formats bytes into clean human readable sizes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(5242880)).toBe('5 MB');
  });

  it('rejects files larger than 15MB limit', () => {
    const fakeLargeFile = {
      size: MAX_FILE_SIZE_BYTES + 1024,
      type: 'application/pdf',
      name: 'large_document.pdf'
    };
    const result = validateAttachment(fakeLargeFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Maximum allowed size is 15 MB');
  });

  it('accepts valid PDF documents under 15MB', () => {
    const fakeValidPdf = {
      size: 2 * 1024 * 1024,
      type: 'application/pdf',
      name: 'research_paper.pdf'
    };
    const result = validateAttachment(fakeValidPdf);
    expect(result.valid).toBe(true);
  });

  it('accepts images under 15MB', () => {
    const fakeImage = {
      size: 500 * 1024,
      type: 'image/png',
      name: 'screenshot.png'
    };
    const result = validateAttachment(fakeImage);
    expect(result.valid).toBe(true);
  });

  it('rejects unsupported executables', () => {
    const fakeExe = {
      size: 1024,
      type: 'application/x-msdownload',
      name: 'installer.exe'
    };
    const result = validateAttachment(fakeExe);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('not supported');
  });
});
