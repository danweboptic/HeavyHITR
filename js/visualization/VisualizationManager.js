class VisualizationManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.visualizationTimer = null;
    }

    initialize() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear any existing visualization timer
        if (this.visualizationTimer) {
            cancelAnimationFrame(this.visualizationTimer);
        }

        // Initial clear
        this.context.clearRect(0, 0, width, height);
    }

    update(analyser, isRunning) {
        if (!analyser || !isRunning) {
            this.stop();
            return;
        }

        const width = this.canvas.width;
        const height = this.canvas.height;

        // Create buffer for frequency data
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Get current frequency data
        analyser.getByteFrequencyData(dataArray);

        // Clear canvas
        this.context.clearRect(0, 0, width, height);

        // Draw visualization
        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;

        // Neon gradient colors
        const gradient = this.context.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#5D5CDE'); // Neon purple
        gradient.addColorStop(0.5, '#8A2BE2'); // Neon blue
        gradient.addColorStop(1, '#F72585'); // Neon pink

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] / 255 * height;

            // Draw bar
            this.context.fillStyle = gradient;
            this.context.fillRect(x, height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }

        // Schedule next frame
        this.visualizationTimer = requestAnimationFrame(() => this.update(analyser, isRunning));
    }

    stop() {
        if (this.visualizationTimer) {
            cancelAnimationFrame(this.visualizationTimer);
            this.visualizationTimer = null;
        }

        // Clear visualization
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export default VisualizationManager;