const TiktokService = require('./../../services/api/tiktok.service');

module.exports = class TiktokController {
    static async store(req, res) {
        await TiktokService.store(req, res);
    }
};
