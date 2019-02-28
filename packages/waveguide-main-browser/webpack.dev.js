const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
/*
 * SplitChunksPlugin is enabled by default and replaced
 * deprecated CommonsChunkPlugin. It automatically identifies modules which
 * should be splitted of chunk by heuristics using module duplication count and
 * module category (i. e. node_modules). And splits the chunks…
 *
 * It is safe to remove "splitChunks" from the generated configuration
 * and was added as an educational example.
 *
 * https://webpack.js.org/plugins/split-chunks-plugin/
 *
 */

/*
 * We've enabled UglifyJSPlugin for you! This minifies your app
 * in order to load faster and run less javascript.
 *
 * https://github.com/webpack-contrib/uglifyjs-webpack-plugin
 *
 */

module.exports = {
	entry: './src/examples/app.ts',
	devtool: 'cheap-module-eval-source-map',
	module: {
		rules: [
			{
				loader: 'ts-loader',
				test: /\.ts$/
			}
		]
	},
	resolve: {
		// Add `.ts` and `.tsx` as a resolvable extension.
		extensions: [".ts", ".tsx", ".js"]
	},
	mode: 'development',
	plugins: [
        new HtmlWebpackPlugin({
            hash: true,
            filename: './index.html' //relative to root of the application
        })
   ]
};
