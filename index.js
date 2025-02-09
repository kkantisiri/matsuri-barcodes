const crypto = require("node:crypto");
const express = require('express');
const web = express();
const port = process.env.PORT || 3000;

/**
 * Returns a hex string of defined size
 * 
 * @param {int} size     Generates a hex string of some defined size
 * @returns {string}     Hex String
 */
function generateHexString(size) {
    return crypto.randomBytes(size).toString('hex').toUpperCase();
}

/** 
 * Create a barcode array, but have options in case you want the same barcode repeated X amount of times.
 *
 * @param {int} size            Byte Size of Hex String
 * @param {...int} counter    The amount of unique values for that (index + 1)
 * @return {string[]}              Final array
 * 
 * Example:
 * (4, 4, 1, 1) - Returns an array of [UNIQUE1, UNIQUE2, UNIQUE3, UNIQUE4, UNIQUE5, UNIQUE5, UNIQUE6, UNIQUE6, UNIQUE6]
 *                Notice the Unique 5 repeating twice, and Unique 6 repeating three times.
 * (4, 1, 1, 1) - Returns an array of [UNIQUE1, UNIQUE2, UNIQUE2, UNIQUE3, UNIQUE3, UNIQUE3]
 */
function generateBarcodeArray(size, ...counter) {
    var storage = [];

    for (let i = 0; i < counter.length; i++) {
        for (let j = 0; j < counter[i]; j++) {
            var hexString = generateHexString(size);
            for (let k = 0; k < i + 1; k++) {
                storage.push(hexString)
            }
        }
    }

    return storage
}

// generate express
web.get('/generate', (req, res) => {
    let {size, counter} = req.query;

    if (size == undefined || counter == undefined) {
        res.redirect('/');
    }

    res.set({
        'Content-Disposition': `attachment; filename="output.csv"`,
        'Content-type': 'text/csv'
    });

    try {
        res.send(generateBarcodeArray(parseInt(size), ...counter.split(",")).join("\n"))
    } catch (err) {
        res.redirect('/');
    }
})

// fallback express
web.get('*', (req, res) => {
    res.send(`Error: Please use the format <b>${req.protocol}://${req.get("host")}/generate?size=[SIZE]&counter=[SINGLES,DOUBLES,TRIPLES]</b>`)
    res.status(404).end();
});

// start express web server
web.listen(port, () => {
    console.log(`Matsuri Barcode Generator App Running on port ${port}`)
})