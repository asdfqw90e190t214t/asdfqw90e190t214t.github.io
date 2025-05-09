import Video from '../view/components/Video';
import APIHandler from '../controller/APIHandler';
import Tag from './Tag';
import Image from '../view/components/Image';
import { ReactNode } from 'react';

export default class Post {
  public change: number = 0;
  public comment_count: number = 0;
  public directory: number = 0;
  public file_url: string = '';
  public has_notes: boolean = false;
  public hash: string = '';
  public height: number = 0;
  public id: number = 0;
  public image: string = '';
  public owner: string = '';
  public parent_id: number = 0;
  public preview_url: string = '';
  public rating: string = '';
  public sample: boolean = false;
  public sample_height: number = 0;
  public sample_url: string = '';
  public sample_width: number = 0;
  public score: number = 0;
  public source: string = '';
  public status: string = '';
  public tags: string = '';
  public width: number = 0;

  constructor(props: Partial<Post>) {
    Object.assign(this, props);
  }

  public decodeHTML(html: string) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  public static decodeHTML(html: string) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return decodeURIComponent(txt.value);
  }

  public getTags(
    api: APIHandler,
    tags: Tag[],
    excludedTags: Tag[],
    handleTag: (tag: Tag | undefined) => void,
  ): ReactNode {
    return (
      <div className="tags" style={{ display: 'flex' }}>
        {Array.from(new Set(this.tags.split(' '))).map(t => {
          return (
            <div
              key={`post_${this.id}_${t}`}
              className="tag"
              data-present={
                tags.find(tag => tag.name === t)
                  ? 'included'
                  : excludedTags.find(tag => tag.name === t)
                    ? 'excluded'
                    : ''
              }
              onClick={() => {
                api.getTag(t).then(handleTag);
              }}
            >
              {Post.decodeHTML(t)}
            </div>
          );
        })}
      </div>
    );
  }

  public asElement(
    api: APIHandler,
    tags: Tag[],
    excludedTags: Tag[],
    handleTag: (tag: Tag | undefined) => void,
    fs: boolean,
    idx: number,
    onClick?: () => void,
  ) {
    return this.file_url.includes('.mp4') ? (
      <Video
        key={this.id}
        post={this}
        tags={this.getTags(api, tags, excludedTags, handleTag)}
        fs={fs}
        onClick={onClick ?? (() => {})}
        idx={idx}
      />
    ) : (
      <Image
        key={this.id}
        post={this}
        fs={fs}
        onClick={onClick ?? (() => {})}
        tags={this.getTags(api, tags, excludedTags, handleTag)}
        idx={idx}
      />
    );
  }
}
