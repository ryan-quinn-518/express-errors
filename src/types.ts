///////////////////////////////////////////////////////////////////////////////
// Node Imports
///////////////////////////////////////////////////////////////////////////////
import { randomUUID as uuidv4 } from "node:crypto";

///////////////////////////////////////////////////////////////////////////////
// Constants
///////////////////////////////////////////////////////////////////////////////
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
    "unsupportedcontentType",
    "unprocessableContent",
    "unavailableForLegalReasons",

    // Common 5XX errors
    "internalServerError",
    "notImplemented",
    "badGateway",
    "serviceUnavailable",
    "httpVersionNotSupported",
] as const;

///////////////////////////////////////////////////////////////////////////////
// Types and Interfaces
///////////////////////////////////////////////////////////////////////////////
export type HttpErrorName = typeof HTTP_ERROR_NAMES[number];

// https://datatracker.ietf.org/doc/html/rfc9457
export interface ProblemDetails {
    type?: string,
    status?: number,
    title?: string,
    description?: string,

    [key: string]: any,
}

export interface HttpErrorFmt {
    status: number,
    jsonBody: Record<string, any>,
    contentType: string | null,
}

///////////////////////////////////////////////////////////////////////////////
// Classes
///////////////////////////////////////////////////////////////////////////////
export class HttpError extends Error {
    errorName: HttpErrorName;
    problemDetails: ProblemDetails | null;
    errorId: string;

    constructor(
        errorName: HttpErrorName,
        message?: string | null,
        problemDetails?: ProblemDetails,
        errorId?: string,
    ) {
        super(message ?? undefined);

        this.errorName = errorName;
        this.problemDetails = problemDetails ?? null;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
        this.errorId = errorId ?? uuidv4().toString();
    }
}
