const { validationResult, matchedData } = require('express-validator')

const validations = function(req, res, { location }) {
    let errors = validationResult(req).formatWith(({ msg }) => {
        return `${msg}`
    })

    return new Promise((resolve, reject) => {
        if (!errors.isEmpty()) {
            reject({
                errors: errors.mapped(),
            })
        } else {
            let data = matchedData(req, { locations: [location] })
            resolve(data)
        }
    })
}

module.exports = { validations }