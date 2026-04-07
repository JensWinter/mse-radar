export type GuidanceTier = 'beginning' | 'developing' | 'mature';

export type TieredGuidance = {
  tier: GuidanceTier;
  actionText: string;
  doraReference?: string;
};

export class DoraCapability {
  private _name: string;

  constructor(
    public readonly id: string,
    public readonly slug: string,
    name: string,
    public description: string,
    public doraReference: string,
    public drillDownContent: TieredGuidance[] = [],
  ) {
    this.validateSlug(slug);
    this.validateName(name);
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
}
