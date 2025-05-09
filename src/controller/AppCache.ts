import Tag from '../model/Tag';

export default class AppCache {
  constructor(
    public tagCache: Tag[] = (
      JSON.parse(sessionStorage.getItem('cached_tags') ?? '[]') as never[]
    ).map(t => Tag.fromObject(t)),
  ) {}

  public addTag(tag: Tag): void {
    this.tagCache.push(tag);
    sessionStorage.setItem('cached_tags', JSON.stringify(this.tagCache));
  }

  public clone(): AppCache {
    return new AppCache(this.tagCache);
  }
}
