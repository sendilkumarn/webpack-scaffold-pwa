module.exports = function createWebappManifest(details) {
    let manifestObj = {
        "background_color": details.themeColor,
        "manifest_version": 2,
        "name": details.name,
        "short_name": details.shortName,
        "start_url": "/" + details.homePage,
        "theme_color": details.themeColor,
        "version": "1.0.0"
    };

    return JSON.stringify(manifestObj);
};
