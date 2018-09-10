const path = require('path');

const startUrlQuestion = {
	default: () => "/",
	message: "Enter startURL for your application: ",
	name: "startURL",
	type: "input"
};

const entryQuestion = {
	default: () => "'./index.js'",
	message: 'Which file would be the first to enter the application?',
	name: 'entryFile',
	type: 'input',
	validate: value => {
		const pattern = /[^\s]*.js/i;
		if (pattern.test(value)) {
			return true;
		} else {
			return "Invalid path or file.";
		}
	}
};

const nameQuestion = {
	default: () => process.cwd().split(path.sep)
		.pop(),
	message: "Let's create one. What is the name of your application?",
	name: 'name',
	type: 'input',
	validate: value => {
		if (value.length <= 45) {
			return true;
		} else {
			return "Name is too long. Please enter a shorter name (less than 45 characters)";
		}
	}
};

const shortNameQuestion = {
	default: () => process.cwd().split(path.sep)
		.pop(),
	message: "Enter a short name for your application",
	name: 'shortName',
	type: 'input',
	validate: value => {
		if (value.length <= 12) {
			return true;
		} else {
			return "Short Name is too long. Please enter a shorter name (less than 12 characters)";
		}
	}
};

const descriptionQuestion = {
	message: 'Enter description of you application: ',
	name: 'description',
	type: 'input'
};

const homePageQuestion = {
	default: () => "index.html",
	message: 'What is the name of the home page of your application?',
	name: 'homePage',
	type: 'input'
};

const themeColorQuestion = {
	default: () => "#ffffff",
	message: 'Please enter the theme color of your application.',
	name: 'themeColor',
	type: 'input',
	validate: value => {
		const pattern = /^#(?:[0-9a-fA-F]{3}){1,2}$/i;
		if (pattern.test(value)) {
			return true;
		} else {
			return "Invalid Hex color code. A valid color looks like #de54ef or #abc";
		}
	}
};

const faviconQuestion = {
	message: 'Enter path to your logo (in .svg or .png): ',
	name: 'favPath',
	type: 'input',
	validate: value => {
		if (this.fs.exists(value)) { //eslint-disable-line
			if (value.endsWith(".png") || value.endsWith(".svg")) {
				return true;
			} else {
				return "Favicon can be in .svg or .png only";
			}
		} else {
			return "Given file doesn't exists.";
		}
	}
};

const outputDirQuestion = {
	default: () => './dist',
	message: 'Enter the path to directory where you would like to generate builds: ',
	name: 'outputDir',
	type: 'input'
};

module.exports = {
	descriptionQuestion,
	entryQuestion,
	faviconQuestion,
	homePageQuestion,
	nameQuestion,
	outputDirQuestion,
	shortNameQuestion,
	startUrlQuestion,
	themeColorQuestion
};
