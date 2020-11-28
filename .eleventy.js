const sharp = require("sharp");
const fs = require("fs");
const CleanCSS = require("clean-css");
const { minify } = require("terser");
const metagen = require("eleventy-plugin-metagen");

module.exports = (eleventyConfig) => {

    eleventyConfig.addPlugin(metagen);

    eleventyConfig.setTemplateFormats([
        "md",
        "njk"
    ]);

    markdownTemplateEngine: "njk";

    // Perform manual passthrough file copy to include directories in the build output _site
    eleventyConfig.addPassthroughCopy("images");
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("js");
    eleventyConfig.addPassthroughCopy("favicon_data");

    // Create css-clean CSS Minifier filter
    eleventyConfig.addFilter("cssmin", function (code) {
        // console.log(new CleanCSS({}).minify(code).stats);
        return new CleanCSS({}).minify(code).styles;
    });

    // Create terser JS Minifier async filter (Nunjucks)
    eleventyConfig.addNunjucksAsyncFilter("jsmin", async function (
        code,
        callback
    ) {
        try {
            const minified = await minify(code);
            callback(null, minified.code);
        } catch (err) {
            console.log(`Terser error: ${err}`);
            // Fail gracefully
            callback(null, code);
        }
    });

    // Configure image in a template paired shortcode
    eleventyConfig.addPairedShortcode("image", (srcSet, src, alt, sizes = "(min-width: 400px) 33.3vw, 100vw") => {
        return `<img srcset="${srcSet}" src="${src}" alt="${alt}" sizes="${sizes}" />`;
    });

    // Configure outgoing Pexels anchor elements in a template paried shortcode
    eleventyConfig.addPairedShortcode("link", (href, cls = "image-link", rel = "noopener", target = "_blank", btnTxt = "Youtube") => {
        return `<a class="${cls}" href="${href}" rel="${rel}" target="${target}">${btnTxt}</a>`;
    });

    /* This function accepts one 
    * parameter (an image) and will create
    * three resized images in the specified
    * format. (.jpg, .webp, etc)
    */
    function sharpImages(fileName) {
        let shortName = fileName.replace(/\.\w+$/, "")
        let resizeImgSmall = () => {
            fs.readFileSync(fileName)
            sharp(`${fileName}`, { failOnError: false })
                .resize(320, 240)
                .toFile(`${shortName}-small.webp`);
            fs.readFileSync(fileName)
            sharp(`${fileName}`, { failOnError: false })
                .resize(320, 240)
                .toFile(`${shortName}-small.jpg`);
        };
        resizeImgSmall();

        let resizeImgMed = () => {
            fs.readFileSync(fileName)
            sharp(`${fileName}`, { failOnError: false })
                .resize(640, 480)
                .toFile(`${shortName}-med.webp`);
            fs.readFileSync(fileName)
            sharp(`${fileName}`, { failOnError: false })
                .resize(640, 480)
                .toFile(`${shortName}-med.jpg`);
        };
        resizeImgMed();

        let resizeImgLarge = () => {
            fs.readFileSync(`${fileName}`)
            sharp(`${fileName}`, { failOnError: false })
                .resize(1024, 768)
                .toFile(`${shortName}-large.webp`);
            fs.readFileSync(`${fileName}`)
            sharp(`${fileName}`, { failOnError: false })
                .resize(1024, 768)
                .toFile(`${shortName}-large.jpg`);
        };
        resizeImgLarge();
    }
    /* This function accepts one 
    * parameter (an image) and will create
    * three resized images in the specified
    * format. (.jpg, .webp, etc)
    */

    // Make sure to comment or remove this function
    // call once you've created the images you need
    // as it will create new images on every build.

    const sharpArray = [
        "apink.webp",
        "blackpink.webp",
        "gfriend.webp",
        "itzy.webp",
        "izone.webp",
        "mamamoo.jpg",
        "rv.webp",
        "snsd.webp",
        "twice.webp",
    ]

    function runSharp(sharpArray) {
        for (let i = 0; i < sharpArray.length; i++) {
            sharpImages(`./images/${sharpArray[i]}`)
        }
    }

    // runSharp(sharpArray)

    /* 
     Use https://squoosh.app/ for resizing images with more options
     sharpImages function creates 3 resized sharp versions of a specified image file
    */

    return {
        dir: {
            input: ".",
            output: "_site",
            layouts: "_includes/layouts",
            includes: "_includes",
        },
        templateFormats: ["md", "liquid", "njk"],
        passthroughFileCopy: true
    }
};