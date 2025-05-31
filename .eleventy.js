import esbuild from 'esbuild';
import { execSync } from 'child_process';

export default function(eleventyConfig) {
  // Remove redundant passthrough copies since build scripts handle CSS/JS
  // eleventyConfig.addPassthroughCopy("htdocs/css");
  // eleventyConfig.addPassthroughCopy("htdocs/js");
  
  // Copy assets folder (images, fonts, etc.)
  eleventyConfig.addPassthroughCopy("src/assets");
  
  // Copy Apache and SEO files
  eleventyConfig.addPassthroughCopy("src/.htaccess");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  
  // Watch source files (not output files)
  eleventyConfig.addWatchTarget("./src/css/");
  eleventyConfig.addWatchTarget("./src/js/");
  eleventyConfig.addWatchTarget("./src/assets/");

  // CSS Transform using Tailwind
  eleventyConfig.addTransform("css", async function(content, outputPath) {
    if (outputPath && outputPath.endsWith(".css")) {
      try {
        const result = execSync(`tailwindcss -i ${this.inputPath} --minify`, { 
          encoding: 'utf8',
          cwd: process.cwd()
        });
        return result;
      } catch (error) {
        console.error("CSS Transform Error:", error);
        return content;
      }
    }
    return content;
  });

  // JS Transform using esbuild
  eleventyConfig.addTransform("js", async function(content, outputPath) {
    if (outputPath && outputPath.endsWith(".js")) {
      try {
        const result = await esbuild.transform(content, {
          minify: true,
          format: 'esm',
          target: 'es2020'
        });
        return result.code;
      } catch (error) {
        console.error("JS Transform Error:", error);
        return content;
      }
    }
    return content;
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