export default class Tag {
  private static typeOrderMap: { [key: number]: number } = {
    3: 0,
    4: 1,
    1: 2,
    0: 3,
    5: 4,
    2: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
  };

  constructor(
    public type: number = 0,
    public count: number = 0,
    public name: string = '',
    public ambiguous: boolean = false,
    public id: number = 0,
    public excluded: boolean = false,
  ) {}

  public static fromHTML(tag: HTMLElement | null): Tag {
    if (!tag) {
      return new Tag();
    }
    return new Tag(
      Number.parseInt(tag.getAttribute('type') as string),
      Number.parseInt(tag.getAttribute('count') as string),
      tag.getAttribute('name') as string,
      (tag.getAttribute('ambiguous') as string) === 'true' ? true : false,
      Number.parseInt(tag.getAttribute('id') as string),
    );
  }

  public static fromObject(tag: Record<string, never>): Tag {
    return new Tag(tag.type, tag.count, tag.name, tag.ambiguous, tag.id, tag.excluded);
  }

  public static fromValues(
    type: number,
    count: number,
    name: string,
    ambiguous: boolean,
    id: number,
    excluded: boolean,
  ): Tag {
    return new Tag(type, count, name, ambiguous, id, excluded);
  }

  public getTypeName() {
    switch (this.type) {
      case 0:
        return 'general';
      case 1:
        return 'artist';
      case 3:
        return 'copyright';
      case 4:
        return 'character';
      case 5:
        return 'meta';
      default:
        return 'unknown';
    }
  }

  public static sort(a: Tag, b: Tag): number {
    if (Tag.typeOrderMap[a.type] < Tag.typeOrderMap[b.type]) {
      return -1;
    }
    if (Tag.typeOrderMap[a.type] > Tag.typeOrderMap[b.type]) {
      return 1;
    }
    return b.count - a.count;
  }

  public getColor() {
    switch (this.type) {
      case 0:
        return '#006bff';
      case 1:
        return 'red';
      case 3:
        return 'purple';
      case 4:
        return 'green';
      case 5:
        return 'orange';
      default:
        return 'yellow';
    }
  }
}
