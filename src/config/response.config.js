const Response = {
    success: function(code, json, message){
        var response = {
            code,
            status: 'success',
            data: json
        }

        if (message) {
            response['message'] = message
        }

        return {...response}
    },
    error: function(code, message) {
        return {
            code,
            status: 'error',
            message
        }
    }
}

module.exports = Response