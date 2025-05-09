import Comment from '../model/Comment';
import Post from '../model/Post';
import SimpleTag from '../model/SimpleTag';
import Tag from '../model/Tag';
import AppCache from './AppCache';

export default class APIHandler {
  private static postURL: string =
    'https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&limit=50&tags=';
  private static tagURL: string = 'https://api.rule34.xxx/index.php?page=dapi&s=tag&q=index&name=';
  private static autocompleteURL: string = 'https://api.rule34.xxx/autocomplete.php?q=';
  private static commentURL: string =
    'https://api.rule34.xxx/index.php?page=dapi&s=comment&q=index&post_id=';

  private abortController: AbortController;
  private appCache: AppCache;

  constructor() {
    this.appCache = new AppCache();
    this.abortController = new AbortController();
  }

  public getAppCache(): AppCache {
    return this.appCache.clone();
  }

  private async fetch(url: string): Promise<Response> {
    return fetch(url, { signal: this.abortController.signal });
  }

  public async getPosts(tags: Tag[], excludedTags: Tag[], page?: number): Promise<Post[]> {
    const tagString: string = `${tags.length > 0 ? '+' : ''}${tags.map(tag => tag.name).join('+')}${excludedTags.length > 0 ? '+-' : ''}${excludedTags.map(tag => tag.name).join('+-')}`;
    const raw = await this.fetch(`${APIHandler.postURL + tagString}&pid=${page ?? 0}`);
    try {
      const json = await raw.json();
      // Find better solution for filtering missing posts, which shouldn't ever happen.
      const posts = (json.map((t: object) => new Post(t)) as Post[]).filter(
        t => new URL(t.file_url).pathname !== '/images//',
      );
      return posts;
    } catch {
      return [];
    }
  }

  public async getPostCount(tags: Tag[], excludedTags: Tag[]): Promise<number> {
    const tagString: string = `${tags.length > 0 ? '+' : ''}${tags.map(tag => tag.name).join('+')}${excludedTags.length > 0 ? '+-' : ''}${excludedTags.map(tag => tag.name).join('+-')}`;
    try {
      const raw = await this.fetch(APIHandler.postURL.replace('&json=1', '') + tagString);
      const elmt = document.createElement('div');
      const text = await raw.text();
      elmt.innerHTML = text;

      return Number(elmt.querySelector('posts')?.getAttribute('count') ?? 0);
    } catch {
      return 0;
    }
  }

  public addTagsToCache(...tags: Tag[]) {
    tags.forEach(tag => {
      if (!this.appCache.tagCache.find(t => Number(t.id) === Number(tag.id))) {
        this.appCache.addTag(tag);
      }
    });
  }

  public canAbort() {
    return this.abortController.signal.aborted;
  }

  public abort() {
    this.abortController.abort();
    //this.abortController = new AbortController();
  }

  public async getTag(value: string): Promise<Tag | undefined> {
    const find = this.appCache.tagCache.find(t => t.name === value);
    if (find) {
      return find;
    }

    const raw = await fetch(APIHandler.tagURL + encodeURIComponent(value));
    const json = await raw.text();
    const elmt = document.createElement('div');
    elmt.innerHTML = json;

    const tagXml = elmt.querySelector('tag');
    if (!tagXml || tagXml.getAttribute('type') === 'array') {
      return undefined;
    }

    const result = Tag.fromHTML(tagXml as HTMLElement);
    return result;
  }

  public async getAutocomplete(value: string): Promise<Tag[]> {
    const raw = await fetch(APIHandler.autocompleteURL + encodeURIComponent(value));
    const json = await raw.json();
    const simpleTags = json as SimpleTag[];
    const found = [] as Tag[];

    for (const stag of simpleTags) {
      const tag = this.appCache.tagCache.find(t => {
        return decodeURIComponent(t.name) === decodeURIComponent(stag.value);
      });

      if (tag) {
        found.push(tag);
      } else {
        const res = await fetch(APIHandler.tagURL + encodeURIComponent(stag.value));
        const xml = await res.text();
        const elmt = document.createElement('div');
        elmt.innerHTML = xml;
        found.push(Tag.fromHTML(elmt.querySelector('tag') ?? document.createElement('tag')));
      }
    }

    this.addTagsToCache(...found);
    return found;
  }

  public async getComments(id: number): Promise<Comment[]> {
    const raw = await fetch(APIHandler.commentURL + id);
    const xml = await raw.text();
    const elmt = document.createElement('div');
    elmt.innerHTML = xml;
    return Array.from(elmt.querySelectorAll('comment')).map(t => Comment.fromXML(t as HTMLElement));
  }
}
