# Express Errors

A centralized error handling library for Express.

## Installation

Use your preferred Node package manager to install this library in your project.

```bash
pnpm i @pronghorn-software/express-errors
```

## Usage

Wherever you would throw an error, try to throw an `HttpError` instead.

More importantly, make sure you install an error handler in your top-level `express` object with `createGlobalErrorHandler` *after your routes are added*. If you want to catch `async` errors, make sure you are using Express 5+.

## Motivation

Some sources recommend handing errors right where they're created, while others recommend they be treated as cross-cutting concerns that are handled in a centralized and consistent manner.

The "correct" answer is probably somewhere in the middle, especially for Express applications: If you're going to recover from or post-process the error, it should probably be handled locally. Otherwise, you are more likely to get a consistent client experience if you kick the error to a centralized handler that (1) makes sure you didn't forget to handle it, and (2) formats it consistently for the client.

## Future Plans

I'm not convinced that handling [problem details](https://datatracker.ietf.org/doc/html/rfc9457) and custom-formatted errors in the same pathway is the right choice. It's convenient to implement, but it will probably (definitely) lead to an inconsistent experience for the client. Something to deal with before we hit v1.0 ...

## License

[MIT](https://choosealicense.com/licenses/mit/)