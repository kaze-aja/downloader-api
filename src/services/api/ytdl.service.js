const { validations } = require('./../../config/validations.config.js');
const Response = require('./../../config/response.config.js');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

/**
 * Ytdl Services
 */
const YtdlService = {
    response: [],
    index: async function (request, response) {
        try {
            // request body validations
            let { url } = await validations(request, response, { location: 'body' });

            // get all video info
            let info = await ytdl.getInfo(url);
            let formats = info.formats.filter((format) => format.container === 'mp4' && format.hasVideo === true && format.hasAudio === true);
            let { title, description, author, video_url, thumbnails } = info.videoDetails;

            // add filtered formats to response
            this.response = { title, description, author, video_url, thumbnails, formats };

            // return response
            return response.status(200).json(Response.success(200, this.response, 'Successfully get all available video formats'));
        } catch (error) {
            if (request.app.get('env') === 'development') {
                if (typeof error === 'object') {
                    return response.status(403).json(Response.error(403, error));
                } else {
                    return response.status(500).json(Response.error(500, String(error)));
                }
            } else {
                return response.status(500).json(Response.error(500, 'Server error.'));
            }
        }
    },
    store: async function (request, response) {
        try {
            // request body validations
            let { url } = await validations(request, response, { location: 'body' });

            // get video info
            let info = await ytdl.getInfo(url);

            // add video info to response
            let { title, description, author, video_url, length_seconds, thumbnails, view_count } = info.videoDetails;
            this.response = { title, description, author, video_url, length_seconds, thumbnails, view_count };

            // define file properties
            let fileName = `${uuidv4()}.mp4`; // Generate a UUID file name
            let dirname = process.cwd() + '/public/tmp/ytdl/';
            let filePath = path.join(dirname, fileName);

            // add fileUrl to response
            this.response.fileUrl = `${process.env.APP_HOST}/tmp/ytdl/${fileName}`;

            // download video
            console.log('Downloading video from :', video_url);

            // write stream to file
            ytdl(video_url, { filter: (format) => format.contentLength })
                .pipe(fs.createWriteStream(filePath))
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

module.exports = YtdlService;
