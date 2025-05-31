import esbuild from 'esbuild';
import { execSync } from 'child_process';

export default function(eleventyConfig) {
  // Remove redundant passthrough copies since build scripts handle CSS/JS
  // eleventyConfig.addPassthroughCopy("htdocs/css");
  // eleventyConfig.addPassthroughCopy("htdocs/js");
  
  // Copy assets folder (images, fonts, etc.)
  eleventyConfig.addPassthroughCopy("src/assets");
  
  // Copy Apache files
  eleventyConfig.addPassthroughCopy("src/.htaccess");
  // Remove robots.txt passthrough since it's now a template
  // eleventyConfig.addPassthroughCopy("src/robots.txt");
  
  // Watch source files (not output files)
  eleventyConfig.addWatchTarget("./src/css/");
  eleventyConfig.addWatchTarget("./src/js/");
  eleventyConfig.addWatchTarget("./src/assets/");

  // Add date filter for sitemap
  eleventyConfig.addFilter("date", function(date, format) {
    if (!date) return '';
    const d = new Date(date);
    if (format === 'YYYY-MM-DD') {
      return d.toISOString().split('T')[0];
    }
    return d.toISOString();
  });

  // Add sitemap generation
  eleventyConfig.addCollection("sitemap", function(collectionApi) {
    return collectionApi.getAll().filter(item => {
      return item.url && !item.data.excludeFromSitemap;
    });
  });
  
  return {
    dir: {
      input: "src",
      output: "htdocs",
      includes: "_includes"
    }
  };
} 