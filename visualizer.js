// Audio Visualizer System using Web Audio API
class AudioVisualizer {
    constructor(audioElement, canvasElement) {
        this.audio = audioElement;
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.analyser = null;
        this.dataArray = null;
        this.bufferLength = null;
        this.isActive = false;
        this.animationId = null;
        this.style = 'bars'; // bars, waveform, circular
        this.audioContext = null;
        this.source = null;
        this._resizeHandler = () => {
            if (this.canvas) {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }
        };
    }

    initialize() {
        console.log('Visualizer: Starting initialization...');
        // Try to use shared AudioContext from equalizer if available
        if (window.equalizer && window.equalizer.isInitialized) {
            this.audioContext = window.equalizer.getAudioContext();
            this.analyser = window.equalizer.getAnalyser();
            console.log('Visualizer: Using shared audio context from equalizer');
        } else {
            // Create a new AudioContext and analyser for the visualizer.
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.source = this.audioContext.createMediaElementSource(this.audio);
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 256;

                this.source.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);
                console.log('Visualizer: Created independent audio graph');
            } catch (error) {
                console.error('Visualizer: Failed to create audio graph (media source may already exist):', error);
                return;
            }
        }

        if (this.analyser) {
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);

            // Set canvas size
            this.canvas.width = this.canvas.offsetWidth || 800;
            this.canvas.height = this.canvas.offsetHeight || 200;

            console.log(`Visualizer: Initialized successfully! Canvas size: ${this.canvas.width}x${this.canvas.height}`);
        } else {
            console.error('Visualizer: Failed to create analyser node');
        }
    }

    start() {
        console.log('Visualizer: start() called');
        if (!this.analyser) {
            console.log('Visualizer: No analyser, initializing...');
            this.initialize();
        }
        if (this.analyser) {
            // Ensure context is resumed (browsers often suspend until interaction)
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            console.log('Visualizer: Starting animation');
            this.isActive = true;
            this.canvas.classList.add('active');
            // Ensure canvas covers viewport when active
            this.canvas.style.display = 'block';
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            window.addEventListener('resize', this._resizeHandler);
            this.draw();
        } else {
            console.error('Visualizer: Cannot start - analyser not initialized');
        }
    }

    stop() {
        console.log('Visualizer: Stopping');
        this.isActive = false;
        this.canvas.classList.remove('active');
        this.canvas.style.display = 'none';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', this._resizeHandler);
        // Clear canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    setStyle(style) {
        this.style = style;
        console.log('Visualizer: Style changed to', style);
    }

    draw() {
        if (!this.isActive || !this.analyser) return;

        this.animationId = requestAnimationFrame(() => this.draw());
        this.analyser.getByteFrequencyData(this.dataArray);

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this.style) {
            case 'bars':
                this.drawBars();
                break;
            case 'waveform':
                this.drawWaveform();
                break;
            case 'circular':
                this.drawCircular();
                break;
        }
    }

    drawBars() {
        const barWidth = (this.canvas.width / this.bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
        gradient.addColorStop(0, primaryColor);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');

        for (let i = 0; i < this.bufferLength; i++) {
            barHeight = (this.dataArray[i] / 255) * this.canvas.height * 0.8;

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    drawWaveform() {
        this.analyser.getByteTimeDomainData(this.dataArray);

        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = primaryColor;
        this.ctx.beginPath();

        const sliceWidth = this.canvas.width / this.bufferLength;
        let x = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 128.0;
            const y = v * this.canvas.height / 2;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.ctx.stroke();
    }

    drawCircular() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        const bars = 64;
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();

        for (let i = 0; i < bars; i++) {
            const angle = (i / bars) * Math.PI * 2;
            const dataIndex = Math.floor((i / bars) * this.bufferLength);
            const barHeight = (this.dataArray[dataIndex] / 255) * (radius / 2);

            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + barHeight);
            const y2 = centerY + Math.sin(angle) * (radius + barHeight);

            const alpha = 0.3 + (this.dataArray[dataIndex] / 255) * 0.7;
            this.ctx.strokeStyle = primaryColor.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }

        // Draw center circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius - 5, 0, Math.PI * 2);
        this.ctx.strokeStyle = primaryColor;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
}

// Global instance
let visualizer = null;

// ==================== 10-BAND EQUALIZER ====================

class Equalizer {
    constructor(audioElement) {
        this.audio = audioElement;
        this.audioContext = null;
        this.source = null;
        this.analyser = null;
        this.filters = [];
        this.gainNode = null;
        this.isInitialized = false;
        
        // 10-band EQ frequencies (Hz)
        this.frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    }
    
    initialize() {
        if (this.isInitialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.source = this.audioContext.createMediaElementSource(this.audio);
            this.analyser = this.audioContext.createAnalyser();
            this.gainNode = this.audioContext.createGain();
            
            // Create 10 band-pass filters
            this.filters = this.frequencies.map((freq, index) => {
                const filter = this.audioContext.createBiquadFilter();
                filter.type = 'peaking';
                filter.frequency.value = freq;
                filter.Q.value = 1;
                filter.gain.value = 0;
                return filter;
            });
            
            // Connect: source -> filter chain -> gain -> analyser -> destination
            let currentNode = this.source;
            this.filters.forEach(filter => {
                currentNode.connect(filter);
                currentNode = filter;
            });
            currentNode.connect(this.gainNode);
            this.gainNode.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            this.isInitialized = true;
            console.log('Equalizer initialized');
        } catch (error) {
            console.error('Error initializing equalizer:', error);
            // If media source already exists, try to reuse existing context
            if (error.name === 'InvalidStateError') {
                console.warn('Audio source may already be connected. Equalizer may not work correctly.');
            }
        }
    }
    
    setBandGain(band, gain) {
        if (!this.isInitialized) this.initialize();
        if (band >= 0 && band < this.filters.length) {
            // Clamp gain between -12 and 12 dB
            gain = Math.max(-12, Math.min(12, gain));
            this.filters[band].gain.value = gain;
        }
    }
    
    getBandGain(band) {
        if (band >= 0 && band < this.filters.length) {
            return this.filters[band].gain.value;
        }
        return 0;
    }
    
    getAnalyser() {
        if (!this.isInitialized) this.initialize();
        return this.analyser;
    }
    
    getAudioContext() {
        if (!this.isInitialized) this.initialize();
        return this.audioContext;
    }
}

// Global equalizer instance
let equalizer = null;

// Initialize equalizer function (called from music-Scripts.js)
function initEqualizer(audioElement) {
    if (!equalizer) {
        equalizer = new Equalizer(audioElement);
        equalizer.initialize();
        window.equalizer = equalizer; // Make it globally accessible
    }
    return equalizer;
}

// Make it globally accessible
window.initEqualizer = initEqualizer;