import chalk from 'chalk';
const log = console.log;
const violet = chalk.bold.rgb(102,0,153);

/**
 * Welcome messages for users
 * @returns {void}
 */
const welcomeMessage = (): void => {
	log(`
	___________       ________
	___  __ \\_${violet(" |     / /")}__    |
	__  /_/ /_ ${violet("| /| / /")}__  /| |
	_  ____/__ ${violet("|/ |/ / ")}_  ___ |
	/_/     __${violet("__/|__/  ")}/_/  |_|

	`)

	log(chalk.bold.blue("webpack-scaffold-pwa"));
	log("Come let us build a PWA 😎 🚀");
};

export default welcomeMessage;
