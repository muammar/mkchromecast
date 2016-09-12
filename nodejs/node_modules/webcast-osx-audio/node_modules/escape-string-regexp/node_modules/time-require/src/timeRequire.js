/**
 * timeRequire - measure the time to load all the subsequnt modules by hoocking require() calls
 *
 * @author Ciprian Popa (cyparu)
 * @since 0.0.1
 * @version 0.0.1
 */

"use strict";

var // setup vars
		requireData = [],
		write = process.stdout.write.bind(process.stdout),
		relative = require("path").relative,
		cwd = process.cwd(),
		// require hooker should be first module loaded so all the other requires should count as well
		/* jshint -W003 */
		hook = require("./requireHook")(_hooker),
		table = require("text-table"),
		dateTime = require("date-time"),
		prettyMs = require("pretty-ms"),
		chalk = require("chalk"),
		// extra locals
		DEFAULT_COLUMNS = 80,
		BAR_CHAR = process.platform === "win32" ? "■" : "▇",
		sorted = hasArg("--sorted") || hasArg("--s"),
		treshold = (hasArg("--verbose") || hasArg("--V")) ? 0.0: 0.01, // TODO - configure treshold using CLI ?
		EXTRA_COLUMNS = sorted ? 24 : 20;

function hasArg(arg) {
	return process.argv.indexOf(arg) !== -1;
}

function pad(count, seq) {
	return (count > 1) ? new Array(count).join(seq) : "";
}

function log(str) {
	write(str + "\n", "utf8");
}

/**
 * Callback/listener used by requireHook hook to collect all the modules in their loading order
 */
function _hooker(data) {
	var filename = relative(cwd, data.filename);
	// use the shortest name
	if (filename.length > data.filename) {
		filename = data.filename;
	}
	requireData.push({
		order: requireData.length, // loading order
		time: data.startedIn, // time
		label: data.name + " (" + filename + ")"
//		name: data.name,
//		filename: filename
	});
}

function formatTable(tableData, totalTime) {
	var NAME_FILE_REX = /(.+)( \(.+\))/,
			maxColumns = process.stdout.columns || DEFAULT_COLUMNS,
			validCount = 0,
			longestRequire = tableData.reduce(function(acc, data) {
				var avg = data.time / totalTime;
				if (avg < treshold) {
					return acc;
				}
				validCount++;
				return Math.max(acc, data.label.length);
			}, 0),
			maxBarWidth = (longestRequire > maxColumns / 2) ? ((maxColumns - EXTRA_COLUMNS) / 2) : (maxColumns - (longestRequire + EXTRA_COLUMNS)),
			processedTableData = [],
			counter, maxOrderChars;

	function shorten(name) {
		var nameLength = name.length,
				partLength, start, end;
		if (name.length < maxBarWidth) {
			return name;
		}
		partLength = Math.floor((maxBarWidth - 3) / 2);
		start = name.substr(0, partLength + 1);
		end = name.substr(nameLength - partLength);
		return start.trim() + "..." + end.trim();
	}

	function createBar(percentage) {
		var rounded = Math.round(percentage * 100);
		return ((rounded === 0) ? "0" : (pad(Math.ceil(maxBarWidth * percentage) + 1, BAR_CHAR) + " " + rounded)) + "%";
	}

	// sort the data if needed
	if (sorted) {
		tableData.sort(function(e1, e2) {
			return e2.time - e1.time;
		});
	}
	// initialize the counter
	counter = 1;
	// get num ber of chars for padding
	maxOrderChars = tableData.length.toString().length;
	// push the header
	processedTableData.push(["#" + (sorted ? " [order]" : ""), "module", "time", "%"]);
	tableData.forEach(function(data) {
		var avg = data.time / totalTime,
				counterLabel, label, match;
		// slect just data over the threshold
		if (avg >= treshold) {
			counterLabel = counter++;
			// for sorted collumns show the order loading with padding
			if (sorted) {
				counterLabel += pad(maxOrderChars - data.order.toString().length + 1, " ") + " [" + data.order + "]";
			}
			label = shorten(data.label);
			match = label.match(NAME_FILE_REX);
			if (match) {
				label = chalk.green(match[1]) + match[2];
			}
			processedTableData.push([counterLabel, label, chalk.yellow(prettyMs(data.time)), chalk.blue(createBar(avg))]);
		}
	});

	return table(processedTableData, {
		align: ["r", "l", "r", "l"],
		stringLength: function(str) {
			return chalk.stripColor(str).length;
		}
	});
}

// hook process exit to display the report at the end
process.once("exit", function() {
	var startTime = hook.hookedAt,
			totalTime = Date.now() - startTime.getTime();
	log("\n\n" + chalk.underline("Start time: " + chalk.yellow("(" + dateTime(startTime) + ")") + " [treshold=" + (treshold * 100) + "%" + (sorted ? ",sorted" : "") + "]"));
	log(formatTable(requireData, totalTime));
	log(chalk.bold.blue("Total require(): ") + chalk.yellow(requireData.length));
	log(chalk.bold.blue("Total time: ") + chalk.yellow(prettyMs(totalTime)));
});
