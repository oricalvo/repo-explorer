import * as request from "request";

export interface HttpRequest {
    method: string;
    url: string;
    headers: {[key: string]: string};
}

export interface HttpResponse {
    statusCode: number;
    body: any;
    headers: {[key: string]: string};
}

export function http(options: HttpRequest): Promise<HttpResponse> {
    return new Promise(function(resolve, reject) {
        request({
            ... options,
            callback: function (error: any, response: request.RequestResponse, body: any) {
                if (error) {
                    reject(error);
                    return;
                }

                resolve({
                    statusCode: response.statusCode,
                    body: response.body,
                    headers: response.headers,
                } as HttpResponse);
            }
        });
    });
}

export function atob(str) {
    return new Buffer(str).toString('base64');
}

export function btoa(str) {
    return new Buffer(str, "base64").toString();
}
