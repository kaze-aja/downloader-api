const TiktokService = require('./../../services/api/tiktok.service');

module.exports = class TiktokController {
    static async index(req, res) {
        await TiktokService.info(req, res);
    }
    static async store(req, res) {
        await TiktokService.store(req, res);
    }
};
