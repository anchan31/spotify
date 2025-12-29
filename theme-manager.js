/**
 * theme-manager.js - Handles application color themes and custom colors
 */

class ThemeManager {
    constructor() {
        this.themes = {
            pink: { primary: '#ff74a4', secondary: '#9f6ea3', accent: '#ff74a4' },
            white: { primary: '#666666', secondary: '#888888', accent: '#666666' },
            blue: { primary: '#4a90e2', secondary: '#357abd', accent: '#4a90e2' },
            green: { primary: '#4caf50', secondary: '#388e3c', accent: '#4caf50' },
            purple: { primary: '#9c27b0', secondary: '#7b1fa2', accent: '#9c27b0' },
            orange: { primary: '#ff9800', secondary: '#f57c00', accent: '#ff9800' },
            teal: { primary: '#009688', secondary: '#00796b', accent: '#009688' },
            red: { primary: '#f44336', secondary: '#d32f2f', accent: '#f44336' },
            yellow: { primary: '#ffc107', secondary: '#ffa000', accent: '#ffc107' },
            indigo: { primary: '#3f51b5', secondary: '#303f9f', accent: '#3f51b5' },
            cyan: { primary: '#00bcd4', secondary: '#0097a7', accent: '#00bcd4' },
            custom: { primary: '#ff74a4', secondary: '#9f6ea3', accent: '#ff74a4' }
        };
        this.currentTheme = 'pink';
        this.darkMode = false;
        // initDarkMode will be called after Firebase is initialized
    }

    async initDarkMode() {
        // Load from Firebase
        await this.loadThemeSettings();
        
        if (this.darkMode) {
            document.body.classList.add('dark-mode');
        }

        // Initialize toggle switch if it exists
        const toggle = document.getElementById('dark-mode-toggle');
        if (toggle) {
            toggle.checked = this.darkMode;
            toggle.addEventListener('change', () => {
                this.toggleDarkMode();
            });
        }
    }

    async toggleDarkMode() {
        this.darkMode = !this.darkMode;
        document.body.classList.toggle('dark-mode', this.darkMode);
        await this.saveThemeSettings();

        // Re-apply theme to adjust background gradients if necessary
        const themeData = await this.loadTheme();
        if (themeData) {
            this.applyTheme(themeData.name, themeData.customColor);
        } else {
            this.applyTheme(this.currentTheme);
        }
    }

    applyTheme(themeName, customColor = null) {
        if (themeName === 'custom' && customColor) {
            this.themes.custom.primary = customColor;
            this.themes.custom.secondary = this.adjustColor(customColor, -20);
            this.themes.custom.accent = customColor;
        }

        const theme = this.themes[themeName];
        if (theme) {
            // Update CSS custom properties
            document.documentElement.style.setProperty('--primary', theme.primary);
            document.documentElement.style.setProperty('--secondary', theme.secondary);
            document.documentElement.style.setProperty('--highlight', theme.primary);
            document.documentElement.style.setProperty('--accent', theme.accent);

            // Update body background with subtle gradient
            const lightAccent = this.hexToRgba(theme.accent, 0.15);
            const lighterAccent = this.hexToRgba(theme.accent, 0.05);
            const baseBg = this.darkMode ? '#0a0a0a' : '#fff';

            if (this.darkMode) {
                // Premium dark mode: deep black with a subtle accent glow from the top right
                document.body.style.background = `radial-gradient(circle at top right, ${this.hexToRgba(theme.accent, 0.12)} 0%, ${baseBg} 60%)`;
            } else {
                document.body.style.background = `linear-gradient(135deg, ${lighterAccent} 0%, ${baseBg} 50%, ${lightAccent} 100%)`;
            }

            // Update glass and opacity backgrounds
            document.documentElement.style.setProperty('--glass-accent', this.hexToRgba(theme.accent, 0.08));
            document.documentElement.style.setProperty('--glass-accent-hover', this.hexToRgba(theme.accent, 0.12));
            document.documentElement.style.setProperty('--glass-accent-active', this.hexToRgba(theme.accent, 0.18));

            // Opacity variables for shadows and accents
            document.documentElement.style.setProperty('--accent-a40', this.hexToRgba(theme.accent, 0.4));
            document.documentElement.style.setProperty('--accent-a30', this.hexToRgba(theme.accent, 0.3));
            document.documentElement.style.setProperty('--accent-a05', this.hexToRgba(theme.accent, 0.05));

            this.currentTheme = themeName;
            // Save will be handled asynchronously
            this.saveTheme(themeName, customColor).catch(err => {
                console.error('Error saving theme:', err);
            });
        }
    }

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    adjustColor(color, percent) {
        // Convert hex to RGB, adjust brightness, convert back
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, Math.min(255, (num >> 16) + amt));
        const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
        const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    async saveTheme(themeName, customColor) {
        const themeData = { name: themeName };
        if (customColor) themeData.customColor = customColor;
        await this.saveThemeSettings();
    }

    async loadTheme() {
        return await this.loadThemeSettings();
    }

    async loadThemeSettings() {
        try {
            // Get userId from global scope (defined in music-Scripts.js)
            let userId = window.userId;
            if (!userId && typeof getUserId === 'function') {
                userId = await getUserId();
                window.userId = userId;
            }
            
            if (userId && typeof loadThemeSettings === 'function') {
                const settings = await loadThemeSettings(userId);
                if (settings.darkMode !== undefined) {
                    this.darkMode = settings.darkMode === true || settings.darkMode === 'true';
                }
                if (settings.selectedTheme) {
                    try {
                        const themeData = typeof settings.selectedTheme === 'string' 
                            ? JSON.parse(settings.selectedTheme) 
                            : settings.selectedTheme;
                        this.applyTheme(themeData.name, themeData.customColor);
                        return themeData;
                    } catch (e) {
                        console.error('Failed to parse theme data:', e);
                    }
                }
            }
        } catch (err) {
            console.error('Error loading theme settings:', err);
        }
        return null;
    }

    async saveThemeSettings() {
        try {
            // Get userId from global scope (defined in music-Scripts.js)
            let userId = window.userId;
            if (!userId && typeof getUserId === 'function') {
                userId = await getUserId();
                window.userId = userId;
            }
            
            if (userId && typeof saveThemeSettings === 'function') {
                const settings = {
                    darkMode: this.darkMode,
                    selectedTheme: {
                        name: this.currentTheme,
                        customColor: this.themes.custom ? this.themes.custom.primary : null
                    }
                };
                await saveThemeSettings(userId, settings);
            }
        } catch (err) {
            console.error('Error saving theme settings:', err);
        }
    }
}

// Global instance (initialized in music-Scripts.js)
let themeManager = null;
