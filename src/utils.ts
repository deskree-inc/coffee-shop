import {AxiosResponse} from "axios";

export function checkForErrors(response: AxiosResponse | null) {
  return response && Object.prototype.hasOwnProperty.call(response, "data") && Object.prototype.hasOwnProperty.call(response.data, "errors") && response.data.errors.length > 0;

}