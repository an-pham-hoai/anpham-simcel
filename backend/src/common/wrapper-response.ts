export interface ErrorResponse {
    code: string;
    message: string;
  }
  
  export interface WrapperResponse<T> {
    success: boolean;
    error?: ErrorResponse;
    data?: T;
  }
  
  export function successResponse<T>(data: T): WrapperResponse<T> {
    return {
      success: true,
      data,
      error: null,
    };
  }
  
  export function errorResponse(code: string, message: string): WrapperResponse<null> {
    return {
      success: false,
      error: {
        code,
        message,
      },
      data: null,
    };
  }
  