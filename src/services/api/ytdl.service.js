const { validations } = require('./../../config/validations.config.js');
const Response = require('./../../config/response.config.js');
const { APP_URL, IS_DEV } = require('./../../config/constants.config.js');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Ytdl Services
 */
const YtdlService = {
    response: [],
    index: async function (request, response) {
        try {
            // request body validations
            const { url } = await validations(request, response, { location: 'body' });

            // get all video info
            const info = await ytdl.getInfo(url);
            const formats = info.formats.filter((format) => format.container === 'mp4' && format.hasVideo && format.hasAudio);
            const { title, description, author, video_url, thumbnails } = info.videoDetails;

            // add filtered formats to response
            this.response = { title, description, author, video_url, thumbnails, formats };

            // return response
            return response.status(200).json(Response.success(200, this.response, 'Successfully get all available video formats'));
        } catch (error) {
            if (IS_DEV) {
                if (typeof error === 'object') {
                    return response.status(403).json(Response.error(403, error));
                }
                return response.status(500).json(Response.error(500, String(error)));
            }
            return response.status(500).json(Response.error(500, 'Server error.'));
        }
    },
    store: async function (request, response) {
        try {
            // request body validations
            const { url } = await validations(request, response, { location: 'body' });

            // get video info
            const info = await ytdl.getInfo(url);

            // add video info to response
            const { title, description, author, video_url, length_seconds, thumbnails, view_count } = info.videoDetails;
            this.response = { title, description, author, video_url, length_seconds, thumbnails, view_count };

            // define file properties
            const fileName = `${uuidv4()}.mp4`; // Generate a UUID file name
            const dirname = process.cwd() + '/public/tmp/ytdl/';
            const filePath = path.join(dirname, fileName);

            // add fileUrl to response
            this.response.fileUrl = `${APP_URL}/tmp/ytdl/${fileName}`;

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
            if (IS_DEV) {
                if (typeof error === 'object') {
                    return response.status(403).json(Response.error(403, error));
                }
                return response.status(500).json(Response.error(500, String(error)));
            }
            return response.status(500).json(Response.error(500, 'Server error.'));
        }
    }
};

module.exports = YtdlService;
