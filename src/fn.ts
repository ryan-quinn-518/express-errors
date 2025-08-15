///////////////////////////////////////////////////////////////////////////////
// 3PP Imports
///////////////////////////////////////////////////////////////////////////////
import type { NextFunction, Request, Response } from "express";

import { status as httpStatusMessages } from "http-status";

///////////////////////////////////////////////////////////////////////////////
// Local Imports
///////////////////////////////////////////////////////////////////////////////
import {
    HttpError,
    type HttpErrorName,
    type HttpErrorFmt,
} from "./types.js";

///////////////////////////////////////////////////////////////////////////////
// Helpers
///////////////////////////////////////////////////////////////////////////////
function httpErrorStatusCode( errorName: HttpErrorName ) {
    switch(errorName) {
        case "badRequest": return 400;
        case "unauthorized": return 401;
        case "forbidden": return 403;
        case "notFound": return 404;
        case "methodNotAllowed": return 405;
        case "notAcceptable": return 406;
        case "conflict": return 409;
        case "gone": return 410;
        case "payloadTooLarge": return 413;
        case "uriTooLong": return 414;
        case "unsupportedcontentType": return 415;
        case "unprocessableContent": return 422;
        case "unavailableForLegalReasons": return 451;

        case "internalServerError": return 500;
        case "notImplemented": return 501;
        case "badGateway": return 502;
        case "serviceUnavailable": return 503;
        case "httpVersionNotSupported": return 505;

        default: return 500;
    }
}

function processHttpError( err: HttpError ): HttpErrorFmt {
    const status = httpErrorStatusCode( err.errorName );

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const status_message = httpStatusMessages[`${status}_MESSAGE`];

    let jsonBody = {};
    let contentType: string | null = null;

    if( err.problemDetails ) {
        jsonBody = {
            ...err.problemDetails,
            type: err.problemDetails.type ?? "about:blank",
            title: err.problemDetails.title ?? status_message,
            status,
        };
        contentType = "application/problem+json";
    } else {
        jsonBody = {
            errorId: err.errorId,
            errorName: err.errorName,
            message: err.message,

            status,
            description: status_message,
        };
    }

    return {
        status,
        jsonBody,
        contentType,
    }
}

///////////////////////////////////////////////////////////////////////////////
// Exports
///////////////////////////////////////////////////////////////////////////////
export function createGlobalErrorHandler(
    logging_fn?: (message?: any) => void,
) {
    return (err: any, _req: Request, res: Response, _next: NextFunction) => {
        if( logging_fn ) {
            logging_fn(err);
        }

        const httpErr = err instanceof HttpError ? err : new HttpError("internalServerError", (err as Error).message);

        const {
            status,
            jsonBody,
            contentType,
        } = processHttpError(httpErr);

        if( contentType ) {
            res.setHeader( "content-type", contentType );
        }

        return res.status(status).json(jsonBody);
    }
}
