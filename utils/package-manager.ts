import spawn from "cross-spawn";

/**
 *
 * Returns the name of package manager to use,
 * preferring yarn over npm if available
 *
 * @returns {String} - The package manager name
 */

const getPackageManager = () => {
	if (spawn.sync("yarn", [" --version"], { stdio: "ignore" }).error) {
		return "npm";
	}

	return "yarn";
};

export default getPackageManager;
