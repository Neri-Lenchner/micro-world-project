import {StatusCode} from "./enums";

abstract class BaseClientError extends Error {
    constructor(public status: StatusCode, public message: string) {
        super(message);
    }
}

export class RouteNotFound extends BaseClientError {
    constructor(route: string) {
        super(StatusCode.NotFound, "Route " + route + " not found");
    }
}

export class ResourceNotFound extends BaseClientError {
    constructor(id: number | string) {
        super(StatusCode.NotFound, "id " + id + " not found");
    }
}

export class ValidationError extends BaseClientError {
    constructor(message: string) {
        super(StatusCode.BadRequest, message);
    }
}

export class UnauthorizedError extends BaseClientError {
    constructor(message: string) {
        super(StatusCode.Unauthorized, message);
    }
}
