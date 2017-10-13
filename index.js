/*eslint-env node*/
/*eslint no-console:0*/
var dsv = require('d3-dsv'),
    Handlebars = require('handlebars'),
    fs = require('fs'),
    path = require('path'),
    open = require('open'),
    templateFileName = 'template.handlebars',
    htmlString;

/* writes out table of the csv data into an html page and 
opens in the browser (if user didn't use "no browser" option) */
function writeAndOpenHtmlFile(htmlString, htmlFileName, noBrowser) {
    try {
        fs.writeFileSync(htmlFileName, htmlString, 'utf8')
        console.log('Output:', htmlFileName);
        if (!noBrowser) {
            open(htmlFileName);
        }
    } catch (e) {
        console.log(e);
    }
}

// finds and retruns the name of the file
function readFile(name) {
    var file = '';
    file = fs.readFileSync(name, 'utf8');
    return file;

}

// combines paths into one string and returns its name
function getTemplate() {
    var fileName = path.join(__dirname, templateFileName)
    return readFile(fileName);
}


// compiles and runs the template
function runTemplate(csvData, columns, title) {
    //compile the template
    var template = Handlebars.compile(getTemplate());

    //run the template
    htmlString = template({
        title: title,
        columnsJSON: JSON.stringify(columns),
        tableJSON: JSON.stringify(csvData)
    });

}


// this takes the raw data and puts it all together into a nice layout (I think)
function makeReportFromCSVString(csvString, noLinks, noBrowser, title) {
    var csvData;

    // d3-dsv expects the csv string to end with a new line, add a \n if needed
    if (csvString[csvString.length - 2] !== '\n') {
        csvString += '\n';
    }

    csvData = dsv.csvParse(csvString);


    makeReportFromArray(csvData, csvData.columns, noLinks, noBrowser, title);
}

function getReplacement(url) {

    var newHref = url.replace(/(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//= ]*)/g, function (match) {
        //for urls in brightspace that have spaces in them, but avoids putting %20 in an HTML tag
        if (match.includes('brightspace')) {
            match = match.replace(" ", "%20");
        }
        return '<a href="' + match + '" target="_blank">' + match + '</a>';
    })
    return newHref;
}

// makes csv data, mainly the urls, more responsive 
function makeReportFromArray(csvData, columnsArray, noLinks, noBrowser, title) {
    //d3-dsv adds a bunch of properties to the data array when it parses a string, this map rips them off
    csvData = csvData.map(function (row) {

        // This loop goes through each cell and replace urls in strings with a clickable URL via <a> tag
        for (var key in row) {
            // if the user didn't indicate that he doesn't want clickable links
            if (!noLinks) {
                /* looks for any signs of being a url, and if so 
                it wraps it in an <a> tag, making it clickable */
                if (typeof row[key] === "string") {
                    // the code for first parameter was taken from regexr.com
                    row[key] = getReplacement(row[key])
                }
            }
        }
        return row;
    })


    runTemplate(csvData, columnsArray, title);
    writeAndOpenHtmlFile(htmlString, title + '.html', noBrowser);

}

module.exports = {
    fromCSVString: makeReportFromCSVString,
    fromArray: makeReportFromArray
}
