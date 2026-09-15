export enum StatusCode {
    // Success
    OK = 200,
    Created = 201,
    NoContent = 204,

    // Error
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    ServerError = 500,
}

export enum RoleId {
    Admin = 1,
    Student = 2,
    Lecturer = 3,
}
