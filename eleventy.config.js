import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["svg", "webp"],
    widths: [96, 192],
    svgShortCircuit: "size",
    htmlOptions: {
      imgAttributes: {
        loading: "lazy",
        decoding: "async"
      }
    }
  });

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  eleventyConfig.addCollection("jobs", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/jobs/*.md")
      .filter((job) => !job.data.draft)
      .sort((a, b) => new Date(b.data.posted) - new Date(a.data.posted))
  );

  eleventyConfig.addCollection("brands", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/brands/*.md")
      .filter((brand) => !brand.data.draft)
      .sort((a, b) => a.data.name.localeCompare(b.data.name))
  );

  eleventyConfig.addFilter("brandBySlug", (brands, slug) =>
    (brands || []).find((brand) => brand.fileSlug === slug)
  );

  eleventyConfig.addFilter("jobsByBrand", (jobs, slug) =>
    (jobs || []).filter((job) => job.data.brand === slug)
  );

  eleventyConfig.addFilter("marqueeBrands", (brands) =>
    (brands || []).filter((brand) => brand.data.show_in_marquee && brand.data.logo)
  );

  eleventyConfig.addFilter("readableDate", (value) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(value))
  );

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
}
