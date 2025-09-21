#!/usr/bin/env node

/**
 * Figma Design Data Extractor
 *
 * This script extracts complete design specifications from a specific Figma node
 * for pixel-perfect implementation. It fetches layout, styling, assets, and content.
 *
 * Usage:
 *   node scripts/figma-design-extractor.js [node-id]
 *
 * Environment Variables Required:
 *   FIGMA_ACCESS_TOKEN - Your Figma access token
 *   FIGMA_FILE_ID - The Figma file ID
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// Configuration
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;
const BASE_OUTPUT_DIR = path.join(__dirname, '../figma-extracted-design');

// Figma API endpoints
const FIGMA_API_BASE = 'https://api.figma.com/v1';

// Helper functions for dynamic naming
function sanitizeFileName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateComponentName(nodeName) {
  return nodeName
    .split(/[\s-_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '');
}

function createExtractionFolder(nodeName, nodeId) {
  const sanitizedName = sanitizeFileName(nodeName);
  const folderName = `${sanitizedName}-${nodeId.replace(':', '-')}`;
  return path.join(BASE_OUTPUT_DIR, folderName);
}

function loadExtractionIndex() {
  const indexPath = path.join(BASE_OUTPUT_DIR, 'extraction-index.json');
  try {
    if (fs.existsSync(indexPath)) {
      return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    }
  } catch (_) {
    console.warn('Could not load extraction index, creating new one');
  }
  return { extractions: [], lastUpdated: null };
}

function saveExtractionIndex(index) {
  const indexPath = path.join(BASE_OUTPUT_DIR, 'extraction-index.json');
  fs.mkdirSync(BASE_OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
}

class FigmaDesignExtractor {
  constructor(token, fileId) {
    this.token = token;
    this.fileId = fileId;
    this.headers = {
      'X-Figma-Token': token,
      'Content-Type': 'application/json'
    };
  }

  async fetchFileData() {
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

  async fetchSpecificNode(nodeId) {
    try {
      console.log(`Fetching specific node: ${nodeId}...`);
      const response = await axios.get(
        `${FIGMA_API_BASE}/files/${this.fileId}/nodes?ids=${nodeId}`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching specific node:', error.response?.data || error.message);
      throw error;
    }
  }

  async fetchImages(nodeIds) {
    try {
      console.log('Fetching image exports...');
      const response = await axios.get(
        `${FIGMA_API_BASE}/images/${this.fileId}?ids=${nodeIds.join(',')}&format=png&scale=2`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching images:', error.response?.data || error.message);
      return { images: {} };
    }
  }

  findNodeById(node, targetId) {
    if (node.id === targetId) {
      return node;
    }

    if (node.children) {
      for (const child of node.children) {
        const found = this.findNodeById(child, targetId);
        if (found) return found;
      }
    }

    return null;
  }

  extractTextStyles(node) {
    if (!node.style) return null;

    return {
      fontFamily: node.style.fontFamily,
      fontWeight: node.style.fontWeight,
      fontSize: node.style.fontSize,
      lineHeight: node.style.lineHeightPx || node.style.lineHeightPercentFontSize,
      letterSpacing: node.style.letterSpacing,
      textAlign: node.style.textAlignHorizontal,
      textColor: this.extractColor(node.fills?.[0]),
      textDecoration: node.style.textDecoration,
      textCase: node.style.textCase
    };
  }

  extractColor(fill) {
    if (!fill || fill.type !== 'SOLID') return null;

    const { r, g, b, a = 1 } = fill.color;
    if (a < 1) {
      return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
    }

    const toHex = (n) => {
      const hex = Math.round(n * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  extractLayoutProperties(node) {
    return {
      width: node.absoluteBoundingBox?.width,
      height: node.absoluteBoundingBox?.height,
      x: node.absoluteBoundingBox?.x,
      y: node.absoluteBoundingBox?.y,
      constraints: node.constraints,
      layoutMode: node.layoutMode,
      primaryAxisSizingMode: node.primaryAxisSizingMode,
      counterAxisSizingMode: node.counterAxisSizingMode,
      primaryAxisAlignItems: node.primaryAxisAlignItems,
      counterAxisAlignItems: node.counterAxisAlignItems,
      paddingLeft: node.paddingLeft,
      paddingRight: node.paddingRight,
      paddingTop: node.paddingTop,
      paddingBottom: node.paddingBottom,
      itemSpacing: node.itemSpacing,
      cornerRadius: node.cornerRadius,
      rectangleCornerRadii: node.rectangleCornerRadii
    };
  }

  extractEffects(node) {
    if (!node.effects || node.effects.length === 0) return [];

    return node.effects.map(effect => ({
      type: effect.type,
      visible: effect.visible,
      radius: effect.radius,
      color: this.extractColor({ color: effect.color, type: 'SOLID' }),
      offset: effect.offset,
      spread: effect.spread,
      blendMode: effect.blendMode
    }));
  }

  async downloadImage(url, filename, outputDir) {
    try {
      const response = await axios.get(url, { responseType: 'stream' });
      const imagePath = path.join(outputDir, 'assets', filename);

      // Ensure directory exists
      fs.mkdirSync(path.dirname(imagePath), { recursive: true });

      const writer = fs.createWriteStream(imagePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(imagePath));
        writer.on('error', reject);
      });
    } catch (error) {
      console.error(`Failed to download image ${filename}:`, error.message);
      return null;
    }
  }

  async processNode(node, _ = {}) {
    const nodeData = {
      id: node.id,
      name: node.name,
      type: node.type,
      visible: node.visible !== false,
      layout: this.extractLayoutProperties(node),
      effects: this.extractEffects(node),
      fills: node.fills?.map(fill => ({
        type: fill.type,
        color: this.extractColor(fill),
        gradientStops: fill.gradientStops?.map(stop => ({
          position: stop.position,
          color: this.extractColor({ color: stop.color, type: 'SOLID' })
        })),
        gradientTransform: fill.gradientTransform
      })),
      strokes: node.strokes?.map(stroke => ({
        type: stroke.type,
        color: this.extractColor(stroke)
      })),
      strokeWeight: node.strokeWeight,
      strokeAlign: node.strokeAlign,
      children: []
    };

    // Extract text-specific properties
    if (node.type === 'TEXT') {
      nodeData.text = {
        characters: node.characters,
        style: this.extractTextStyles(node)
      };
    }

    // Process children recursively
    if (node.children) {
      for (const child of node.children) {
        const childData = await this.processNode(child, nodeData);
        nodeData.children.push(childData);
      }
    }

    return nodeData;
  }

  collectImageNodes(node, imageNodes = []) {
    // Collect nodes that might have images
    if (node.fills) {
      for (const fill of node.fills) {
        if (fill.type === 'IMAGE') {
          imageNodes.push(node.id);
          break;
        }
      }
    }

    if (node.children) {
      for (const child of node.children) {
        this.collectImageNodes(child, imageNodes);
      }
    }

    return imageNodes;
  }

  generateTailwindCSS(nodeData) {
    const css = [];

    // Generate classes based on layout properties
    if (nodeData.layout.width) {
      css.push(`w-[${nodeData.layout.width}px]`);
    }
    if (nodeData.layout.height) {
      css.push(`h-[${nodeData.layout.height}px]`);
    }

    // Background colors
    if (nodeData.fills && nodeData.fills.length > 0) {
      const primaryFill = nodeData.fills[0];
      if (primaryFill.color) {
        css.push(`bg-[${primaryFill.color}]`);
      }
    }

    // Text styles
    if (nodeData.text && nodeData.text.style) {
      const style = nodeData.text.style;
      if (style.fontSize) css.push(`text-[${style.fontSize}px]`);
      if (style.fontWeight) css.push(`font-[${style.fontWeight}]`);
      if (style.textColor) css.push(`text-[${style.textColor}]`);
      if (style.textAlign) {
        const alignMap = { LEFT: 'left', CENTER: 'center', RIGHT: 'right' };
        css.push(`text-${alignMap[style.textAlign] || 'left'}`);
      }
    }

    // Border radius
    if (nodeData.layout.cornerRadius) {
      css.push(`rounded-[${nodeData.layout.cornerRadius}px]`);
    }

    return css.join(' ');
  }

  generateReactComponent(nodeData, componentName = 'TindaGoShare') {
    let jsx = `import React from 'react';\n\n`;
    jsx += `const ${componentName} = () => {\n`;
    jsx += `  return (\n`;
    jsx += this.generateJSXFromNode(nodeData, 4);
    jsx += `  );\n`;
    jsx += `};\n\n`;
    jsx += `export default ${componentName};`;

    return jsx;
  }

  generateJSXFromNode(node, indent = 0) {
    const spaces = ' '.repeat(indent);
    const className = this.generateTailwindCSS(node);

    if (node.type === 'TEXT') {
      return `${spaces}<div className="${className}">\n${spaces}  ${node.text.characters || ''}\n${spaces}</div>\n`;
    }

    let jsx = `${spaces}<div className="${className}">\n`;

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        jsx += this.generateJSXFromNode(child, indent + 2);
      }
    }

    jsx += `${spaces}</div>\n`;
    return jsx;
  }

  async extractDesign(nodeId) {
    try {
      console.log(`🎨 Starting design extraction for node: ${nodeId}\n`);

      // Fetch the specific node data first to get the node name
      const nodeResponse = await this.fetchSpecificNode(nodeId);
      const targetNode = nodeResponse.nodes[nodeId]?.document;

      if (!targetNode) {
        throw new Error(`Node ${nodeId} not found in the Figma file`);
      }

      console.log(`Found node: ${targetNode.name} (${targetNode.type})`);

      // Create dynamic output directory based on node name and ID
      const outputDir = createExtractionFolder(targetNode.name, nodeId);
      const componentName = generateComponentName(targetNode.name);

      console.log(`📁 Output directory: ${outputDir}`);
      console.log(`🏗️  Component name: ${componentName}`);

      // Create output directory structure
      fs.mkdirSync(outputDir, { recursive: true });
      fs.mkdirSync(path.join(outputDir, 'assets'), { recursive: true });

      // Process the node and extract all design data
      const processedNode = await this.processNode(targetNode);

      // Collect all image nodes for export
      const imageNodes = this.collectImageNodes(targetNode);
      console.log(`Found ${imageNodes.length} potential image nodes`);

      // Download images if any
      let downloadedImages = {};
      if (imageNodes.length > 0) {
        const imageResponse = await this.fetchImages(imageNodes);
        if (imageResponse.images) {
          for (const [nodeId, imageUrl] of Object.entries(imageResponse.images)) {
            if (imageUrl) {
              const filename = `${nodeId}.png`;
              const localPath = await this.downloadImage(imageUrl, filename, outputDir);
              if (localPath) {
                downloadedImages[nodeId] = filename;
                console.log(`Downloaded: ${filename}`);
              }
            }
          }
        }
      }

      // Generate React component with dynamic name
      const reactComponent = this.generateReactComponent(processedNode, componentName);

      // Save all extracted data
      const designData = {
        meta: {
          extractedAt: new Date().toISOString(),
          nodeId: nodeId,
          nodeName: targetNode.name,
          nodeType: targetNode.type,
          componentName: componentName,
          figmaFileId: this.fileId,
          outputPath: path.relative(BASE_OUTPUT_DIR, outputDir)
        },
        design: processedNode,
        assets: downloadedImages,
        implementation: {
          reactComponent: reactComponent,
          tailwindClasses: this.generateTailwindCSS(processedNode)
        }
      };

      // Write design data to JSON
      fs.writeFileSync(
        path.join(outputDir, 'design-data.json'),
        JSON.stringify(designData, null, 2),
        'utf8'
      );

      // Write React component to file with dynamic name
      fs.writeFileSync(
        path.join(outputDir, `${componentName}.tsx`),
        reactComponent,
        'utf8'
      );

      // Write detailed specifications
      const specs = this.generateSpecifications(processedNode);
      fs.writeFileSync(
        path.join(outputDir, 'design-specifications.md'),
        specs,
        'utf8'
      );

      // Update extraction index
      const index = loadExtractionIndex();
      const existingIndex = index.extractions.findIndex(ext => ext.nodeId === nodeId);

      const extractionEntry = {
        nodeId: nodeId,
        nodeName: targetNode.name,
        componentName: componentName,
        extractedAt: new Date().toISOString(),
        outputPath: path.relative(BASE_OUTPUT_DIR, outputDir),
        folderName: path.basename(outputDir),
        assetCount: Object.keys(downloadedImages).length
      };

      if (existingIndex >= 0) {
        index.extractions[existingIndex] = extractionEntry;
        console.log(`📝 Updated existing extraction in index`);
      } else {
        index.extractions.push(extractionEntry);
        console.log(`📝 Added new extraction to index`);
      }

      index.lastUpdated = new Date().toISOString();
      saveExtractionIndex(index);

      // Generate overview README
      this.generateOverviewReadme(index);

      console.log(`\n✅ Design extraction completed successfully!`);
      console.log(`📁 Output directory: ${outputDir}`);
      console.log(`📊 Extracted ${Object.keys(downloadedImages).length} images`);
      console.log(`🎯 Generated ${componentName} component and Tailwind classes`);
      console.log(`📋 Total extractions: ${index.extractions.length}`);

      return designData;

    } catch (error) {
      console.error('❌ Design extraction failed:', error.message);
      throw error;
    }
  }

  generateSpecifications(node, level = 0) {
    const indent = '  '.repeat(level);
    let specs = '';

    if (level === 0) {
      specs += '# TindaGo Share Design Specifications\n\n';
      specs += `Generated on: ${new Date().toLocaleString()}\n\n`;
    }

    specs += `${indent}## ${node.name} (${node.type})\n\n`;

    // Layout specifications
    if (node.layout) {
      specs += `${indent}### Layout\n`;
      specs += `${indent}- Dimensions: ${node.layout.width}px × ${node.layout.height}px\n`;
      if (node.layout.x !== undefined) specs += `${indent}- Position: (${node.layout.x}, ${node.layout.y})\n`;
      if (node.layout.paddingLeft) specs += `${indent}- Padding: ${node.layout.paddingTop || 0}px ${node.layout.paddingRight || 0}px ${node.layout.paddingBottom || 0}px ${node.layout.paddingLeft || 0}px\n`;
      if (node.layout.itemSpacing) specs += `${indent}- Item Spacing: ${node.layout.itemSpacing}px\n`;
      if (node.layout.cornerRadius) specs += `${indent}- Border Radius: ${node.layout.cornerRadius}px\n`;
      specs += '\n';
    }

    // Text specifications
    if (node.text) {
      specs += `${indent}### Text\n`;
      specs += `${indent}- Content: "${node.text.characters}"\n`;
      if (node.text.style) {
        const style = node.text.style;
        if (style.fontFamily) specs += `${indent}- Font Family: ${style.fontFamily}\n`;
        if (style.fontSize) specs += `${indent}- Font Size: ${style.fontSize}px\n`;
        if (style.fontWeight) specs += `${indent}- Font Weight: ${style.fontWeight}\n`;
        if (style.lineHeight) specs += `${indent}- Line Height: ${style.lineHeight}px\n`;
        if (style.textColor) specs += `${indent}- Color: ${style.textColor}\n`;
        if (style.textAlign) specs += `${indent}- Text Align: ${style.textAlign}\n`;
      }
      specs += '\n';
    }

    // Fill specifications
    if (node.fills && node.fills.length > 0) {
      specs += `${indent}### Styling\n`;
      node.fills.forEach((fill, index) => {
        if (fill.color) {
          specs += `${indent}- Background ${index + 1}: ${fill.color}\n`;
        }
        if (fill.gradientStops) {
          specs += `${indent}- Gradient ${index + 1}: ${fill.gradientStops.map(stop => `${stop.color} ${(stop.position * 100).toFixed(1)}%`).join(', ')}\n`;
        }
      });
      specs += '\n';
    }

    // Effects specifications
    if (node.effects && node.effects.length > 0) {
      specs += `${indent}### Effects\n`;
      node.effects.forEach((effect, index) => {
        specs += `${indent}- ${effect.type} ${index + 1}: `;
        if (effect.color) specs += `color ${effect.color}, `;
        if (effect.radius) specs += `blur ${effect.radius}px, `;
        if (effect.offset) specs += `offset (${effect.offset.x}, ${effect.offset.y}), `;
        if (effect.spread) specs += `spread ${effect.spread}px`;
        specs += '\n';
      });
      specs += '\n';
    }

    // Children specifications
    if (node.children && node.children.length > 0) {
      specs += `${indent}### Children (${node.children.length})\n\n`;
      node.children.forEach(child => {
        specs += this.generateSpecifications(child, level + 1);
      });
    }

    return specs;
  }

  generateOverviewReadme(index) {
    const readmePath = path.join(BASE_OUTPUT_DIR, 'README.md');

    let readme = `# TindaGo Figma Design Extractions\n\n`;
    readme += `Generated on: ${new Date().toLocaleString()}\n`;
    readme += `Total Extractions: ${index.extractions.length}\n\n`;

    if (index.extractions.length === 0) {
      readme += `No extractions yet. Run the figma-design-extractor script to extract your first design!\n\n`;
      readme += `Example: \`node scripts/figma-design-extractor.js 281-980\`\n`;
    } else {
      readme += `## Available Extractions\n\n`;
      readme += `| Component | Node ID | Extracted | Assets | Folder |\n`;
      readme += `|-----------|---------|-----------|--------|---------|\n`;

      index.extractions
        .sort((a, b) => new Date(b.extractedAt) - new Date(a.extractedAt))
        .forEach(extraction => {
          const date = new Date(extraction.extractedAt).toLocaleDateString();
          readme += `| ${extraction.componentName} | \`${extraction.nodeId}\` | ${date} | ${extraction.assetCount} | [\`${extraction.folderName}\`](./${extraction.folderName}/) |\n`;
        });

      readme += `\n## How to Use\n\n`;
      readme += `Each extraction folder contains:\n`;
      readme += `- \`{ComponentName}.tsx\` - Ready-to-use React component\n`;
      readme += `- \`design-data.json\` - Complete design specifications\n`;
      readme += `- \`design-specifications.md\` - Human-readable documentation\n`;
      readme += `- \`assets/\` - All exported images and assets\n\n`;

      readme += `## Extraction Commands\n\n`;
      readme += `To extract a new design:\n`;
      readme += `\`\`\`bash\n`;
      readme += `node scripts/figma-design-extractor.js [node-id]\n`;
      readme += `\`\`\`\n\n`;

      readme += `Example node IDs:\n`;
      index.extractions.forEach(extraction => {
        readme += `- \`${extraction.nodeId}\` - ${extraction.nodeName}\n`;
      });
    }

    fs.writeFileSync(readmePath, readme, 'utf8');
  }
}

// Token validation function
async function validateFigmaToken(token) {
  try {
    console.log('🔍 Validating Figma access token...');
    const response = await axios.get(
      `${FIGMA_API_BASE}/me`,
      {
        headers: {
          'X-Figma-Token': token,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.email) {
      console.log(`✅ Token valid! Authenticated as: ${response.data.email}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Token validation failed:');

    if (error.response?.status === 403) {
      console.error('🚫 Status 403: Invalid or expired Figma access token');
      console.error('💡 Solutions:');
      console.error('   1. Generate a new token: https://www.figma.com/developers/api#access-tokens');
      console.error('   2. Make sure token has access to the file');
      console.error('   3. Check if token was copied correctly to .env file');
    } else if (error.response?.status === 401) {
      console.error('🚫 Status 401: Unauthorized - check your token format');
    } else {
      console.error(`🚫 Status ${error.response?.status}: ${error.response?.statusText}`);
      console.error('Full error:', error.response?.data || error.message);
    }

    return false;
  }
}

// Main execution
async function main() {
  const nodeId = process.argv[2] || '281-115';

  console.log('🎨 TindaGo Figma Design Extractor\n');
  console.log(`📋 Target Node ID: ${nodeId}`);
  console.log(`📄 Figma File ID: ${FIGMA_FILE_ID}\n`);

  // Validate environment variables
  if (!FIGMA_ACCESS_TOKEN || FIGMA_ACCESS_TOKEN === 'placeholder_token_needed') {
    console.error('❌ FIGMA_ACCESS_TOKEN is required.');
    console.error('Please set your Figma personal access token in the .env file.');
    console.error('Get your token from: https://www.figma.com/developers/api#access-tokens');
    process.exit(1);
  }

  if (!FIGMA_FILE_ID) {
    console.error('❌ FIGMA_FILE_ID is required. Please set it in your .env file.');
    process.exit(1);
  }

  // Validate token before proceeding
  const isValidToken = await validateFigmaToken(FIGMA_ACCESS_TOKEN);
  if (!isValidToken) {
    console.error('\n❌ Cannot proceed with invalid token. Please fix the token issue first.');
    process.exit(1);
  }

  try {
    const extractor = new FigmaDesignExtractor(FIGMA_ACCESS_TOKEN, FIGMA_FILE_ID);
    await extractor.extractDesign(nodeId);
    console.log('\n🎉 Design extraction completed successfully!');
    console.log(`📁 Check the output in: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('\n💥 Design extraction failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { FigmaDesignExtractor };