class ColorConverter {
    constructor() {
        this.isUpdating = false;
        this.warningElement = document.getElementById('warning');
        this.currentHue = 0;
        this.currentSaturation = 100;
        this.currentLightness = 50;
        
        this.initEventListeners();
        this.initColorPalette();
        this.initGradientPicker();
        this.setupFixedPreview();
        this.updateFromRgb(255, 255, 255);
    }
    
    initEventListeners() {
        this.setupInputPair('r-input', 'r-slider', (value) => this.updateFromRgb(value, null, null));
        this.setupInputPair('g-input', 'g-slider', (value) => this.updateFromRgb(null, value, null));
        this.setupInputPair('b-input', 'b-slider', (value) => this.updateFromRgb(null, null, value));
        
        this.setupInputPair('c-input', 'c-slider', (value) => this.updateFromCmyk(value, null, null, null));
        this.setupInputPair('m-input', 'm-slider', (value) => this.updateFromCmyk(null, value, null, null));
        this.setupInputPair('y-input', 'y-slider', (value) => this.updateFromCmyk(null, null, value, null));
        this.setupInputPair('k-input', 'k-slider', (value) => this.updateFromCmyk(null, null, null, value));
        
        this.setupInputPair('h-input', 'h-slider', (value) => this.updateFromHls(value, null, null));
        this.setupInputPair('l-input', 'l-slider', (value) => this.updateFromHls(null, value, null));
        this.setupInputPair('s-input', 's-slider', (value) => this.updateFromHls(null, null, value));
        
        document.getElementById('hex-input').addEventListener('input', (e) => {
            if (this.isUpdating) return;
            
            let hex = e.target.value.toUpperCase();
            if (!hex.startsWith('#')) {
                hex = '#' + hex;
            }
            
            if (isValidHex(hex)) {
                try {
                    const rgb = hexToRgb(hex);
                    this.updateFromRgb(rgb.r, rgb.g, rgb.b);
                } catch (error) {
                    this.showWarning(error.message);
                }
            }
        });
        
        document.getElementById('hex-input').addEventListener('blur', (e) => {
            let hex = e.target.value.toUpperCase();
            if (!hex.startsWith('#')) {
                hex = '#' + hex;
            }
            if (isValidHex(hex)) {
                e.target.value = hex;
                try {
                    const rgb = hexToRgb(hex);
                    this.updateFromRgb(rgb.r, rgb.g, rgb.b);
                } catch (error) {
                    this.showWarning(error.message);
                }
            }
        });
    }
    
