/* eslint-disable no-undef */
module.exports = {
	"env": {
		"browser": false,
		"es2020": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"sourceType": "module",
		"ecmaVersion": 10
	},
	"rules": {
		"no-prototype-builtins": "off",
		"indent": [
			"error",
			"tab",
			{
				"SwitchCase": 1,
			},
		],
		//"array-bracket-newline": ["error", { "multiline": true, "minItems": 3 }],
		//"array-element-newline": ["error", { "multiline": true }]
		"array-element-newline": ["error", "consistent"]
	}
};
