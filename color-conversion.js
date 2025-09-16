// Color conversion functions with error handling

// RGB to CMYK conversion
function rgbToCmyk(r, g, b) {
    // Validate input
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
        throw new Error('RGB values must be between 0 and 255');
    }
    
    // Normalize RGB values
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    // Calculate K (black)
    const k = 1 - Math.max(rNorm, gNorm, bNorm);
    
    if (k === 1) {
        // Pure black
        return { c: 0, m: 0, y: 0, k: 100 };
    }
    
    // Calculate CMY
    const c = (1 - rNorm - k) / (1 - k);
    const m = (1 - gNorm - k) / (1 - k);
    const y = (1 - bNorm - k) / (1 - k);
    
    // Convert to percentages and round
    return {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100)
    };
}

// CMYK to RGB conversion
function cmykToRgb(c, m, y, k) {
    // Validate input
    if (c < 0 || c > 100 || m < 0 || m > 100 || y < 0 || y > 100 || k < 0 || k > 100) {
        throw new Error('CMYK values must be between 0 and 100');
    }
    
    // Normalize CMYK values (0-100 to 0-1)
    const cNorm = c / 100;
    const mNorm = m / 100;
    const yNorm = y / 100;
    const kNorm = k / 100;
    
    // Calculate RGB
    const r = 255 * (1 - cNorm) * (1 - kNorm);
    const g = 255 * (1 - mNorm) * (1 - kNorm);
    const b = 255 * (1 - yNorm) * (1 - kNorm);
    
    // Round and clamp values
    return {
        r: clamp(Math.round(r), 0, 255),
        g: clamp(Math.round(g), 0, 255),
        b: clamp(Math.round(b), 0, 255)
    };
}

// RGB to HLS conversion
function rgbToHls(r, g, b) {
    // Validate input
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
        throw new Error('RGB values must be between 0 and 255');
    }
    
    // Normalize RGB values
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        // Achromatic (gray)
        h = 0;
        s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case rNorm:
                h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
                break;
            case gNorm:
                h = (bNorm - rNorm) / d + 2;
                break;
            case bNorm:
                h = (rNorm - gNorm) / d + 4;
                break;
        }
        
        h /= 6;
    }
    
    return {
        h: Math.round(h * 360),
        l: Math.round(l * 100),
        s: Math.round(s * 100)
    };
}

// HLS to RGB conversion
function hlsToRgb(h, l, s) {
    // Validate input
    if (h < 0 || h > 360) throw new Error('Hue must be between 0 and 360');
    if (l < 0 || l > 100) throw new Error('Lightness must be between 0 and 100');
    if (s < 0 || s > 100) throw new Error('Saturation must be between 0 and 100');
    
    // Normalize HLS values
    const hNorm = h / 360;
    const lNorm = l / 100;
    const sNorm = s / 100;
    
    let r, g, b;
    
    if (sNorm === 0) {
        // Achromatic (gray)
        r = g = b = lNorm;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
        const p = 2 * lNorm - q;
        
        r = hue2rgb(p, q, hNorm + 1/3);
        g = hue2rgb(p, q, hNorm);
        b = hue2rgb(p, q, hNorm - 1/3);
    }
    
    return {
        r: clamp(Math.round(r * 255), 0, 255),
        g: clamp(Math.round(g * 255), 0, 255),
        b: clamp(Math.round(b * 255), 0, 255)
    };
}

// RGB to HEX conversion
function rgbToHex(r, g, b) {
    // Validate input
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
        throw new Error('RGB values must be between 0 and 255');
    }
    
    const toHex = (n) => {
        const hex = Math.round(n).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// HEX to RGB conversion
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Validate length
    if (hex.length !== 6) {
        throw new Error('HEX color must be 6 characters long');
    }
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Validate parsed values
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        throw new Error('Invalid HEX color format');
    }
    
    return { r, g, b };
}

// Validate HEX color
function isValidHex(hex) {
    return /^#?[0-9A-F]{6}$/i.test(hex);
}

// Clamp value between min and max
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Calculate relative luminance for accessibility
function getLuminance(r, g, b) {
    const rsrgb = r / 255;
    const gsrgb = g / 255;
    const bsrgb = b / 255;
    
    const rLinear = rsrgb <= 0.03928 ? rsrgb / 12.92 : Math.pow((rsrgb + 0.055) / 1.055, 2.4);
    const gLinear = gsrgb <= 0.03928 ? gsrgb / 12.92 : Math.pow((gsrgb + 0.055) / 1.055, 2.4);
    const bLinear = bsrgb <= 0.03928 ? bsrgb / 12.92 : Math.pow((bsrgb + 0.055) / 1.055, 2.4);
    
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

// Get text color based on background luminance
function getTextColor(r, g, b) {
    const luminance = getLuminance(r, g, b);
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// HSV to RGB conversion (дополнительная функция)
function hsvToRgb(h, s, v) {
    h = h % 360;
    if (h < 0) h += 360;
    
    s = clamp(s, 0, 100) / 100;
    v = clamp(v, 0, 100) / 100;
    
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;
    
    let r, g, b;
    
    if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
    } else {
        r = c; g = 0; b = x;
    }
    
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}

// RGB to HSV conversion (дополнительная функция)
function rgbToHsv(r, g, b) {
    r = clamp(r, 0, 255) / 255;
    g = clamp(g, 0, 255) / 255;
    b = clamp(b, 0, 255) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let h = 0;
    let s = max === 0 ? 0 : delta / max;
    let v = max;
    
    if (delta !== 0) {
        switch (max) {
            case r:
                h = (g - b) / delta + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / delta + 2;
                break;
            case b:
                h = (r - g) / delta + 4;
                break;
        }
        h /= 6;
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
}
