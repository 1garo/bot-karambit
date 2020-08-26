import {injectable} from "inversify";

@injectable()
export class PingFinder {
  private regexp = 'ping';

  public isPing(strToSearch: string): boolean {
    return strToSearch.search(this.regexp) >= 0;
  }
}
