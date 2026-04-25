import { Link } from "react-router-dom";

const volumes = [
  {
    title: "第一卷",
    years: "1925-1937",
    theme: "中国革命的基本问题与土地革命经验",
    summary:
      "第一卷主要收入第一次国内革命战争和土地革命战争时期的重要著作，围绕中国社会阶级结构、农民运动、革命道路、根据地建设、军事斗争和思想方法展开。它展示了毛泽东对中国革命对象、动力、领导力量和道路选择的早期系统思考。",
    points: ["阶级分析与革命对象", "农民运动与群众力量", "农村根据地与武装斗争", "实践论、矛盾论等哲学方法"],
  },
  {
    title: "第二卷",
    years: "1937-1941",
    theme: "抗日战争战略与新民主主义理论",
    summary:
      "第二卷集中反映抗日战争初期到相持阶段的政治、军事和理论论述，重点讨论统一战线、持久战、人民战争、党的建设和新民主主义革命理论。它把中国抗战放入国内外力量对比中分析，强调长期斗争、人民动员和战略主动。",
    points: ["抗日民族统一战线", "持久战和人民战争", "新民主主义革命理论", "党的建设与政治路线"],
  },
  {
    title: "第三卷",
    years: "1941-1945",
    theme: "整风、根据地建设与抗战胜利前夜",
    summary:
      "第三卷主要收入延安整风时期和抗战后期的著作，强调马克思主义中国化、调查研究、文艺与人民的关系、党的作风建设和根据地治理。它体现了中国共产党在思想、组织、文化和政策层面的成熟过程。",
    points: ["整风运动与思想方法", "调查研究和实事求是", "文艺为人民服务", "根据地政权和群众工作"],
  },
  {
    title: "第四卷",
    years: "1945-1949",
    theme: "解放战争与新中国成立前的政治构想",
    summary:
      "第四卷收入抗战胜利后到新中国成立前的重要文章、报告和指示，聚焦解放战争战略、土地政策、统一战线、人民民主专政和建国方略。它呈现了从夺取全国胜利到筹建新政权的理论与实践转换。",
    points: ["解放战争战略", "土地改革与群众动员", "人民民主专政", "建国前夕的政治、经济和外交构想"],
  },
];

export default function GuidePage() {
  return (
    <div className="page-inner">
      <section className="page-title guide-title">
        <div>
          <div className="eyebrow">导读</div>
          <h1>《毛泽东选集》四册概览</h1>
          <div className="muted">从革命道路、抗战战略、整风建设到建国构想的知识入口</div>
        </div>
        <div className="metric-card">
          <strong>4</strong>
          <span>册</span>
        </div>
      </section>

      <section className="panel guide-overview">
        <h2>阅读线索</h2>
        <p>
          《毛泽东选集》通常按历史阶段编排，四册构成一条从中国革命基本问题的提出，到抗日战争战略展开，
          再到党的思想建设和解放战争胜利的连续脉络。阅读时可以抓住三条主线：社会分析与革命对象、
          战略路线与组织方法、群众动员与国家建设。
        </p>
      </section>

      <section className="guide-grid">
        {volumes.map((volume) => (
          <article className="panel guide-card" key={volume.title}>
            <div className="guide-card-head">
              <div>
                <div className="eyebrow">{volume.years}</div>
                <h2>{volume.title}</h2>
              </div>
              <span className="tag">{volume.theme}</span>
            </div>
            <p>{volume.summary}</p>
            <div className="guide-points">
              {volume.points.map((point) => (
                <span key={point}>{point}</span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="panel disclaimer-brief">
        <div>
          <div className="eyebrow">免责声明</div>
          <p>
            本项目用于文本学习、知识整理与可视化演示；事件、实体、关系和摘录可能包含自动抽取误差。
            涉及正式引用和历史判断时，请以原始文献、正式出版物和可靠研究资料为准。
          </p>
        </div>
        <Link to="/disclaimer">查看完整说明</Link>
      </section>
    </div>
  );
}
