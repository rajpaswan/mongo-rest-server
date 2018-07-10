const crypto = require('crypto');

let sha512 = new function () {

    /**
     * generates salt of required length.
     * @function
     * @param {number} length - length of the salt.
     */
    this.salt = function (length) {
        return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    };

    /**
     * hash text with sha512.
     * @function
     * @param {string} text - text to be hashed.
     * @param {string} salt - salt to be used for hashing.
     */
    this.digest = function (text, salt) {
        if (!text) return null;
        let hash = crypto.createHmac('sha512', salt);
        hash.update(text);
        let digest = hash.digest('hex');
        return digest;
    };
}

module.exports = sha512;