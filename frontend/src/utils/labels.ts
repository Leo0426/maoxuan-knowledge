export const typeLabel = (value: string) =>
  ({
    article: "文章",
    event: "事件",
    idea: "思想",
    entity: "实体",
    person: "人物",
    place: "地点",
    organization: "组织",
    concept: "概念",
  })[value] ?? value;

export const relationLabel = (value: string) =>
  ({
    proposes: "提出",
    contains: "包含",
    analyzes: "分析",
    describes: "描述",
    located_in: "位于",
    centers_on: "聚焦",
    uses: "使用",
    about: "关于",
    associated_with: "关联",
    requires: "需要",
    tests: "检验",
    mentions: "提及",
    opposes: "对立",
    supports: "支持",
    authored: "创作",
  })[value] ?? value;
