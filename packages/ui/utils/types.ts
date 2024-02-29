export type CssVariable = `--${string}`;

export type StyleProp<T extends CssVariable> = Partial<CSSStyleDeclaration> &
  Partial<Record<T, string>>;
