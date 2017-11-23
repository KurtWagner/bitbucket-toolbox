module.exports = {
	"env": {
		"es6": true,
		"node": true,
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"ecmaVersion": 6,
		"sourceType": "script",
	},
	"globals": {
		"it": true,
		"describe": true,
		"beforeEach": true,
		"afterEach": true,
	},
	"rules": {
		// tabs over spaces
		"indent": [
			"error",
			"tab",
			{
				"SwitchCase": 1,
			},
		],
		// \n instead of \r\n
		"linebreak-style": ["error", "unix"],
		// semicolons must be used any place where they are valid.
		"semi": ["error", "always" ],
		/**
		 * Opening brace of a block is placed on the same line as its corresponding 
		 * statement or declaration but allow the opening and closing braces for 
		 * a block to be on the same line (allowSingleLine).
		 */
		"brace-style": ["error", "1tbs", { "allowSingleLine": true }],
		/**
		 * The no-mixed-spaces-and-tabs rule is aimed at flagging any lines of code 
		 * that are indented with a mixture of tabs and spaces. This option suppresses 
		 * warnings about mixed tabs and spaces when the latter are used for alignment 
		 * only.
		 */
		"no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
		
		// We want single quotes but allow backticks
		"quotes": ["error", "single", { 
			"avoidEscape": true,
			"allowTemplateLiterals": true,
		}],
		
		/**
		 * Disallow unnecessary concatenation of strings. e.g, 'a' + 'b' should just
		 * be 'ab'
		 */
		"no-useless-concat": ["error"],
		
		/**
		 * As we use ES6 we prefer you use template strings for templates instead
		 * of concatenation.
		 */
		"prefer-template": ["error"],
		
		/**
		 * Typing mistakes and misunderstandings about where semicolons are required 
		 * can lead to semicolons that are unnecessary. While not technically an 
		 * error, extra semicolons can cause confusion when reading code.
		 */
		"no-extra-semi": ["error"],

		/**
		 * This usually occurs when a variable was used before, but no longer necessary.
		 * While not technically an error, these are areas for cleaning up 
		 * to make the code clean.
		 */
		"no-unused-vars": ["error"],
	
		
		/**
		 * A strict mode directive at the beginning of a script or function body 
		 * enables strict mode semantics. Safe = require "use strict" in function 
		 * scopes only.
		 */
		"strict": ["error", "global"],
		
		/**
		 * In JavaScript that is designed to be executed in the browser, it’s considered 
		 * a best practice to avoid using methods on console. Such messages are 
		 * considered to be for debugging purposes and therefore not suitable to 
		 * ship to the client. In general, calls using console should be stripped 
		 * before being pushed to production. "allow" has an array of strings 
		 * which are allowed methods of the console object
		 */
		"no-console": ["error", { "allow": ["warn", "error", "log"] }],
		
		/**
		 * Sparse arrays contain empty slots, most frequently due to multiple commas 
		 * being used in an array literal
		 */
		"no-sparse-arrays": ["error"],
		
		/**
		 * The with statement is potentially problematic because it adds members 
		 * of an object to the current scope, making it impossible to tell what 
		 * a variable inside the block actually refers to.
		 */
		"no-with": ["error"],
		
		/**
		 * Shadowing is the process by which a local variable shares the same name 
		 * as a variable in its containing scope. It creates confusion.
		 */
		"no-shadow": ["error"],
		
		// enforce space between key words, such as if and else.
		"keyword-spacing": ["error"],
		
		/**
		 * Multiple properties with the same key in object literals can cause 
		 * unexpected behavior in your application.
		 */
		"no-dupe-keys": ["error"],
	}
};
