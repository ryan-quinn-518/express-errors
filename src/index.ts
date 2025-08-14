import { randomUUID } from "node:crypto";

import type { NextFunction, Request, Response } from "express";
import express from "express";

export type ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => void;


export const HTTP_ERROR_NAMES = [
    // Common 4XX errors
    "badRequest",
    "unauthorized",
    "forbidden",
    "notFound",
    "methodNotAllowed",
    "notAcceptable",
    "conflict",
    "gone",
    "payloadTooLarge",
    "uriTooLong",
    "unsupportedMediaType",
    "unprocessableContent",
    "unavailableForLegalReasons",

    // Common 5XX errors
    "internalServerError",
    "notImplemented",
    "badGateway",
    "serviceUnavailable",
    "httpVersionNotSupported",
] as const;
export type HttpErrorName = typeof HTTP_ERROR_NAMES[number];


export interface HttpError {
    errorId: string,
    errorName: HttpErrorName,
    message?: string,
    stack?: string,

    // Other stuff in specific errors
    [key:string]: any,
}


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
        case "unsupportedMediaType": return 415;
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


function createHttpError( errorName: HttpErrorName, message?: string, originalError?: Error ): HttpError {
    return {
        errorId: randomUUID().toString(),
        errorName,
        message: message || originalError?.message,
        stack: originalError?.stack || new Error().stack,

        ...(originalError || {}),
    }
}


export function createGlobalErrorHandler(
    logging_fn?: (message?: any) => void,
) {
    return (err: any, req: Request, res: Response, next: NextFunction) => {
        if( logging_fn ) {
            logging_fn(err);
        }

        const status_code = httpErrorStatusCode(err["errorName"])

        return res.status(status_code).json({
            status_code,
            errorName: err.errorName,

        });
    }
}



const app = express();
app.get("/", () => { throw createHttpError("badRequest", "Dosn't work!"); } );
app.use(createGlobalErrorHandler(console.log));

app.listen(3000);
