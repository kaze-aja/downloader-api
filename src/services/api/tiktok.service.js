const { validations } = require('./../../config/validations.config.js');
const Response = require('./../../config/response.config.js');
const Tiktok = require('@tobyg74/tiktok-api-dl');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
require('dotenv').config();

/**
 * Tiktok Services
 */
const TiktokService = {
    response: [],
    store: async function (request, response) {
        try {
            // request body validations
            let { url } = await validations(request, response, { location: 'body' });

            // get video info
            let video = await Tiktok.Downloader(url, {
                version: 'v2' //  version: "v1" | "v2" | "v3"
            });

            // get video url
            let video_url = video.result.video;

            // add video info to response
            this.response = video;

            //  get video stream
            let response_stream = await axios({
                url: video_url,
                method: 'GET',
                responseType: 'stream'
            });

            // define file properties
            let fileName = `${uuidv4()}.mp4`; // Generate a UUID file name
            let dirname = process.cwd() + '/public/tmp/tiktok/';
            let filePath = path.join(dirname, fileName);

            // make sure the directory exists
            let writer = fs.createWriteStream(filePath);

            // add fileUrl to response
            this.response.fileUrl = `${process.env.APP_HOST}/tmp/tiktok/${fileName}`;

            // download video
            console.log('Downloading video from :', url);

            // write stream to file
            response_stream.data
                .pipe(writer)
                .on('finish', () => {
                    console.log('Finished downloading video');
                    return response.status(200).json(Response.success(200, this.response, 'Successfully download video'));
                })
                .on('error', (err) => {
                    console.error(`Error downloading video: ${err}`);
                    return response.status(500).json(Response.error(500, 'Error downloading video'));
                })
                .on('close', () => {
                    console.log('Closed downloading video');

                    // make it auto delete after 60 seconds
                    setTimeout(() => {
                        fs.unlinkSync(filePath);
                        console.log('Deleted video file :', filePath);
                    }, 60_000);
                });
        } catch (error) {
            if (request.app.get('env') === 'development') {
                if (typeof error === 'object') {
                    console.log(error);
                    return response.status(403).json(Response.error(403, error));
                } else {
                    return response.status(500).json(Response.error(500, String(error)));
                }
            } else {
                return response.status(500).json(Response.error(500, 'Server error.'));
            }
        }
    }
};

module.exports = TiktokService;
