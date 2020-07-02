import {ApiResponse} from "./ApiResponse";
import {Response} from "express";

export class ApiResponseBuilder {

  private apiResponse: ApiResponse;
  private response: Response | undefined;
  private httpCode: number;

  static createError(code: number, error: string, response?: Response): ApiResponseBuilder {
    return new ApiResponseBuilder(code, "", false, error, response);
  }

  static createSuccess(data: any, response?: Response): ApiResponseBuilder {
    return new ApiResponseBuilder("", data, true, "", response);
  }

  private constructor(code: string | number, data: any, success: boolean, error: string, response?: Response) {
    this.apiResponse = {
      code: code,
      data: (data) ? data : "",
      success: success,
      error: error
    };
    if (response) {
      this.response = response;
    }
    this.httpCode = (success) ? 200 : 201;
  }

  toJson(): ApiResponse {
    return this.apiResponse;
  }

  send(): void {
    if (this.response) {
      this.response.status(this.httpCode).json(this.toJson());
    }
  }
}