    setupFixedPreview() {
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', () => {
            const fixedPreview = document.getElementById('color-preview-fixed');
            if (!fixedPreview) return;
            
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (Math.abs(scrollTop - lastScrollTop) > 5) {
                fixedPreview.style.transition = 'transform 0.3s ease';
                fixedPreview.style.transform = `translateY(${scrollTop}px)`;
            }
            
            lastScrollTop = scrollTop;
        });
    }
    
    setupInputPair(inputId, sliderId, callback) {
        const input = document.getElementById(inputId);
        const slider = document.getElementById(sliderId);
        
        const min = parseInt(input.min);
        const max = parseInt(input.max);
        
        input.addEventListener('input', (e) => {
            if (this.isUpdating) return;
            const value = clamp(parseInt(e.target.value) || 0, min, max);
            slider.value = value;
            callback(value);
        });
        
        slider.addEventListener('input', (e) => {
            if (this.isUpdating) return;
            const value = parseInt(e.target.value);
            input.value = value;
            callback(value);
        });
        
        input.addEventListener('blur', (e) => {
            const value = clamp(parseInt(e.target.value) || 0, min, max);
            e.target.value = value;
            slider.value = value;
            if (!this.isUpdating) {
                callback(value);
            }
        });
    }
    
    initColorPalette() {
        this.paletteColors = {
            basic: [
                '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF',
                '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#000000', '#FFFFFF',
                '#808080', '#C0C0C0', '#800000', '#008000', '#000080', '#808000'
            ],
            pastel: [
                '#FFB6C1', '#FFD700', '#98FB98', '#87CEFA', '#DDA0DD', '#FFA07A',
                '#F0E68C', '#E6E6FA', '#FFF0F5', '#F5F5DC', '#F0FFF0', '#F0F8FF',
                '#F5F5F5', '#FFF5EE', '#FAEBD7', '#FFEFD5', '#FFE4E1', '#E0FFFF'
            ],
            vibrant: [
                '#FF4500', '#DA70D6', '#00FA9A', '#1E90FF', '#FFD700', '#FF69B4',
                '#7CFC00', '#FF6347', '#00CED1', '#FF8C00', '#8A2BE2', '#32CD32',
                '#DC143C', '#00BFFF', '#FF1493', '#7B68EE', '#ADFF2F', '#FF00FF'
            ]
        };
        
        this.currentPalette = 'basic';
        this.renderPalette();
        this.setupPaletteListeners();
    }
    
    renderPalette() {
        const grid = document.getElementById('palette-grid');
        grid.innerHTML = '';
        
        this.paletteColors[this.currentPalette].forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'palette-color';
            colorDiv.style.backgroundColor = color;
            colorDiv.setAttribute('data-color', color);
            colorDiv.setAttribute('title', color);
            
            grid.appendChild(colorDiv);
        });
        
        this.setupColorClickListeners();
    }
    
    setupPaletteListeners() {
        document.querySelectorAll('.palette-category').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.palette-category').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                this.currentPalette = e.target.dataset.category;
                this.renderPalette();
            });
        });
    }
    
    setupColorClickListeners() {
        document.querySelectorAll('.palette-color').forEach(colorDiv => {
            colorDiv.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                try {
                    const rgb = hexToRgb(color);
                    this.updateFromRgb(rgb.r, rgb.g, rgb.b);
                    
                    document.querySelectorAll('.palette-color').forEach(c => {
                        c.classList.remove('active');
                    });
                    e.target.classList.add('active');
                } catch (error) {
                    this.showWarning(error.message);
                }
            });
        });
    }
    
    initGradientPicker() {
        this.canvas = document.getElementById('gradient-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gradientCursor = document.getElementById('gradient-cursor');
        this.hueSlider = document.getElementById('hue-slider');
        
        this.setupGradientListeners();
        this.updateGradient();
        this.updateGradientCursor();
    }
    
    setupGradientListeners() {
        this.hueSlider.addEventListener('input', (e) => {
            this.currentHue = parseInt(e.target.value);
            this.updateGradient();
            this.updateColorFromGradient();
        });
        
        let isDragging = false;
        
        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            this.handleGradientClick(e);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                this.handleGradientClick(e);
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isDragging = true;
            this.handleGradientClick(e.touches[0]);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (isDragging) {
                this.handleGradientClick(e.touches[0]);
            }
        });
        
        document.addEventListener('touchend', () => {
            isDragging = false;
        });
    }
    
    handleGradientClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (x >= 0 && x <= this.canvas.width && y >= 0 && y <= this.canvas.height) {
            this.currentSaturation = (x / this.canvas.width) * 100;
            this.currentLightness = 100 - (y / this.canvas.height) * 100;
            
            this.updateGradientCursor();
            this.updateColorFromGradient();
        }
    }
    
    updateGradient() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const imageData = this.ctx.createImageData(width, height);
        const data = imageData.data;
        
        const hue = this.currentHue;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const saturation = (x / width) * 100;
                const lightness = 100 - (y / height) * 100;
                
                try {
                    const rgb = hlsToRgb(hue, lightness, saturation);
                    
                    const index = (y * width + x) * 4;
                    data[index] = rgb.r;
                    data[index + 1] = rgb.g;
                    data[index + 2] = rgb.b;
                    data[index + 3] = 255;
                } catch (error) {
                    const index = (y * width + x) * 4;
                    data[index] = 0;
                    data[index + 1] = 0;
                    data[index + 2] = 0;
                    data[index + 3] = 255;
                }
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    updateGradientCursor() {
        const x = (this.currentSaturation / 100) * this.canvas.width;
        const y = (1 - this.currentLightness / 100) * this.canvas.height;
        
        this.gradientCursor.style.left = `${x}px`;
        this.gradientCursor.style.top = `${y}px`;
    }
    
    updateColorFromGradient() {
        try {
            const rgb = hlsToRgb(this.currentHue, this.currentLightness, this.currentSaturation);
            this.updateFromRgb(rgb.r, rgb.g, rgb.b);
            
            this.hueSlider.value = this.currentHue;
        } catch (error) {
            this.showWarning(error.message);
        }
    }
    
    updateFromRgb(r, g, b) {
        if (this.isUpdating) return;
        
        this.isUpdating = true;
        
        try {
            const currentR = r !== null ? clamp(r, 0, 255) : parseInt(document.getElementById('r-input').value);
            const currentG = g !== null ? clamp(g, 0, 255) : parseInt(document.getElementById('g-input').value);
            const currentB = b !== null ? clamp(b, 0, 255) : parseInt(document.getElementById('b-input').value);
            
            const cmyk = rgbToCmyk(currentR, currentG, currentB);
            const hls = rgbToHls(currentR, currentG, currentB);
            const hex = rgbToHex(currentR, currentG, currentB);
            
            this.currentHue = hls.h;
            this.currentSaturation = hls.s;
            this.currentLightness = hls.l;
            this.updateGradientCursor();
            this.hueSlider.value = this.currentHue;
            this.updateGradient();
            
            this.updateRgbDisplay(currentR, currentG, currentB);
            this.updateCmykDisplay(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
            this.updateHlsDisplay(hls.h, hls.l, hls.s);
            this.updateHexDisplay(hex);
            this.updateColorPreview(hex, currentR, currentG, currentB);
            
            this.hideWarning();
        } catch (error) {
            this.showWarning(error.message);
        } finally {
            this.isUpdating = false;
        }
    }
    
    updateFromCmyk(c, m, y, k) {
        if (this.isUpdating) return;
        
        this.isUpdating = true;
        
        try {
            const currentC = c !== null ? clamp(c, 0, 100) : parseInt(document.getElementById('c-input').value);
            const currentM = m !== null ? clamp(m, 0, 100) : parseInt(document.getElementById('m-input').value);
            const currentY = y !== null ? clamp(y, 0, 100) : parseInt(document.getElementById('y-input').value);
            const currentK = k !== null ? clamp(k, 0, 100) : parseInt(document.getElementById('k-input').value);
            
            const rgb = cmykToRgb(currentC, currentM, currentY, currentK);
            
            this.checkColorBounds(rgb);
            
            const hls = rgbToHls(rgb.r, rgb.g, rgb.b);
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            
            this.currentHue = hls.h;
            this.currentSaturation = hls.s;
            this.currentLightness = hls.l;
            this.updateGradientCursor();
            this.hueSlider.value = this.currentHue;
            this.updateGradient();
            
            this.updateRgbDisplay(rgb.r, rgb.g, rgb.b);
            this.updateCmykDisplay(currentC, currentM, currentY, currentK);
            this.updateHlsDisplay(hls.h, hls.l, hls.s);
            this.updateHexDisplay(hex);
            this.updateColorPreview(hex, rgb.r, rgb.g, rgb.b);
            
        } catch (error) {
            this.showWarning(error.message);
        } finally {
            this.isUpdating = false;
        }
    }
    
    updateFromHls(h, l, s) {
        if (this.isUpdating) return;
        
        this.isUpdating = true;
        
        try {
            const currentH = h !== null ? clamp(h, 0, 360) : parseInt(document.getElementById('h-input').value);
            const currentL = l !== null ? clamp(l, 0, 100) : parseInt(document.getElementById('l-input').value);
            const currentS = s !== null ? clamp(s, 0, 100) : parseInt(document.getElementById('s-input').value);
            
            const rgb = hlsToRgb(currentH, currentL, currentS);
            
            this.checkColorBounds(rgb);
            
            const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            
            this.currentHue = currentH;
            this.currentSaturation = currentS;
            this.currentLightness = currentL;
            this.updateGradientCursor();
            this.hueSlider.value = this.currentHue;
            this.updateGradient();
            
            this.updateRgbDisplay(rgb.r, rgb.g, rgb.b);
            this.updateCmykDisplay(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
            this.updateHlsDisplay(currentH, currentL, currentS);
            this.updateHexDisplay(hex);
            this.updateColorPreview(hex, rgb.r, rgb.g, rgb.b);
            
        } catch (error) {
            this.showWarning(error.message);
        } finally {
            this.isUpdating = false;
        }
    }
    
    updateRgbDisplay(r, g, b) {
        document.getElementById('r-input').value = r;
        document.getElementById('r-slider').value = r;
        document.getElementById('g-input').value = g;
        document.getElementById('g-slider').value = g;
        document.getElementById('b-input').value = b;
        document.getElementById('b-slider').value = b;
    }
    
    updateCmykDisplay(c, m, y, k) {
        document.getElementById('c-input').value = c;
        document.getElementById('c-slider').value = c;
        document.getElementById('m-input').value = m;
        document.getElementById('m-slider').value = m;
        document.getElementById('y-input').value = y;
        document.getElementById('y-slider').value = y;
        document.getElementById('k-input').value = k;
        document.getElementById('k-slider').value = k;
    }
    
    updateHlsDisplay(h, l, s) {
        document.getElementById('h-input').value = h;
        document.getElementById('h-slider').value = h;
        document.getElementById('l-input').value = l;
        document.getElementById('l-slider').value = l;
        document.getElementById('s-input').value = s;
        document.getElementById('s-slider').value = s;
    }
    
    updateHexDisplay(hex) {
        document.getElementById('hex-input').value = hex;
        document.getElementById('hex-value').textContent = hex;
    }
    
    updateColorPreview(hex, r, g, b) {
        const colorElement = document.getElementById('current-color');
        if (colorElement) {
            colorElement.style.backgroundColor = hex;
            const textColor = getTextColor(r, g, b);
            colorElement.style.borderColor = textColor === '#FFFFFF' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
        }
        
        const fixedColorElement = document.getElementById('current-color-fixed');
        const fixedHexValue = document.getElementById('hex-value-fixed');
        
        if (fixedColorElement) {
            fixedColorElement.style.backgroundColor = hex;
            const textColor = getTextColor(r, g, b);
            fixedColorElement.style.borderColor = textColor === '#FFFFFF' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
        }
        
        if (fixedHexValue) {
            fixedHexValue.textContent = hex;
        }
    }
    
    checkColorBounds(rgb) {
        const warnings = [];
        
        if (rgb.r < 0 || rgb.r > 255) {
            warnings.push(`R value clamped to ${clamp(rgb.r, 0, 255)}`);
        }
        if (rgb.g < 0 || rgb.g > 255) {
            warnings.push(`G value clamped to ${clamp(rgb.g, 0, 255)}`);
        }
        if (rgb.b < 0 || rgb.b > 255) {
            warnings.push(`B value clamped to ${clamp(rgb.b, 0, 255)}`);
        }
        
        if (warnings.length > 0) {
            this.showWarning(warnings.join(', '));
        } else {
            this.hideWarning();
        }
    }
    
    showWarning(message) {
        this.warningElement.textContent = `⚠️ ${message}`;
        this.warningElement.classList.remove('hidden');
        
        const fixedWarning = document.getElementById('warning-fixed');
        if (fixedWarning) {
            fixedWarning.textContent = `⚠️ ${message}`;
            fixedWarning.classList.remove('hidden');
        }
        
        setTimeout(() => {
            this.hideWarning();
        }, 5000);
    }

    hideWarning() {
        this.warningElement.classList.add('hidden');
        
        const fixedWarning = document.getElementById('warning-fixed');
        if (fixedWarning) {
            fixedWarning.classList.add('hidden');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ColorConverter();
    
    const animateElements = () => {
        const elements = document.querySelectorAll('.model-card, .gradient-picker, .color-palette, .hex-input');
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 100);
        });
    };

    const elements = document.querySelectorAll('.model-card, .gradient-picker, .color-palette, .hex-input');
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    setTimeout(animateElements, 100);
});

window.addEventListener('resize', () => {
    const fixedPreview = document.getElementById('color-preview-fixed');
    if (fixedPreview && window.innerWidth <= 1200) {
        fixedPreview.style.transform = 'translateY(0)';
    }
});

window.clamp = clamp;