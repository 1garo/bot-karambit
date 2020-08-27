import {injectable} from "inversify";

@injectable()
export class MusicPlayFinder {
  private regexp = '!play';

  public isPlayMusic(strToSearch: string): boolean {
    return strToSearch.search(this.regexp) >= 0;
  }
}
