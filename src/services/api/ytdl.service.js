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
            const formats = info.formats.filter(format => format.container === 'mp4' && format.hasVideo && format.hasAudio);
            const { title, description, author, video_url, thumbnails } = info.videoDetails;

            // add filtered formats to response
            this.response = { title, description, author, video_url, thumbnails, formats };

            // return response
            return response.status(200).json(Response.success(200, this.response, 'Successfully retrieved all available video formats'));
        } catch (error) {
            return this.handleError(error, response);
        }
    },

    store: async function (request, response) {
        try {
            // request body validations
            const { url } = await validations(request, response, { location: 'body' });

            // get video info
            const info = await ytdl.getInfo(url);
            const { title, description, author, video_url, length_seconds, thumbnails, view_count } = info.videoDetails;

            // define file properties
            const fileName = `${uuidv4()}.mp4`; // Generate a UUID file name
            const dirname = path.join(process.cwd(), 'public', 'tmp', 'ytdl');
            const filePath = path.join(dirname, fileName);

            // add video info and file URL to response
            this.response = {
                title,
                description,
                author,
                video_url,
                length_seconds,
                thumbnails,
                view_count,
                fileUrl: `${APP_URL}/tmp/ytdl/${fileName}`
            };

            // download video
            console.log('Downloading video from:', video_url);

            // write stream to file
            ytdl(video_url, { filter: format => format.contentLength })
                .pipe(fs.createWriteStream(filePath))
                .on('finish', () => {
                    console.log('Finished downloading video');
                    return response.status(200).json(Response.success(200, this.response, 'Successfully downloaded video'));
                })
                .on('error', err => {
                    console.error(`Error downloading video: ${err}`);
                    return response.status(500).json(Response.error(500, 'Error downloading video'));
                })
                .on('close', () => {
                    console.log('Closed downloading video');

                    // auto delete after 60 seconds
                    setTimeout(() => {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.error(`Error deleting video file: ${err}`);
                            } else {
                                console.log('Deleted video file:', filePath);
                            }
                        });
                    }, 60_000);
                });
        } catch (error) {
            return this.handleError(error, response);
        }
    },

    handleError: function (error, response) {
        if (IS_DEV) {
            if (typeof error === 'object') {
                return response.status(403).json(Response.error(403, error));
            }
            return response.status(500).json(Response.error(500, String(error)));
        }
        return response.status(500).json(Response.error(500, 'Server error.'));
    },

    search: async function (request, response) {
        const { query } = request.query; 
        try {
            const results = await ytdl.search(query); 
            return response.status(200).json(Response.success(200, results, 'Search results'));
        } catch (error) {
            return response.status(500).json(Response.error(500, 'Server error.'));
        }
    }
};

module.exports = YtdlService;
