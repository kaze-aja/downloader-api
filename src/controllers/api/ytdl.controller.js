const YtdlService = require('./../../services/api/ytdl.service');

module.exports = class YtdlController {
    static async index(req, res) {
        await YtdlService.index(req, res);
    }
    static async store(req, res) {
        await YtdlService.store(req, res);
    }
    static async search(req, res) {
        await YtdlService.search(req, res);
    }
};
