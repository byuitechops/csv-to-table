/*eslint-env node*/
/*eslint no-console:0*/
var dsv = require('d3-dsv'),
    Handlebars = require('handlebars'),
    fs = require('fs'),
    path = require('path'),
    open = require('open'),
    templateFileName = 'template.handlebars',
    htmlString;

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

function readFile(name) {
    var file = '';
    file = fs.readFileSync(name, 'utf8');
    return file;

}

function getTemplate() {
    var fileName = path.join(__dirname, templateFileName)
    return readFile(fileName);
}

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



function makeReportFromCSVString(csvString, noLinks, noBrowser, title) {
    var csvData;

    // d3-dsv expects the csv string to end with a new line, add a \n if needed
    if (csvString[csvString.length - 2] !== '\n') {
        csvString += '\n';
    }

    csvData = dsv.csvParse(csvString);
    
    makeReportFromArray(csvData, csvData.columns, noLinks, noBrowser, title)
}

function makeReportFromArray(csvData, columnsArray, noLinks, noBrowser, title) {
    //d3-dsv adds a bunch of properties to the data array when it parses a string, this map rips them off
    csvData = csvData.map(function (row) {
        // This loop goes through each cell and replace urls in strings with a clickable URL via <a> tag
        if (!noLinks) {
            for (var key in row) {
                if (typeof row[key] === "string") {
                    // the code for first parameter was taken from regexr.com
                    row[key] = row[key].replace(/(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g, "<a href='$&' target='_blank'>$&</a>")
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
