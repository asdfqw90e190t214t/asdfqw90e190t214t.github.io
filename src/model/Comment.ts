export default class Comment {
  constructor(
    public created_at: string,
    public post_id: number,
    public body: string,
    public creator: string,
    public id: number,
    public creator_id: number,
  ) {}

  public static fromXML(xml: HTMLElement): Comment {
    return new Comment(
      String(xml.getAttribute('created_at')),
      Number(xml.getAttribute('post_id')),
      String(xml.getAttribute('body')),
      String(xml.getAttribute('creator')),
      Number(xml.getAttribute('id')),
      Number(xml.getAttribute('creator_id')),
    );
  }
}
