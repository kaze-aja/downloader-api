const YtdlService = require('./../../services/api/ytdl.service');

module.exports = class YtdlController {
    static async store(req, res) {
        await YtdlService.store(req, res);
    }
};
