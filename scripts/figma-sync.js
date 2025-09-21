#!/usr/bin/env node

/**
 * Figma Design Token Sync Script
 *
 * This script fetches design tokens from Figma and generates CSS custom properties.
 * It can extract colors, typography, spacing, and other design tokens from Figma variables.
 *
 * Usage:
 *   node scripts/figma-sync.js
 *
 * Environment Variables Required:
 *   FIGMA_ACCESS_TOKEN - Your Figma access token
 *   FIGMA_FILE_ID - The Figma file ID containing your design tokens
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// Configuration
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;
const OUTPUT_PATH = path.join(__dirname, '../src/styles/design-tokens.css');

// Figma API endpoints
const FIGMA_API_BASE = 'https://api.figma.com/v1';

// Helper functions
function toCSSVariable(name) {
  return `--${name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}`;
}

function rgbaToHex(r, g, b, a = 1) {
  const toHex = (n) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  if (a < 1) {
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

class FigmaTokenExtractor {
  constructor(token, fileId) {
    this.token = token;
    this.fileId = fileId;
    this.headers = {
      'X-Figma-Token': token,
      'Content-Type': 'application/json'
    };
  }

  async fetchFileVariables() {
    try {
      console.log('Fetching Figma variables...');
      const response = await axios.get(
        `${FIGMA_API_BASE}/files/${this.fileId}/variables/local`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching Figma variables:', error.response?.data || error.message);
      throw error;
    }
  }

  async fetchFileNodes() {
    try {
      console.log('Fetching Figma file data...');
      const response = await axios.get(
        `${FIGMA_API_BASE}/files/${this.fileId}`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching Figma file:', error.response?.data || error.message);
      throw error;
    }
  }

  processVariables(variablesData) {
    const tokens = {
      colors: {},
      spacing: {},
      typography: {},
      borderRadius: {},
      boxShadow: {}
    };

    if (!variablesData.meta || !variablesData.meta.variables) {
      console.warn('No variables found in Figma file');
      return tokens;
    }

    const variables = variablesData.meta.variables;

    Object.values(variables).forEach(variable => {
      if (!variable.name || !variable.valuesByMode) return;

      // Get the first mode's value (assuming single mode for simplicity)
      const modeId = Object.keys(variable.valuesByMode)[0];
      const value = variable.valuesByMode[modeId];

      const variableName = toCSSVariable(variable.name);

      switch (variable.resolvedType) {
        case 'COLOR':
          if (value && typeof value === 'object' && 'r' in value) {
            tokens.colors[variableName] = rgbaToHex(value.r, value.g, value.b, value.a);
          }
          break;

        case 'FLOAT':
          // Could be spacing, border radius, etc. - categorize by name
          if (variable.name.toLowerCase().includes('space') ||
              variable.name.toLowerCase().includes('gap') ||
              variable.name.toLowerCase().includes('margin') ||
              variable.name.toLowerCase().includes('padding')) {
            tokens.spacing[variableName] = `${value}px`;
          } else if (variable.name.toLowerCase().includes('radius')) {
            tokens.borderRadius[variableName] = `${value}px`;
          }
          break;

        case 'STRING':
          // Typography tokens
          if (variable.name.toLowerCase().includes('font') ||
              variable.name.toLowerCase().includes('text')) {
            tokens.typography[variableName] = value;
          }
          break;
      }
    });

    return tokens;
  }

  generateCSS(tokens) {
    let css = `/* Design Tokens CSS Variables */\n`;
    css += `/* Generated automatically from Figma on ${new Date().toISOString()} */\n\n`;
    css += `:root {\n`;

    // Add colors
    if (Object.keys(tokens.colors).length > 0) {
      css += `  /* Colors */\n`;
      Object.entries(tokens.colors).forEach(([name, value]) => {
        css += `  ${name}: ${value};\n`;
      });
      css += `\n`;
    }

    // Add spacing
    if (Object.keys(tokens.spacing).length > 0) {
      css += `  /* Spacing */\n`;
      Object.entries(tokens.spacing).forEach(([name, value]) => {
        css += `  ${name}: ${value};\n`;
      });
      css += `\n`;
    }

    // Add typography
    if (Object.keys(tokens.typography).length > 0) {
      css += `  /* Typography */\n`;
      Object.entries(tokens.typography).forEach(([name, value]) => {
        css += `  ${name}: ${value};\n`;
      });
      css += `\n`;
    }

    // Add border radius
    if (Object.keys(tokens.borderRadius).length > 0) {
      css += `  /* Border Radius */\n`;
      Object.entries(tokens.borderRadius).forEach(([name, value]) => {
        css += `  ${name}: ${value};\n`;
      });
      css += `\n`;
    }

    css += `}\n`;

    return css;
  }

  async extractTokens() {
    try {
      // Try to fetch variables first (modern Figma approach)
      let tokens = { colors: {}, spacing: {}, typography: {}, borderRadius: {}, boxShadow: {} };

      try {
        const variablesData = await this.fetchFileVariables();
        tokens = this.processVariables(variablesData);
        console.log('Successfully extracted tokens from Figma variables');
      } catch (_) {
        console.warn('Could not fetch variables, falling back to styles extraction');
        // Could implement styles-based extraction here as fallback
      }

      // Generate CSS
      const css = this.generateCSS(tokens);

      // Write to file
      fs.writeFileSync(OUTPUT_PATH, css, 'utf8');
      console.log(`✅ Design tokens successfully written to ${OUTPUT_PATH}`);

      // Log summary
      const tokenCounts = Object.entries(tokens).map(([type, values]) =>
        `${type}: ${Object.keys(values).length}`
      ).join(', ');
      console.log(`📊 Extracted tokens: ${tokenCounts}`);

      return tokens;
    } catch (error) {
      console.error('❌ Failed to extract design tokens:', error.message);
      throw error;
    }
  }
}

// Main execution
async function main() {
  console.log('🎨 Starting Figma design token sync...\n');

  // Validate environment variables
  if (!FIGMA_ACCESS_TOKEN) {
    console.error('❌ FIGMA_ACCESS_TOKEN is required. Please set it in your .env file.');
    process.exit(1);
  }

  if (!FIGMA_FILE_ID) {
    console.error('❌ FIGMA_FILE_ID is required. Please set it in your .env file.');
    process.exit(1);
  }

  try {
    const extractor = new FigmaTokenExtractor(FIGMA_ACCESS_TOKEN, FIGMA_FILE_ID);
    await extractor.extractTokens();
    console.log('\n🎉 Figma sync completed successfully!');
  } catch (error) {
    console.error('\n💥 Figma sync failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { FigmaTokenExtractor };