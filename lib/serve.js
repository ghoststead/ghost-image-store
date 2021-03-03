const express = require('express');
const moment = require('moment');
const constants = require('@tryghost/constants');
const errors = require('@tryghost/errors');

/**
 * For some reason send divides the max age number by 1000
 * Fallthrough: false ensures that if an image isn't found, it automatically 404s
 * Wrap server static errors
 *
 * @returns {function(*=, *=, *): any}
 */
function serve() {
    const {storagePath} = this;

    return function serveStaticContent(req, res, next) {
        const startedAtMoment = moment();

        return express.static(
            storagePath,
            {
                maxAge: constants.ONE_YEAR_MS,
                fallthrough: false,
                onEnd: /* istanbul ignore next */ () => {
                    console.log('gs.serve', req.path, `${moment().diff(startedAtMoment, 'ms')}ms`);
                }
            }
        )(req, res, (err) => {
            if (err) {
                if (err.statusCode === 404) {
                    return next(new errors.NotFoundError({
                        message: 'Image not found',
                        code: 'STATIC_FILE_NOT_FOUND',
                        property: err.path
                    }));
                }

                if (err.statusCode === 400) {
                    return next(new errors.BadRequestError({err: err}));
                }

                if (err.statusCode === 403) {
                    return next(new errors.NoPermissionError({err: err}));
                }

                return next(new errors.GhostError({err: err}));
            }

            next();
        });
    };
}

module.exports = function (Store) {
    Object.assign(Store.prototype, {
        serve
    });
};
