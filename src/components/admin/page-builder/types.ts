type BlockConfigValue = string | number | boolean | null | undefined | Record<string, unknown> | unknown[];

export interface BlockConfig {
  children?: Block[];
  [key: string]: BlockConfigValue | Block[] | undefined;
}

export interface Block {
  id: string;
  type: string;
  title: string;
  order: number;
  isVisible: boolean;
  config?: BlockConfig;
  placement?: "main" | "sidebar";
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}
