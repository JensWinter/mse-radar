export type LevelGuidance = {
  level: number;
  text: string;
};

export class DoraCapability {
  private _name: string;

  constructor(
    public readonly id: string,
    public readonly slug: string,
    name: string,
    public description: string,
    public doraReference: string,
    public drillDownContent: LevelGuidance[],
  ) {
    this.validateSlug(slug);
    this.validateName(name);
    this.validateDrillDownContent(drillDownContent);
    this._name = name;
  }

  get name() {
    return this._name;
  }

  set name(value: string) {
    this.validateName(value);
    this._name = value;
  }

  private validateSlug(slug: string) {
    if (!slug.trim()) {
      throw new Error('Slug cannot be empty');
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error(
        'Slug can only contain lowercase letters, numbers and dashes',
      );
    }
  }

  private validateName(name: string) {
    if (!name.trim()) {
      throw new Error('Name cannot be empty');
    }
  }

  private validateDrillDownContent(content: LevelGuidance[]) {
    for (const item of content) {
      if (!Number.isInteger(item.level) || item.level < 1 || item.level > 5) {
        throw new Error('Guidance level must be an integer between 1 and 5');
      }
      if (!item.text.trim()) {
        throw new Error('Guidance text cannot be empty');
      }
    }
  }
}
